'use client'

import dynamic from 'next/dynamic'

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100dvh',
      backgroundColor: '#0a0a12',
      gap: '1rem',
    }}>
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '0.625rem',
        color: '#00ff88',
        textShadow: '0 0 8px rgba(0, 255, 136, 0.4)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}>
        LOADING...
      </div>
      <div style={{
        width: '120px',
        height: '6px',
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '40%',
          height: '100%',
          background: '#00ff88',
          animation: 'loading 1.5s ease-in-out infinite',
        }} />
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  ),
})

export default function GamePage() {
  return <GameCanvas />
}
