import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { Categories } from '@/components/categories'
import { Products } from '@/components/products'
import { Story } from '@/components/story'
import { Benefits } from '@/components/benefits'
import { Pricing } from '@/components/pricing'
import { CTA } from '@/components/cta'
import { Footer } from '@/components/footer'
import { HerbsShowcase } from '@/components/herbs-showcase'

export default function Home() {
  return (
    <main className="bg-white">
      <Header />
      <Hero />
      <Categories />
      <HerbsShowcase />
      <Products />
      <Pricing />
      <Story />
      <Benefits />
      <CTA />
      <Footer />
    </main>
  )
}
