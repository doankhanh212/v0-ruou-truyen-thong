import { PageViewTracker } from '@/components/page-view-tracker'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FloatingButtons } from '@/components/floating-buttons'
import { ChatbotWidget } from '@/components/chatbot-widget'
import { getSettings } from '@/lib/settings'

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()

  let navLinks: { href: string; label: string }[] | undefined
  try {
    const raw = settings.header_nav_links
    if (raw) navLinks = JSON.parse(raw)
  } catch { /* use default */ }

  return (
    <>
      <PageViewTracker />
      <Header
        zaloUrl={settings.zalo_url}
        siteName={settings.header_site_name}
        navLinks={navLinks}
        zaloLabel={settings.header_zalo_label}
      />
      <main className="min-h-screen">{children}</main>
      <Footer
        fanpageUrl={settings.fanpage_url}
        brandName={settings.footer_brand_name}
        brandDesc={settings.footer_brand_desc}
        copyright={settings.footer_copyright}
        phone={settings.footer_phone}
        email={settings.footer_email}
        address={settings.footer_address}
        showFanpage={settings.footer_show_fanpage !== '0'}
      />
      <FloatingButtons />
      <ChatbotWidget />
    </>
  )
}
