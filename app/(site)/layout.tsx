import { PageViewTracker } from '@/components/page-view-tracker'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FloatingButtons } from '@/components/floating-buttons'
import { getSettings } from '@/lib/settings'

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()

  return (
    <>
      <PageViewTracker />
      <Header zaloUrl={settings.zalo_url} />
      <main className="min-h-screen">{children}</main>
      <Footer fanpageUrl={settings.fanpage_url} />
      <FloatingButtons />
    </>
  )
}
