import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Trust } from '@/components/trust'
import { Products } from '@/components/products'
import { Pricing } from '@/components/pricing'
import { SocialProof } from '@/components/social-proof'
import { Story } from '@/components/story'
import { CTA } from '@/components/cta'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'
import { Chatbot } from '@/components/chatbot'
import { FloatingButtons } from '@/components/floating-buttons'

export default function Home() {
  return (
    <main className="bg-white">
      <Header />
      <Hero />
      <Trust />
      <Products />
      <Pricing />
      <SocialProof />
      <Story />
      <CTA />
      <Contact />
      <Footer />
      <FloatingButtons />
      <Chatbot />
    </main>
  )
}
