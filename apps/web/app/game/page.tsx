'use client'

import dynamic from 'next/dynamic'

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text-muted)',
      fontSize: '1.2rem',
    }}>
      게임 로딩 중...
    </div>
  ),
})

export default function GamePage() {
  return <GameCanvas />
}
