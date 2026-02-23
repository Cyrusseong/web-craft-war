'use client'

import { useEffect, useState } from 'react'
import type { Resources, UnitTypeId } from '@web-craft-war/shared-types'
import { MAX_UNITS_PER_PLAYER } from '@web-craft-war/game-logic'
import styles from './GameHUD.module.css'

interface GameHUDProps {
  resources: Resources
  roundTime: number
  unitCount: number
  onProduceUnit: (typeId: UnitTypeId) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function GameHUD({ resources, roundTime, unitCount, onProduceUnit }: GameHUDProps) {
  const [showTouchHint, setShowTouchHint] = useState(false)

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setShowTouchHint(isTouch)
    if (isTouch) {
      const timer = setTimeout(() => setShowTouchHint(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div className={styles.hud}>
      {/* 상단: 리소스 & 타이머 */}
      <div className={styles.topBar}>
        <div className={styles.resources}>
          <div className={`${styles.resourceItem} ${styles.html}`}>
            <span className={styles.resourceIcon}>&lt;/&gt;</span>
            <span className={styles.resourceValue}>{Math.floor(resources.html)}</span>
          </div>
          <div className={`${styles.resourceItem} ${styles.css}`}>
            <span className={styles.resourceIcon}>{'{ }'}</span>
            <span className={styles.resourceValue}>{Math.floor(resources.css)}</span>
          </div>
          <div className={`${styles.resourceItem} ${styles.js}`}>
            <span className={styles.resourceIcon}>f()</span>
            <span className={styles.resourceValue}>{Math.floor(resources.js)}</span>
          </div>
        </div>
        <div className={styles.timer}>{formatTime(roundTime)}</div>
        <div className={styles.unitCount}>
          {unitCount}/{MAX_UNITS_PER_PLAYER}
        </div>
      </div>

      {/* 모바일 터치 안내 */}
      {showTouchHint && (
        <div className={styles.touchHint}>
          TAP: SELECT &middot; DRAG: PAN &middot; PINCH: ZOOM
        </div>
      )}

      {/* 하단: 유닛 생산 */}
      <div className={styles.bottomBar}>
        <button
          className={`${styles.produceBtn} ${styles.htmlBtn}`}
          onClick={() => onProduceUnit('html_soldier')}
        >
          <span className={styles.btnIcon}>&lt;div&gt;</span>
          <span className={styles.btnCost}>H:30</span>
        </button>
        <button
          className={`${styles.produceBtn} ${styles.cssBtn}`}
          onClick={() => onProduceUnit('css_guardian')}
        >
          <span className={styles.btnIcon}>.guard</span>
          <span className={styles.btnCost}>C:40</span>
        </button>
        <button
          className={`${styles.produceBtn} ${styles.jsBtn}`}
          onClick={() => onProduceUnit('js_striker')}
        >
          <span className={styles.btnIcon}>fn()</span>
          <span className={styles.btnCost}>J:50</span>
        </button>
      </div>
    </div>
  )
}
