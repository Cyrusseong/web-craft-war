'use client'

import { useEffect, useRef, useState } from 'react'
import { Application, Container } from 'pixi.js'
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
        background: '#0a0e17',
        resizeTo: window,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })

      if (destroyed) {
        app.destroy(true)
        return
      }

      canvasRef.current!.appendChild(app.canvas as HTMLCanvasElement)

      const renderer = new GameRenderer(app)
      rendererRef.current = renderer
      renderer.init()

      // 게임 루프: 리소스, 타이머 업데이트
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
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
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
