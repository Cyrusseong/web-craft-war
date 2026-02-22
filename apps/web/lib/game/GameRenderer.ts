import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { Resources, UnitTypeId, MapNodeDef, NodeOwner } from '@web-craft-war/shared-types'
import {
  RESOURCE_CAP,
  BASE_PRODUCTION_RATES,
  CAPTURE_BONUS_MULTIPLIER,
  UNIT_DEFINITIONS,
  PAGE_GRADE_STATS,
  ROUND_DURATION,
} from '@web-craft-war/shared-types'
import {
  canAffordUnit,
  spendResources,
  TICK_RATE,
  MAX_UNITS_PER_PLAYER,
} from '@web-craft-war/game-logic'

/** 그리드 셀 크기 (px) */
const CELL_SIZE = 48
const MAP_COLS = 20
const MAP_ROWS = 14

interface GameUnit {
  id: string
  typeId: UnitTypeId
  owner: 'player1' | 'player2'
  x: number
  y: number
  hp: number
  maxHp: number
  graphic: Graphics
  targetX: number
  targetY: number
  selected: boolean
}

export class GameRenderer {
  private app: Application
  private worldContainer: Container
  private mapLayer: Container
  private unitLayer: Container
  private uiLayer: Container

  private resources: Resources = { html: 100, css: 80, js: 60 }
  private roundTime = ROUND_DURATION
  private units: GameUnit[] = []
  private mapNodes: MapNodeDef[] = []
  private nextUnitId = 1

  // Camera pan
  private cameraX = 0
  private cameraY = 0
  private isDragging = false
  private lastPointerX = 0
  private lastPointerY = 0

  // Selection
  private selectionBox: Graphics | null = null
  private selectStartX = 0
  private selectStartY = 0
  private isSelecting = false

  constructor(app: Application) {
    this.app = app
    this.worldContainer = new Container()
    this.mapLayer = new Container()
    this.unitLayer = new Container()
    this.uiLayer = new Container()
  }

  init() {
    this.worldContainer.addChild(this.mapLayer)
    this.worldContainer.addChild(this.unitLayer)
    this.app.stage.addChild(this.worldContainer)
    this.app.stage.addChild(this.uiLayer)

    this.generateMap()
    this.renderMap()
    this.setupInput()

    // Center camera on map
    this.cameraX = -(MAP_COLS * CELL_SIZE - this.app.screen.width) / 2
    this.cameraY = -(MAP_ROWS * CELL_SIZE - this.app.screen.height) / 2
    this.worldContainer.x = this.cameraX
    this.worldContainer.y = this.cameraY
  }

  private generateMap() {
    // Symmetric 1v1 map: player bases on left/right
    this.mapNodes = [
      // Player 1 base
      { id: 'base_p1', grade: 'html', x: 1, y: 7, owner: 'player1', captureProgress: 100, capturedBy: 'player1' },
      // Player 2 base
      { id: 'base_p2', grade: 'html', x: 18, y: 7, owner: 'player2', captureProgress: 100, capturedBy: 'player2' },
      // Neutral pages
      { id: 'n1', grade: 'html', x: 5, y: 3, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n2', grade: 'css', x: 5, y: 11, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n3', grade: 'html', x: 15, y: 3, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n4', grade: 'css', x: 15, y: 11, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n5', grade: 'js', x: 8, y: 5, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n6', grade: 'js', x: 12, y: 9, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      // Boss node (center)
      { id: 'boss', grade: 'fullstack', x: 10, y: 7, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
    ]
  }

  private renderMap() {
    // Grid background
    const gridGraphic = new Graphics()
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const shade = (row + col) % 2 === 0 ? 0x111827 : 0x0f1520
        gridGraphic.rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        gridGraphic.fill(shade)
      }
    }
    this.mapLayer.addChild(gridGraphic)

    // Map nodes
    for (const node of this.mapNodes) {
      this.renderMapNode(node)
    }
  }

  private renderMapNode(node: MapNodeDef) {
    const g = new Graphics()
    const px = node.x * CELL_SIZE
    const py = node.y * CELL_SIZE
    const size = node.grade === 'fullstack' ? CELL_SIZE * 1.5 : CELL_SIZE

    const colors: Record<string, number> = {
      html: 0xe34c26,
      css: 0x264de4,
      js: 0xf0db4f,
      fullstack: 0x8b5cf6,
    }

    const ownerAlpha = node.owner === 'neutral' ? 0.3 : 0.6
    const color = colors[node.grade] ?? 0x666666

    g.roundRect(px - size / 2 + CELL_SIZE / 2, py - size / 2 + CELL_SIZE / 2, size, size, 6)
    g.fill({ color, alpha: ownerAlpha })
    g.stroke({ color, width: 2, alpha: 0.8 })

    const label = new Text({
      text: PAGE_GRADE_STATS[node.grade].label.split(' ')[0],
      style: new TextStyle({
        fontSize: 10,
        fill: 0xffffff,
        fontWeight: 'bold',
      }),
    })
    label.anchor.set(0.5)
    label.x = px + CELL_SIZE / 2
    label.y = py + CELL_SIZE / 2
    g.addChild(label)

    this.mapLayer.addChild(g)
  }

  private setupInput() {
    const canvas = this.app.canvas as HTMLCanvasElement
    canvas.addEventListener('contextmenu', (e) => e.preventDefault())

    // Right-click drag for camera pan
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button === 2) {
        this.isDragging = true
        this.lastPointerX = e.clientX
        this.lastPointerY = e.clientY
      } else if (e.button === 0) {
        // Left click: start selection box
        this.isSelecting = true
        this.selectStartX = e.clientX
        this.selectStartY = e.clientY

        if (!this.selectionBox) {
          this.selectionBox = new Graphics()
          this.uiLayer.addChild(this.selectionBox)
        }
      }
    })

    canvas.addEventListener('pointermove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastPointerX
        const dy = e.clientY - this.lastPointerY
        this.cameraX += dx
        this.cameraY += dy
        this.worldContainer.x = this.cameraX
        this.worldContainer.y = this.cameraY
        this.lastPointerX = e.clientX
        this.lastPointerY = e.clientY
      }

      if (this.isSelecting && this.selectionBox) {
        this.selectionBox.clear()
        const x = Math.min(this.selectStartX, e.clientX)
        const y = Math.min(this.selectStartY, e.clientY)
        const w = Math.abs(e.clientX - this.selectStartX)
        const h = Math.abs(e.clientY - this.selectStartY)
        this.selectionBox.rect(x, y, w, h)
        this.selectionBox.fill({ color: 0x3b82f6, alpha: 0.15 })
        this.selectionBox.stroke({ color: 0x3b82f6, width: 1, alpha: 0.6 })
      }
    })

    canvas.addEventListener('pointerup', (e) => {
      if (e.button === 2) {
        this.isDragging = false

        // Right-click: move selected units
        const selectedUnits = this.units.filter(u => u.selected && u.owner === 'player1')
        if (selectedUnits.length > 0) {
          const worldX = (e.clientX - this.cameraX) / CELL_SIZE
          const worldY = (e.clientY - this.cameraY) / CELL_SIZE

          for (const unit of selectedUnits) {
            unit.targetX = Math.max(0, Math.min(MAP_COLS - 1, worldX))
            unit.targetY = Math.max(0, Math.min(MAP_ROWS - 1, worldY))
          }
        }
      }

      if (e.button === 0) {
        this.isSelecting = false
        if (this.selectionBox) {
          // Select units in box
          const x1 = Math.min(this.selectStartX, e.clientX) - this.cameraX
          const y1 = Math.min(this.selectStartY, e.clientY) - this.cameraY
          const x2 = Math.max(this.selectStartX, e.clientX) - this.cameraX
          const y2 = Math.max(this.selectStartY, e.clientY) - this.cameraY

          for (const unit of this.units) {
            const ux = unit.x * CELL_SIZE + CELL_SIZE / 2
            const uy = unit.y * CELL_SIZE + CELL_SIZE / 2
            unit.selected = unit.owner === 'player1' && ux >= x1 && ux <= x2 && uy >= y1 && uy <= y2
          }

          this.selectionBox.clear()
        }
      }
    })
  }

  update(dt: number) {
    // Resource production
    const capturedCount = this.mapNodes.filter(n => n.owner === 'player1').length - 1 // minus base
    const multiplier = 1 + Math.max(0, capturedCount) * CAPTURE_BONUS_MULTIPLIER
    this.resources.html = Math.min(RESOURCE_CAP, this.resources.html + BASE_PRODUCTION_RATES.html * multiplier * dt)
    this.resources.css = Math.min(RESOURCE_CAP, this.resources.css + BASE_PRODUCTION_RATES.css * multiplier * dt)
    this.resources.js = Math.min(RESOURCE_CAP, this.resources.js + BASE_PRODUCTION_RATES.js * multiplier * dt)

    // Round timer
    this.roundTime = Math.max(0, this.roundTime - dt)

    // Update units
    for (const unit of this.units) {
      this.updateUnit(unit, dt)
    }

    // Simple AI: produce units for player2 periodically
    this.simpleAI(dt)
  }

  private aiTimer = 0

  private simpleAI(dt: number) {
    this.aiTimer += dt
    if (this.aiTimer < 5) return // Every 5 seconds
    this.aiTimer = 0

    const p2Units = this.units.filter(u => u.owner === 'player2')
    if (p2Units.length >= 10) return

    const types: UnitTypeId[] = ['html_soldier', 'css_guardian', 'js_striker']
    const typeId = types[Math.floor(Math.random() * types.length)]
    const baseNode = this.mapNodes.find(n => n.id === 'base_p2')!

    this.spawnUnit(typeId, 'player2', baseNode.x, baseNode.y)

    // Move AI units toward center
    for (const unit of p2Units) {
      if (unit.targetX === unit.x && unit.targetY === unit.y) {
        unit.targetX = 10 + (Math.random() - 0.5) * 4
        unit.targetY = 7 + (Math.random() - 0.5) * 4
      }
    }
  }

  private updateUnit(unit: GameUnit, dt: number) {
    const def = UNIT_DEFINITIONS[unit.typeId]
    const speed = def.speed * CELL_SIZE * dt

    const dx = unit.targetX - unit.x
    const dy = unit.targetY - unit.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > 0.1) {
      const moveX = (dx / dist) * speed / CELL_SIZE
      const moveY = (dy / dist) * speed / CELL_SIZE
      unit.x += moveX
      unit.y += moveY
    }

    // Check combat with enemies
    for (const other of this.units) {
      if (other.owner === unit.owner || other.hp <= 0) continue
      const cdx = other.x - unit.x
      const cdy = other.y - unit.y
      const cdist = Math.sqrt(cdx * cdx + cdy * cdy)

      if (cdist < 1.5) {
        // Apply damage
        other.hp -= def.atk * dt
        if (other.hp <= 0) {
          other.hp = 0
        }
      }
    }

    // Remove dead units
    this.units = this.units.filter(u => {
      if (u.hp <= 0) {
        this.unitLayer.removeChild(u.graphic)
        u.graphic.destroy()
        return false
      }
      return true
    })

    // Update graphic position
    this.renderUnit(unit)
  }

  private renderUnit(unit: GameUnit) {
    const g = unit.graphic
    g.clear()

    const px = unit.x * CELL_SIZE + CELL_SIZE / 2
    const py = unit.y * CELL_SIZE + CELL_SIZE / 2
    const size = 8

    const colors = {
      html_soldier: 0xe34c26, html_knight: 0xe34c26, html_titan: 0xe34c26,
      css_guardian: 0x264de4, css_mage: 0x264de4, css_archmage: 0x264de4,
      js_striker: 0xf0db4f, js_assassin: 0xf0db4f, js_overlord: 0xf0db4f,
      api_connector: 0x8b5cf6, debug_drone: 0x8b5cf6, firewall: 0x8b5cf6,
    }
    const color = colors[unit.typeId] ?? 0xffffff

    // Unit body
    g.circle(px, py, size)
    g.fill(color)

    // Owner outline
    if (unit.owner === 'player1') {
      g.circle(px, py, size + 2)
      g.stroke({ color: 0x22c55e, width: 1.5 })
    } else {
      g.circle(px, py, size + 2)
      g.stroke({ color: 0xef4444, width: 1.5 })
    }

    // Selection indicator
    if (unit.selected) {
      g.circle(px, py, size + 5)
      g.stroke({ color: 0x3b82f6, width: 2, alpha: 0.8 })
    }

    // HP bar
    const hpRatio = unit.hp / unit.maxHp
    const hpBarWidth = 16
    g.rect(px - hpBarWidth / 2, py - size - 6, hpBarWidth, 3)
    g.fill({ color: 0x1f2937, alpha: 0.8 })
    g.rect(px - hpBarWidth / 2, py - size - 6, hpBarWidth * hpRatio, 3)
    g.fill(hpRatio > 0.5 ? 0x22c55e : hpRatio > 0.25 ? 0xeab308 : 0xef4444)

    g.x = 0
    g.y = 0
  }

  private spawnUnit(typeId: UnitTypeId, owner: 'player1' | 'player2', x: number, y: number) {
    const def = UNIT_DEFINITIONS[typeId]
    const g = new Graphics()
    this.unitLayer.addChild(g)

    const unit: GameUnit = {
      id: `unit_${this.nextUnitId++}`,
      typeId,
      owner,
      x: x + (Math.random() - 0.5),
      y: y + (Math.random() - 0.5),
      hp: def.hp,
      maxHp: def.hp,
      graphic: g,
      targetX: x,
      targetY: y,
      selected: false,
    }

    this.units.push(unit)
    this.renderUnit(unit)
  }

  requestProduceUnit(typeId: UnitTypeId) {
    const playerUnits = this.units.filter(u => u.owner === 'player1')
    if (playerUnits.length >= MAX_UNITS_PER_PLAYER) return
    if (!canAffordUnit(this.resources, typeId)) return

    this.resources = spendResources(this.resources, typeId)
    const baseNode = this.mapNodes.find(n => n.id === 'base_p1')!
    this.spawnUnit(typeId, 'player1', baseNode.x, baseNode.y)
  }

  getResources(): Resources {
    return { ...this.resources }
  }

  getRoundTime(): number {
    return this.roundTime
  }

  getUnitCount(): number {
    return this.units.filter(u => u.owner === 'player1').length
  }

  destroy() {
    for (const unit of this.units) {
      unit.graphic.destroy()
    }
    this.units = []
  }
}
