import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'
import type { Resources, UnitTypeId, MapNodeDef } from '@web-craft-war/shared-types'
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
  MAX_UNITS_PER_PLAYER,
} from '@web-craft-war/game-logic'

/** 그리드 셀 크기 (px) — 레트로 16px 배수 */
const CELL_SIZE = 32
const MAP_COLS = 24
const MAP_ROWS = 16

/** 레트로 컬러 팔레트 */
const PALETTE = {
  bg: 0x0a0a12,
  gridDark: 0x0e0e1a,
  gridLight: 0x121222,
  gridLine: 0x1a1a30,
  html: 0xe34c26,
  css: 0x264de4,
  js: 0xf0db4f,
  fullstack: 0x9b59b6,
  player1: 0x00ff88,
  player2: 0xff3355,
  neutral: 0x555577,
  selection: 0x00aaff,
  hpGood: 0x00ff88,
  hpMid: 0xffaa00,
  hpLow: 0xff3333,
  white: 0xffffff,
}

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
  attackCooldown: number
  animFrame: number
  animTimer: number
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

  // Camera
  private cameraX = 0
  private cameraY = 0
  private zoom = 1
  private minZoom = 0.5
  private maxZoom = 2.5

  // Pointer drag (camera pan)
  private isDragging = false
  private lastPointerX = 0
  private lastPointerY = 0
  private dragDistanceSq = 0

  // Selection box (mouse)
  private selectionBox: Graphics | null = null
  private selectStartX = 0
  private selectStartY = 0
  private isSelecting = false

  // Touch
  private isTouchDevice = false
  private touchStartTime = 0
  private pinchStartDist = 0
  private pinchStartZoom = 1
  private activeTouches: Map<number, { x: number; y: number }> = new Map()

  // Node graphic refs
  private nodeGraphics: Map<string, Graphics> = new Map()

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

    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    this.generateMap()
    this.renderMap()
    this.setupInput()

    // Center camera
    const mapW = MAP_COLS * CELL_SIZE
    const mapH = MAP_ROWS * CELL_SIZE
    this.cameraX = (this.app.screen.width - mapW) / 2
    this.cameraY = (this.app.screen.height - mapH) / 2
    this.applyCamera()
  }

  // ─── Map ──────────────────────────────────────────────────────

  private generateMap() {
    this.mapNodes = [
      { id: 'base_p1', grade: 'html', x: 2, y: 8, owner: 'player1', captureProgress: 100, capturedBy: 'player1' },
      { id: 'base_p2', grade: 'html', x: 21, y: 8, owner: 'player2', captureProgress: 100, capturedBy: 'player2' },
      { id: 'n1', grade: 'html', x: 6, y: 4, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n2', grade: 'css', x: 6, y: 12, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n3', grade: 'html', x: 18, y: 4, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n4', grade: 'css', x: 18, y: 12, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n5', grade: 'js', x: 10, y: 6, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'n6', grade: 'js', x: 14, y: 10, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
      { id: 'boss', grade: 'fullstack', x: 12, y: 8, owner: 'neutral', captureProgress: 0, capturedBy: 'neutral' },
    ]
  }

  private renderMap() {
    const gridG = new Graphics()

    // Checkerboard tiles
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const shade = (row + col) % 2 === 0 ? PALETTE.gridDark : PALETTE.gridLight
        gridG.rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        gridG.fill(shade)
      }
    }

    // Grid lines
    gridG.setStrokeStyle({ width: 1, color: PALETTE.gridLine, alpha: 0.3 })
    for (let row = 0; row <= MAP_ROWS; row++) {
      gridG.moveTo(0, row * CELL_SIZE)
      gridG.lineTo(MAP_COLS * CELL_SIZE, row * CELL_SIZE)
      gridG.stroke()
    }
    for (let col = 0; col <= MAP_COLS; col++) {
      gridG.moveTo(col * CELL_SIZE, 0)
      gridG.lineTo(col * CELL_SIZE, MAP_ROWS * CELL_SIZE)
      gridG.stroke()
    }

    this.mapLayer.addChild(gridG)

    for (const node of this.mapNodes) {
      this.renderMapNode(node)
    }
  }

  private renderMapNode(node: MapNodeDef) {
    const g = new Graphics()
    const px = node.x * CELL_SIZE
    const py = node.y * CELL_SIZE
    const isBase = node.id.startsWith('base_')
    const isBoss = node.id === 'boss'
    const size = isBoss ? CELL_SIZE * 2 : isBase ? CELL_SIZE * 1.5 : CELL_SIZE

    const gradeColor: Record<string, number> = {
      html: PALETTE.html, css: PALETTE.css, js: PALETTE.js, fullstack: PALETTE.fullstack,
    }
    const ownerColor: Record<string, number> = {
      player1: PALETTE.player1, player2: PALETTE.player2, neutral: PALETTE.neutral,
    }

    const color = gradeColor[node.grade] ?? PALETTE.neutral
    const oColor = ownerColor[node.owner] ?? PALETTE.neutral
    const cx = px + CELL_SIZE / 2
    const cy = py + CELL_SIZE / 2

    // Outer border
    g.rect(cx - size / 2, cy - size / 2, size, size)
    g.fill({ color: PALETTE.bg, alpha: 0.8 })
    g.stroke({ color: oColor, width: 2, alpha: 0.9 })

    // Inner fill
    const inner = size - 6
    g.rect(cx - inner / 2, cy - inner / 2, inner, inner)
    g.fill({ color, alpha: node.owner === 'neutral' ? 0.2 : 0.45 })

    // Corner pixels
    const cp = 3
    for (const [cxx, cyy] of [
      [cx - size / 2, cy - size / 2],
      [cx + size / 2 - cp, cy - size / 2],
      [cx - size / 2, cy + size / 2 - cp],
      [cx + size / 2 - cp, cy + size / 2 - cp],
    ]) {
      g.rect(cxx, cyy, cp, cp).fill({ color, alpha: 0.6 })
    }

    // Label
    const label = new Text({
      text: isBoss ? 'FULL' : PAGE_GRADE_STATS[node.grade].label.split(' ')[0],
      style: new TextStyle({
        fontFamily: '"Press Start 2P", monospace',
        fontSize: isBoss ? 7 : 6,
        fill: PALETTE.white,
        align: 'center',
      }),
    })
    label.anchor.set(0.5)
    label.x = cx
    label.y = cy
    g.addChild(label)

    // Capture bar
    if (!isBase && node.captureProgress > 0) {
      const bW = size - 4
      const bH = 3
      const bY = cy + size / 2 + 2
      g.rect(cx - bW / 2, bY, bW, bH).fill({ color: 0x000000, alpha: 0.5 })
      g.rect(cx - bW / 2, bY, bW * (node.captureProgress / 100), bH).fill(oColor)
    }

    this.mapLayer.addChild(g)
    this.nodeGraphics.set(node.id, g)
  }

  // ─── Input ────────────────────────────────────────────────────

  private setupInput() {
    const canvas = this.app.canvas as HTMLCanvasElement
    canvas.addEventListener('contextmenu', (e) => e.preventDefault())

    canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e))
    canvas.addEventListener('pointermove', (e) => this.onPointerMove(e))
    canvas.addEventListener('pointerup', (e) => this.onPointerUp(e))
    canvas.addEventListener('pointercancel', (e) => this.onPointerUp(e))

    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false })
    canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false })
    canvas.addEventListener('touchend', () => { this.pinchStartDist = 0 })

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      this.applyZoom(e.deltaY > 0 ? 0.9 : 1.1, e.clientX, e.clientY)
    }, { passive: false })
  }

  private onPointerDown(e: PointerEvent) {
    this.activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (this.activeTouches.size > 1) return

    if (e.button === 2 || (this.isTouchDevice && this.activeTouches.size === 1)) {
      this.isDragging = true
      this.dragDistanceSq = 0
      this.lastPointerX = e.clientX
      this.lastPointerY = e.clientY
      this.touchStartTime = Date.now()
    }

    if (e.button === 0 && !this.isTouchDevice) {
      this.isSelecting = true
      this.selectStartX = e.clientX
      this.selectStartY = e.clientY
      if (!this.selectionBox) {
        this.selectionBox = new Graphics()
        this.uiLayer.addChild(this.selectionBox)
      }
    }
  }

  private onPointerMove(e: PointerEvent) {
    this.activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (this.activeTouches.size > 1) return

    if (this.isDragging) {
      const dx = e.clientX - this.lastPointerX
      const dy = e.clientY - this.lastPointerY
      this.dragDistanceSq += dx * dx + dy * dy
      this.cameraX += dx
      this.cameraY += dy
      this.applyCamera()
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
      this.selectionBox.fill({ color: PALETTE.selection, alpha: 0.1 })
      this.selectionBox.stroke({ color: PALETTE.selection, width: 2, alpha: 0.8 })
    }
  }

  private onPointerUp(e: PointerEvent) {
    this.activeTouches.delete(e.pointerId)

    if (this.isTouchDevice && e.button === 0) {
      const tapDur = Date.now() - this.touchStartTime
      const wasTap = tapDur < 300 && this.dragDistanceSq < 100
      if (wasTap) {
        this.handleTap(e.clientX, e.clientY)
      } else if (this.dragDistanceSq < 100) {
        this.handleMoveCommand(e.clientX, e.clientY)
      }
    }

    if (e.button === 2 && !this.isTouchDevice) {
      this.isDragging = false
      if (this.dragDistanceSq < 25) {
        this.handleMoveCommand(e.clientX, e.clientY)
      }
    }

    if (e.button === 0 && !this.isTouchDevice) {
      this.isSelecting = false
      if (this.selectionBox) {
        const x1 = (Math.min(this.selectStartX, e.clientX) - this.cameraX) / this.zoom
        const y1 = (Math.min(this.selectStartY, e.clientY) - this.cameraY) / this.zoom
        const x2 = (Math.max(this.selectStartX, e.clientX) - this.cameraX) / this.zoom
        const y2 = (Math.max(this.selectStartY, e.clientY) - this.cameraY) / this.zoom

        for (const unit of this.units) {
          const ux = unit.x * CELL_SIZE + CELL_SIZE / 2
          const uy = unit.y * CELL_SIZE + CELL_SIZE / 2
          unit.selected = unit.owner === 'player1' && ux >= x1 && ux <= x2 && uy >= y1 && uy <= y2
        }
        this.selectionBox.clear()
      }
    }

    this.isDragging = false
  }

  private onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault()
      const [t1, t2] = [e.touches[0], e.touches[1]]
      this.pinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      this.pinchStartZoom = this.zoom
    }
  }

  private onTouchMove(e: TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault()
      const [t1, t2] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
      const midX = (t1.clientX + t2.clientX) / 2
      const midY = (t1.clientY + t2.clientY) / 2
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom,
        this.pinchStartZoom * (dist / this.pinchStartDist)
      ))
      const ratio = newZoom / this.zoom
      this.cameraX = midX - (midX - this.cameraX) * ratio
      this.cameraY = midY - (midY - this.cameraY) * ratio
      this.zoom = newZoom
      this.applyCamera()
    }
  }

  private handleTap(cx: number, cy: number) {
    const wx = (cx - this.cameraX) / this.zoom / CELL_SIZE
    const wy = (cy - this.cameraY) / this.zoom / CELL_SIZE
    let tapped = false

    for (const unit of this.units) {
      const d = Math.hypot(unit.x - wx, unit.y - wy)
      if (d < 1 && unit.owner === 'player1') {
        unit.selected = !unit.selected
        tapped = true
      }
    }

    if (!tapped) {
      const sel = this.units.filter(u => u.selected && u.owner === 'player1')
      if (sel.length > 0) {
        for (const u of sel) {
          u.targetX = Math.max(0, Math.min(MAP_COLS - 1, wx))
          u.targetY = Math.max(0, Math.min(MAP_ROWS - 1, wy))
        }
      } else {
        for (const u of this.units) u.selected = false
      }
    }
  }

  private handleMoveCommand(cx: number, cy: number) {
    const sel = this.units.filter(u => u.selected && u.owner === 'player1')
    if (sel.length === 0) return
    const wx = (cx - this.cameraX) / this.zoom / CELL_SIZE
    const wy = (cy - this.cameraY) / this.zoom / CELL_SIZE
    for (const u of sel) {
      u.targetX = Math.max(0, Math.min(MAP_COLS - 1, wx))
      u.targetY = Math.max(0, Math.min(MAP_ROWS - 1, wy))
    }
  }

  private applyZoom(factor: number, pivotX: number, pivotY: number) {
    const nz = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor))
    const r = nz / this.zoom
    this.cameraX = pivotX - (pivotX - this.cameraX) * r
    this.cameraY = pivotY - (pivotY - this.cameraY) * r
    this.zoom = nz
    this.applyCamera()
  }

  private applyCamera() {
    this.worldContainer.x = this.cameraX
    this.worldContainer.y = this.cameraY
    this.worldContainer.scale.set(this.zoom)
  }

  // ─── Game Loop ────────────────────────────────────────────────

  update(dt: number) {
    const capturedCount = this.mapNodes.filter(n => n.owner === 'player1').length - 1
    const mult = 1 + Math.max(0, capturedCount) * CAPTURE_BONUS_MULTIPLIER
    this.resources.html = Math.min(RESOURCE_CAP, this.resources.html + BASE_PRODUCTION_RATES.html * mult * dt)
    this.resources.css = Math.min(RESOURCE_CAP, this.resources.css + BASE_PRODUCTION_RATES.css * mult * dt)
    this.resources.js = Math.min(RESOURCE_CAP, this.resources.js + BASE_PRODUCTION_RATES.js * mult * dt)

    this.roundTime = Math.max(0, this.roundTime - dt)

    for (const unit of this.units) this.updateUnit(unit, dt)

    this.units = this.units.filter(u => {
      if (u.hp <= 0) {
        this.unitLayer.removeChild(u.graphic)
        u.graphic.destroy()
        return false
      }
      return true
    })

    this.simpleAI(dt)
  }

  private aiTimer = 0

  private simpleAI(dt: number) {
    this.aiTimer += dt
    if (this.aiTimer < 5) return
    this.aiTimer = 0

    const p2 = this.units.filter(u => u.owner === 'player2')
    if (p2.length >= 10) return

    const types: UnitTypeId[] = ['html_soldier', 'css_guardian', 'js_striker']
    const typeId = types[Math.floor(Math.random() * types.length)]
    const base = this.mapNodes.find(n => n.id === 'base_p2')!
    this.spawnUnit(typeId, 'player2', base.x, base.y)

    for (const u of p2) {
      if (Math.abs(u.targetX - u.x) < 0.5 && Math.abs(u.targetY - u.y) < 0.5) {
        u.targetX = 12 + (Math.random() - 0.5) * 6
        u.targetY = 8 + (Math.random() - 0.5) * 6
      }
    }
  }

  // ─── Unit Update ──────────────────────────────────────────────

  private updateUnit(unit: GameUnit, dt: number) {
    const def = UNIT_DEFINITIONS[unit.typeId]

    // Movement
    const dx = unit.targetX - unit.x
    const dy = unit.targetY - unit.y
    const dist = Math.hypot(dx, dy)
    if (dist > 0.15) {
      const spd = def.speed * dt
      unit.x += (dx / dist) * spd
      unit.y += (dy / dist) * spd
    }

    // Animation
    unit.animTimer += dt
    if (unit.animTimer > 0.3) {
      unit.animTimer = 0
      unit.animFrame = (unit.animFrame + 1) % 2
    }

    // Combat
    unit.attackCooldown = Math.max(0, unit.attackCooldown - dt)
    if (unit.attackCooldown <= 0) {
      for (const other of this.units) {
        if (other.owner === unit.owner || other.hp <= 0) continue
        if (Math.hypot(other.x - unit.x, other.y - unit.y) < 1.5) {
          other.hp -= def.atk * 0.2
          unit.attackCooldown = 0.5
          break
        }
      }
    }

    this.renderUnit(unit)
  }

  // ─── Pixel Art Unit Rendering ─────────────────────────────────

  private renderUnit(unit: GameUnit) {
    const g = unit.graphic
    g.clear()

    const px = unit.x * CELL_SIZE + CELL_SIZE / 2
    const py = unit.y * CELL_SIZE + CELL_SIZE / 2

    const typeColors: Record<string, number> = {
      html_soldier: PALETTE.html, html_knight: PALETTE.html, html_titan: PALETTE.html,
      css_guardian: PALETTE.css, css_mage: PALETTE.css, css_archmage: PALETTE.css,
      js_striker: PALETTE.js, js_assassin: PALETTE.js, js_overlord: PALETTE.js,
      api_connector: PALETTE.fullstack, debug_drone: PALETTE.fullstack, firewall: PALETTE.fullstack,
    }
    const color = typeColors[unit.typeId] ?? PALETTE.white
    const oc = unit.owner === 'player1' ? PALETTE.player1 : PALETTE.player2
    const cls = unit.typeId.split('_')[0]

    if (cls === 'html') this.drawHtmlUnit(g, px, py, color, oc, unit.animFrame)
    else if (cls === 'css') this.drawCssUnit(g, px, py, color, oc, unit.animFrame)
    else if (cls === 'js') this.drawJsUnit(g, px, py, color, oc, unit.animFrame)
    else this.drawSpecialUnit(g, px, py, color, oc, unit.animFrame)

    // Selection corners
    if (unit.selected) {
      const s = 10; const c = 3
      g.rect(px - s, py - s, c, c).fill(PALETTE.selection)
      g.rect(px + s - c, py - s, c, c).fill(PALETTE.selection)
      g.rect(px - s, py + s - c, c, c).fill(PALETTE.selection)
      g.rect(px + s - c, py + s - c, c, c).fill(PALETTE.selection)
      g.rect(px - s, py - s, c, s * 2).fill({ color: PALETTE.selection, alpha: 0.3 })
      g.rect(px + s - c, py - s, c, s * 2).fill({ color: PALETTE.selection, alpha: 0.3 })
    }

    // HP bar (segmented)
    const hpR = unit.hp / unit.maxHp
    const bW = 14; const bH = 2; const segs = 5; const sW = bW / segs
    const hpC = hpR > 0.5 ? PALETTE.hpGood : hpR > 0.25 ? PALETTE.hpMid : PALETTE.hpLow
    g.rect(px - bW / 2, py - 11, bW, bH).fill({ color: 0x000000, alpha: 0.7 })
    const filled = Math.ceil(segs * hpR)
    for (let i = 0; i < filled; i++) {
      g.rect(px - bW / 2 + i * sW, py - 11, sW - 1, bH).fill(hpC)
    }
  }

  /** HTML 유닛: < > 브래킷 형태 */
  private drawHtmlUnit(g: Graphics, px: number, py: number, color: number, oc: number, fr: number) {
    const p = 2; const b = fr === 1 ? -1 : 0
    g.rect(px - 3 * p, py - 2 * p + b, p, p).fill(color)
    g.rect(px - 4 * p, py - p + b, p, p).fill(color)
    g.rect(px - 4 * p, py + b, p, p).fill(color)
    g.rect(px - 3 * p, py + p + b, p, p).fill(color)
    g.rect(px - 2 * p, py - 2 * p + b, 4 * p, 4 * p).fill(color)
    g.rect(px + 2 * p, py - 2 * p + b, p, p).fill(color)
    g.rect(px + 3 * p, py - p + b, p, p).fill(color)
    g.rect(px + 3 * p, py + b, p, p).fill(color)
    g.rect(px + 2 * p, py + p + b, p, p).fill(color)
    g.rect(px - p, py + b, 2 * p, 2 * p).fill({ color: 0x000000, alpha: 0.25 })
    g.rect(px - p / 2, py - 3 * p + b, p, p).fill(oc)
  }

  /** CSS 유닛: 방패 형태 */
  private drawCssUnit(g: Graphics, px: number, py: number, color: number, oc: number, fr: number) {
    const p = 2; const b = fr === 1 ? -1 : 0
    g.rect(px - 3 * p, py - 3 * p + b, 6 * p, 2 * p).fill(color)
    g.rect(px - 3 * p, py - p + b, 6 * p, 2 * p).fill(color)
    g.rect(px - 2 * p, py + p + b, 4 * p, p).fill(color)
    g.rect(px - p, py + 2 * p + b, 2 * p, p).fill(color)
    g.rect(px - 2 * p, py - 2 * p + b, 4 * p, p).fill({ color: PALETTE.white, alpha: 0.2 })
    g.rect(px - p, py + b, 2 * p, p).fill({ color: 0x000000, alpha: 0.2 })
    g.rect(px - p / 2, py - p / 2 + b, p, p).fill(oc)
  }

  /** JS 유닛: 번개 형태 */
  private drawJsUnit(g: Graphics, px: number, py: number, color: number, oc: number, fr: number) {
    const p = 2; const b = fr === 1 ? 1 : 0
    g.rect(px + p, py - 3 * p + b, 2 * p, p).fill(color)
    g.rect(px, py - 2 * p + b, 2 * p, p).fill(color)
    g.rect(px - p, py - p + b, 3 * p, p).fill(color)
    g.rect(px, py + b, 2 * p, p).fill(color)
    g.rect(px - p, py + p + b, 2 * p, p).fill(color)
    g.rect(px - 2 * p, py + 2 * p + b, 2 * p, p).fill(color)
    g.rect(px + p, py - 3 * p + b, p, p).fill({ color: PALETTE.white, alpha: 0.3 })
    g.rect(px - p / 2, py - 4 * p + b, p, p).fill(oc)
  }

  /** 특수 유닛: 다이아몬드 형태 */
  private drawSpecialUnit(g: Graphics, px: number, py: number, color: number, oc: number, fr: number) {
    const p = 2; const b = fr === 1 ? -1 : 0
    g.rect(px - p / 2, py - 3 * p + b, p, p).fill(color)
    g.rect(px - p, py - 2 * p + b, 2 * p, p).fill(color)
    g.rect(px - 2 * p, py - p + b, 4 * p, p).fill(color)
    g.rect(px - 2 * p, py + b, 4 * p, p).fill(color)
    g.rect(px - p, py + p + b, 2 * p, p).fill(color)
    g.rect(px - p / 2, py + 2 * p + b, p, p).fill(color)
    g.rect(px - p / 2, py - p / 2 + b, p, p).fill(oc)
  }

  // ─── Spawning ─────────────────────────────────────────────────

  private spawnUnit(typeId: UnitTypeId, owner: 'player1' | 'player2', x: number, y: number) {
    const def = UNIT_DEFINITIONS[typeId]
    const g = new Graphics()
    this.unitLayer.addChild(g)

    const unit: GameUnit = {
      id: `unit_${this.nextUnitId++}`,
      typeId, owner,
      x: x + (Math.random() - 0.5) * 0.8,
      y: y + (Math.random() - 0.5) * 0.8,
      hp: def.hp, maxHp: def.hp,
      graphic: g,
      targetX: x, targetY: y,
      selected: false,
      attackCooldown: 0,
      animFrame: 0,
      animTimer: Math.random(),
    }

    this.units.push(unit)
    this.renderUnit(unit)
  }

  // ─── Public API ───────────────────────────────────────────────

  requestProduceUnit(typeId: UnitTypeId) {
    const pUnits = this.units.filter(u => u.owner === 'player1')
    if (pUnits.length >= MAX_UNITS_PER_PLAYER) return
    if (!canAffordUnit(this.resources, typeId)) return
    this.resources = spendResources(this.resources, typeId)
    const base = this.mapNodes.find(n => n.id === 'base_p1')!
    this.spawnUnit(typeId, 'player1', base.x, base.y)
  }

  getResources(): Resources { return { ...this.resources } }
  getRoundTime(): number { return this.roundTime }
  getUnitCount(): number { return this.units.filter(u => u.owner === 'player1').length }

  destroy() {
    for (const u of this.units) u.graphic.destroy()
    this.units = []
    this.nodeGraphics.clear()
  }
}
