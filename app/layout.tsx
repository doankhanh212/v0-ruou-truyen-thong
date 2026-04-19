import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PageViewTracker } from '@/components/page-view-tracker'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FloatingButtons } from '@/components/floating-buttons'
import { Chatbot } from '@/components/chatbot'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
})

export const metadata: Metadata = {
  title: 'Rượu Truyền Thống Cửu Long Mỹ Tửu — Somo Gold',
  description: 'Rượu truyền thống cao cấp Cửu Long Mỹ Tửu — thương hiệu Somo Gold. Chưng cất từ dược liệu Việt Nam theo phương pháp truyền thống. Đạt ISO 22000:2018 & OCOP 4 sao.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="font-sans antialiased">
        <PageViewTracker />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingButtons />
        <Chatbot />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
