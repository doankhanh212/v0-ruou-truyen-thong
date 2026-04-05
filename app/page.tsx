import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Products } from '@/components/products'
import { Pricing } from '@/components/pricing'
import { Story } from '@/components/story'
import { Trust } from '@/components/trust'
import { SocialProof } from '@/components/social-proof'
import { Contact } from '@/components/contact'
import { CTA } from '@/components/cta'
import { Footer } from '@/components/footer'
import { Chatbot } from '@/components/chatbot'

export default function Home() {
  return (
    <main className="bg-white">
      <Header />
      <Hero />
      <Products />
      <Pricing />
      <Story />
      <Trust />
      <SocialProof />
      <Contact />
      <CTA />
      <Footer />
      <Chatbot />
    </main>
  )
}
