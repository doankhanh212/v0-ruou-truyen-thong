import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GoogleTagManager } from '@next/third-parties/google'
import { getSiteUrl, SITE_NAME } from '@/lib/seo'
import { getSettings } from '@/lib/settings'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Rượu truyền thống cao cấp — chưng cất từ dược liệu Việt Nam theo phương pháp truyền thống. Đạt ISO 22000:2018 & OCOP 4 sao.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: SITE_NAME,
    url: getSiteUrl(),
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#8B1A1A',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()
  const gtmId = settings.gtm_id.trim()
  const validGtmId = /^GTM-[A-Z0-9]+$/.test(gtmId) ? gtmId : null

  return (
    <html lang="vi" className={beVietnamPro.variable} data-scroll-behavior="smooth">
      {validGtmId && <GoogleTagManager gtmId={validGtmId} />}
      <body className="font-sans antialiased overflow-x-hidden">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
