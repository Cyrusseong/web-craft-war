'use client'

import { useEffect, useRef, useState } from 'react'
import { Application } from 'pixi.js'
import { GameRenderer } from '@/lib/game/GameRenderer'
import { GameHUD } from '@/components/hud/GameHUD'
import type { Resources } from '@web-craft-war/shared-types'
import { ROUND_DURATION } from '@web-craft-war/shared-types'

export default function GameCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<GameRenderer | null>(null)

  const [resources, setResources] = useState<Resources>({ html: 100, css: 80, js: 60 })
  const [roundTime, setRoundTime] = useState(ROUND_DURATION)
  const [unitCount, setUnitCount] = useState(0)

  useEffect(() => {
    if (!canvasRef.current) return

    let app: Application | null = null
    let destroyed = false

    async function init() {
      app = new Application()
      await app.init({
        background: 0x0a0a12,
        resizeTo: window,
        antialias: false,       // Pixel-perfect: no antialiasing
        resolution: 1,          // Pixel-perfect: fixed 1x resolution
        autoDensity: false,
        roundPixels: true,      // Snap to pixel grid
      })

      if (destroyed) {
        app.destroy(true)
        return
      }

      const canvas = app.canvas as HTMLCanvasElement
      canvas.style.imageRendering = 'pixelated'
      canvas.style.touchAction = 'none'
      canvasRef.current!.appendChild(canvas)

      const renderer = new GameRenderer(app)
      rendererRef.current = renderer
      renderer.init()

      app.ticker.add((ticker) => {
        const dt = ticker.deltaMS / 1000
        renderer.update(dt)
        setResources(renderer.getResources())
        setRoundTime(renderer.getRoundTime())
        setUnitCount(renderer.getUnitCount())
      })
    }

    init()

    return () => {
      destroyed = true
      if (rendererRef.current) {
        rendererRef.current.destroy()
        rendererRef.current = null
      }
      if (app) {
        app.destroy(true)
      }
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <div ref={canvasRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />
      <GameHUD
        resources={resources}
        roundTime={roundTime}
        unitCount={unitCount}
        onProduceUnit={(typeId) => {
          rendererRef.current?.requestProduceUnit(typeId)
        }}
      />
    </div>
  )
}
