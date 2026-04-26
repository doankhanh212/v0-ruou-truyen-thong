import type { Metadata } from 'next'
import { HomeSectionScroll } from '@/components/home-section-scroll'
import { Hero } from '@/components/hero'
import { Trust } from '@/components/trust'
import { Products } from '@/components/products'
import { CTA } from '@/components/cta'
import { getPrimaryBanner } from '@/lib/banners'
import { getSections } from '@/lib/sections'
import { absoluteUrl, metaDescription, metaTitle, SITE_NAME } from '@/lib/seo'

interface HomeProps {
  searchParams: Promise<{
    section?: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  const sections = await getSections()
  const title =
    metaTitle(sections['home.hero.title']?.text || sections['home.hero.title_accent']?.text) ||
    SITE_NAME
  const description =
    metaDescription(sections['home.hero.subtitle']?.text) ||
    `${SITE_NAME} — rượu truyền thống Việt Nam.`

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      url: absoluteUrl('/'),
      title: `${title} — ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
    },
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const { section } = await searchParams
  const [banner, sections] = await Promise.all([
    getPrimaryBanner('home_hero'),
    getSections(),
  ])

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/icon.svg'),
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: absoluteUrl('/'),
  }

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeSectionScroll section={section} />
      <Hero
        bannerUrl={banner?.imageUrl}
        bannerAlt={banner?.title}
        sections={sections}
      />
      <Trust />
      <Products />
      <CTA sections={sections} />
    </div>
  )
}
