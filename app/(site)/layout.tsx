import { PageViewTracker } from '@/components/page-view-tracker'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FloatingContact } from '@/components/floating-contact'
import { ChatbotWidget } from '@/components/chatbot-widget'
import { AgeVerificationPopup } from '@/components/age-verification-popup'
import { getFooterConfig, getSettings, getSystemConfig } from '@/lib/settings'

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()
  const footerConfig = getFooterConfig(settings)
  const systemConfig = getSystemConfig(settings)

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
        colorPreset={settings.header_color_preset}
      />
      <main className="min-h-screen">{children}</main>
      <Footer config={footerConfig} />
      <FloatingContact
        zaloUrl={systemConfig.floatingZaloUrl || settings.zalo_url}
        messengerUrl={systemConfig.floatingMessengerUrl}
      />
      <ChatbotWidget />
      <AgeVerificationPopup enabled={systemConfig.agePopupEnabled} />
    </>
  )
}
