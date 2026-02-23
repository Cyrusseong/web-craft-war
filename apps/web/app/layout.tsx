import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Web Craft War',
  description: 'HTML, CSS, JS 리소스를 채집해 유닛을 생산하고 상대 웹 페이지를 점령하는 레트로 브라우저 RTS',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <div className="crt-overlay" aria-hidden="true" />
      </body>
    </html>
  )
}
