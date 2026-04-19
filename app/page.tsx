import { HomeSectionScroll } from '@/components/home-section-scroll'
import { Hero } from '@/components/hero'
import { Trust } from '@/components/trust'
import { Products } from '@/components/products'
import { CTA } from '@/components/cta'

interface HomeProps {
  searchParams: Promise<{
    section?: string
  }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { section } = await searchParams

  return (
    <div className="bg-white">
      <HomeSectionScroll section={section} />
      <Hero />
      <Trust />
      <Products />
      <CTA />
    </div>
  )
}
