export default function LeaderboardPage() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      height: '100vh',
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
        랭킹 보드
      </h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        시즌 1 준비 중...
      </p>
    </main>
  )
}
