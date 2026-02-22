import { Room, Client } from 'colyseus'
import { Schema, MapSchema, type, defineTypes } from '@colyseus/schema'
import {
  UNIT_DEFINITIONS,
  RESOURCE_CAP,
  BASE_PRODUCTION_RATES,
  CAPTURE_BONUS_MULTIPLIER,
  type UnitTypeId,
} from '@web-craft-war/shared-types'
import {
  canAffordUnit,
  TICK_INTERVAL,
  ROUND_DURATION_SEC,
  MAX_UNITS_PER_PLAYER,
  calculateDamage,
} from '@web-craft-war/game-logic'

// ===== Colyseus Schemas =====

class ResourcesSchema extends Schema {
  @type('number') html: number = 100
  @type('number') css: number = 80
  @type('number') js: number = 60
}

class UnitSchema extends Schema {
  @type('string') id: string = ''
  @type('string') typeId: string = ''
  @type('string') owner: string = ''
  @type('number') x: number = 0
  @type('number') y: number = 0
  @type('number') hp: number = 0
  @type('number') maxHp: number = 0
  @type('number') targetX: number = 0
  @type('number') targetY: number = 0
}

class MapNodeSchema extends Schema {
  @type('string') id: string = ''
  @type('string') grade: string = ''
  @type('number') x: number = 0
  @type('number') y: number = 0
  @type('string') owner: string = 'neutral'
  @type('number') captureProgress: number = 0
}

class PlayerSchema extends Schema {
  @type('string') id: string = ''
  @type('string') sessionId: string = ''
  @type(ResourcesSchema) resources = new ResourcesSchema()
  @type('number') unitCount: number = 0
}

class GameState extends Schema {
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>()
  @type({ map: UnitSchema }) units = new MapSchema<UnitSchema>()
  @type({ map: MapNodeSchema }) mapNodes = new MapSchema<MapNodeSchema>()
  @type('number') roundTime: number = ROUND_DURATION_SEC
  @type('string') phase: string = 'waiting'
}

// ===== Game Room =====

export class GameRoom extends Room<GameState> {
  maxClients = 2
  private nextUnitId = 1

  onCreate() {
    this.setState(new GameState())
    this.initMap()

    // 20 TPS game loop
    this.setSimulationInterval((dt) => this.update(dt), TICK_INTERVAL)

    // Message handlers
    this.onMessage('produce_unit', (client, data: { unitType: UnitTypeId }) => {
      this.handleProduceUnit(client, data.unitType)
    })

    this.onMessage('move_units', (client, data: { unitIds: string[]; targetX: number; targetY: number }) => {
      this.handleMoveUnits(client, data.unitIds, data.targetX, data.targetY)
    })
  }

  onJoin(client: Client) {
    const playerNum = this.state.players.size + 1
    const playerId = `player${playerNum}`

    const player = new PlayerSchema()
    player.id = playerId
    player.sessionId = client.sessionId
    player.resources.html = 100
    player.resources.css = 80
    player.resources.js = 60

    this.state.players.set(client.sessionId, player)

    console.log(`[GameRoom] ${client.sessionId} joined as ${playerId}`)

    if (this.state.players.size === 2) {
      this.state.phase = 'playing'
      this.broadcast('game_start', {})
    }
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId)

    if (this.state.phase === 'playing') {
      this.state.phase = 'finished'
      this.broadcast('game_result', {
        winnerId: Array.from(this.state.players.keys())[0] ?? '',
        reason: 'opponent_left',
      })
    }
  }

  private initMap() {
    const nodes = [
      { id: 'base_p1', grade: 'html', x: 1, y: 7, owner: 'player1' },
      { id: 'base_p2', grade: 'html', x: 18, y: 7, owner: 'player2' },
      { id: 'n1', grade: 'html', x: 5, y: 3, owner: 'neutral' },
      { id: 'n2', grade: 'css', x: 5, y: 11, owner: 'neutral' },
      { id: 'n3', grade: 'html', x: 15, y: 3, owner: 'neutral' },
      { id: 'n4', grade: 'css', x: 15, y: 11, owner: 'neutral' },
      { id: 'n5', grade: 'js', x: 8, y: 5, owner: 'neutral' },
      { id: 'n6', grade: 'js', x: 12, y: 9, owner: 'neutral' },
      { id: 'boss', grade: 'fullstack', x: 10, y: 7, owner: 'neutral' },
    ]

    for (const n of nodes) {
      const schema = new MapNodeSchema()
      schema.id = n.id
      schema.grade = n.grade
      schema.x = n.x
      schema.y = n.y
      schema.owner = n.owner
      schema.captureProgress = n.owner !== 'neutral' ? 100 : 0
      this.state.mapNodes.set(n.id, schema)
    }
  }

  private update(dt: number) {
    if (this.state.phase !== 'playing') return

    const dtSec = dt / 1000

    // Update round timer
    this.state.roundTime = Math.max(0, this.state.roundTime - dtSec)
    if (this.state.roundTime <= 0) {
      this.endGame()
      return
    }

    // Resource production per player
    this.state.players.forEach((player) => {
      const capturedCount = this.countCapturedNodes(player.id)
      const multiplier = 1 + capturedCount * CAPTURE_BONUS_MULTIPLIER
      player.resources.html = Math.min(RESOURCE_CAP, player.resources.html + BASE_PRODUCTION_RATES.html * multiplier * dtSec)
      player.resources.css = Math.min(RESOURCE_CAP, player.resources.css + BASE_PRODUCTION_RATES.css * multiplier * dtSec)
      player.resources.js = Math.min(RESOURCE_CAP, player.resources.js + BASE_PRODUCTION_RATES.js * multiplier * dtSec)
    })

    // Update units (movement + combat)
    this.updateUnits(dtSec)
  }

  private countCapturedNodes(playerId: string): number {
    let count = 0
    this.state.mapNodes.forEach((node) => {
      if (node.owner === playerId && !node.id.startsWith('base_')) {
        count++
      }
    })
    return count
  }

  private updateUnits(dt: number) {
    const unitsToRemove: string[] = []

    this.state.units.forEach((unit) => {
      const def = UNIT_DEFINITIONS[unit.typeId as UnitTypeId]
      if (!def) return

      // Movement
      const dx = unit.targetX - unit.x
      const dy = unit.targetY - unit.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 0.1) {
        const speed = def.speed * dt
        unit.x += (dx / dist) * speed
        unit.y += (dy / dist) * speed
      }

      // Combat: attack nearest enemy
      let nearestEnemy: UnitSchema | null = null
      let nearestDist = Infinity

      this.state.units.forEach((other) => {
        if (other.owner === unit.owner || other.hp <= 0) return
        const cdx = other.x - unit.x
        const cdy = other.y - unit.y
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
        if (cdist < nearestDist) {
          nearestDist = cdist
          nearestEnemy = other
        }
      })

      if (nearestEnemy && nearestDist < 1.5) {
        const result = calculateDamage(
          unit.typeId as UnitTypeId,
          (nearestEnemy as UnitSchema).typeId as UnitTypeId,
          def.atk,
        )
        ;(nearestEnemy as UnitSchema).hp -= result.finalDamage * dt
      }
    })

    // Remove dead units
    this.state.units.forEach((unit, key) => {
      if (unit.hp <= 0) {
        unitsToRemove.push(key)
      }
    })

    for (const key of unitsToRemove) {
      this.state.units.delete(key)
    }

    // Update unit counts
    this.state.players.forEach((player) => {
      let count = 0
      this.state.units.forEach((unit) => {
        if (unit.owner === player.id) count++
      })
      player.unitCount = count
    })
  }

  private handleProduceUnit(client: Client, unitType: UnitTypeId) {
    const player = this.state.players.get(client.sessionId)
    if (!player) return

    if (player.unitCount >= MAX_UNITS_PER_PLAYER) return

    const resources = {
      html: player.resources.html,
      css: player.resources.css,
      js: player.resources.js,
    }

    if (!canAffordUnit(resources, unitType)) return

    const cost = UNIT_DEFINITIONS[unitType].cost
    player.resources.html -= cost.html ?? 0
    player.resources.css -= cost.css ?? 0
    player.resources.js -= cost.js ?? 0

    // Find player's base
    const baseId = player.id === 'player1' ? 'base_p1' : 'base_p2'
    const base = this.state.mapNodes.get(baseId)
    if (!base) return

    const unit = new UnitSchema()
    const id = `u${this.nextUnitId++}`
    unit.id = id
    unit.typeId = unitType
    unit.owner = player.id
    unit.x = base.x + (Math.random() - 0.5)
    unit.y = base.y + (Math.random() - 0.5)
    unit.hp = UNIT_DEFINITIONS[unitType].hp
    unit.maxHp = UNIT_DEFINITIONS[unitType].hp
    unit.targetX = unit.x
    unit.targetY = unit.y

    this.state.units.set(id, unit)
  }

  private handleMoveUnits(client: Client, unitIds: string[], targetX: number, targetY: number) {
    const player = this.state.players.get(client.sessionId)
    if (!player) return

    for (const unitId of unitIds) {
      const unit = this.state.units.get(unitId)
      if (unit && unit.owner === player.id) {
        unit.targetX = targetX
        unit.targetY = targetY
      }
    }
  }

  private endGame() {
    this.state.phase = 'finished'

    // Determine winner by captured nodes
    let p1Nodes = 0
    let p2Nodes = 0
    this.state.mapNodes.forEach((node) => {
      if (node.owner === 'player1') p1Nodes++
      if (node.owner === 'player2') p2Nodes++
    })

    this.broadcast('game_result', {
      winnerId: p1Nodes >= p2Nodes ? 'player1' : 'player2',
      reason: 'time_up',
      p1Nodes,
      p2Nodes,
    })
  }
}
