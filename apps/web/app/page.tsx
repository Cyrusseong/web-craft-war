import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      gap: '2rem',
      textAlign: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(ellipse at center, #12121e 0%, #0a0a12 70%)',
    }}>
      {/* ASCII Art Title */}
      <pre style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 'clamp(0.35rem, 1.2vw, 0.6rem)',
        color: '#00ff88',
        textShadow: '0 0 10px rgba(0, 255, 136, 0.5), 0 0 20px rgba(0, 255, 136, 0.2)',
        lineHeight: 1.4,
        textAlign: 'center',
        letterSpacing: '0.05em',
      }}>
{`
 █   █ █▀▀ █▀▀▄
 █ █ █ █▀▀ █▀▀▄
 ▀▀ ▀▀ ▀▀▀ ▀▀▀

 █▀▀ █▀▀▄ █▀▀█ █▀▀ ▀▀█▀▀
 █   █▄▄▀ █▄▄█ █▀▀   █
 ▀▀▀ ▀ ▀▀ ▀  ▀ ▀     ▀

 █   █ █▀▀█ █▀▀▄
 █ █ █ █▄▄█ █▄▄▀
 ▀▀ ▀▀ ▀  ▀ ▀ ▀▀
`}
      </pre>

      {/* Subtitle */}
      <p style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 'clamp(0.4rem, 1vw, 0.6rem)',
        color: '#6a6a8a',
        maxWidth: '600px',
        lineHeight: 2,
      }}>
        <span style={{ color: '#e34c26' }}>&lt;HTML&gt;</span>{' '}
        <span style={{ color: '#264de4' }}>{'{CSS}'}</span>{' '}
        <span style={{ color: '#f0db4f' }}>JS()</span>
        <br />
        리소스를 채집하고 유닛을 생산해
        <br />
        상대 웹 페이지를 점령하라
      </p>

      {/* Decorative separator */}
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '0.4rem',
        color: '#2a2a4a',
        letterSpacing: '0.3em',
      }}>
        {'═'.repeat(20)}
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '280px',
      }}>
        <Link
          href="/game"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '0.75rem',
            padding: '1rem 2rem',
            backgroundColor: '#1a1a2e',
            color: '#00ff88',
            border: '2px solid #00ff88',
            boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 255, 136, 0.2)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            textAlign: 'center',
            display: 'block',
          }}
        >
          {'> '}PLAY
        </Link>
        <Link
          href="/leaderboard"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '0.5rem',
            padding: '0.75rem 2rem',
            backgroundColor: '#1a1a2e',
            color: '#6a6a8a',
            border: '2px solid #2a2a4a',
            boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            textAlign: 'center',
            display: 'block',
          }}
        >
          RANKING
        </Link>
      </div>

      {/* Footer info */}
      <div style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '0.35rem',
        color: '#2a2a4a',
        marginTop: '1rem',
        lineHeight: 2,
      }}>
        BROWSER RTS v0.1
        <br />
        <span style={{ color: '#555577' }}>PRESS START TO PLAY</span>
      </div>
    </main>
  )
}
