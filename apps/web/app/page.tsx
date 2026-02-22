import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '2rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>
        Web Craft War
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '600px' }}>
        HTML, CSS, JS 리소스를 채집해 유닛을 생산하고
        <br />
        상대 웹 페이지를 점령하는 브라우저 RTS
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link
          href="/game"
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          플레이
        </Link>
        <Link
          href="/leaderboard"
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text)',
            borderRadius: '0.5rem',
            fontSize: '1.1rem',
            fontWeight: 600,
            border: '1px solid #374151',
          }}
        >
          랭킹
        </Link>
      </div>
    </main>
  )
}
