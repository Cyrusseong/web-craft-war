'use client'

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
  return (
    <div className={styles.hud}>
      {/* 상단: 리소스 & 타이머 */}
      <div className={styles.topBar}>
        <div className={styles.resources}>
          <span className={styles.html}>&lt;/&gt; {Math.floor(resources.html)}</span>
          <span className={styles.css}>{'{ }'} {Math.floor(resources.css)}</span>
          <span className={styles.js}>( ) {Math.floor(resources.js)}</span>
        </div>
        <div className={styles.timer}>{formatTime(roundTime)}</div>
        <div className={styles.unitCount}>
          유닛: {unitCount}/{MAX_UNITS_PER_PLAYER}
        </div>
      </div>

      {/* 하단: 유닛 생산 패널 */}
      <div className={styles.bottomBar}>
        <button
          className={`${styles.produceBtn} ${styles.htmlBtn}`}
          onClick={() => onProduceUnit('html_soldier')}
          title="HTML 솔저 (H:30)"
        >
          &lt;div&gt;
        </button>
        <button
          className={`${styles.produceBtn} ${styles.cssBtn}`}
          onClick={() => onProduceUnit('css_guardian')}
          title="CSS 가디언 (C:40)"
        >
          {'{shield}'}
        </button>
        <button
          className={`${styles.produceBtn} ${styles.jsBtn}`}
          onClick={() => onProduceUnit('js_striker')}
          title="JS 스트라이커 (J:50)"
        >
          func()
        </button>
      </div>
    </div>
  )
}
