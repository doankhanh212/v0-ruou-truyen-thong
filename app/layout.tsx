import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { PageViewTracker } from '@/components/page-view-tracker'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FloatingButtons } from '@/components/floating-buttons'
import { Chatbot } from '@/components/chatbot'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rượu Truyền Thống - Sản Phẩm Thuốc Truyền Thống Việt Nam',
  description: 'Khám phá rượu truyền thống - sản phẩm thuốc truyền thống được chế tác từ các loại dược liệu quý hiếm, hỗ trợ sức khỏe toàn diện.',
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
    <html lang="vi">
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
