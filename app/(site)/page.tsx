import type { Metadata } from 'next'
import { HomeSectionScroll } from '@/components/home-section-scroll'
import { Hero } from '@/components/hero'
import { Trust } from '@/components/trust'
import { Products } from '@/components/products'
import { CTA } from '@/components/cta'
import { getActiveBanners } from '@/lib/banners'
import { getSections } from '@/lib/sections'
import { getSeoByPath } from '@/lib/seo-pages'
import { getSettings, getSystemConfig } from '@/lib/settings'
import { absoluteUrl, metaDescription, metaTitle, SITE_NAME } from '@/lib/seo'

interface HomeProps {
  searchParams: Promise<{
    section?: string
  }>
}

export async function generateMetadata(): Promise<Metadata> {
  const [sections, seo, settings] = await Promise.all([
    getSections(),
    getSeoByPath('/'),
    getSettings(),
  ])
  const systemConfig = getSystemConfig(settings)
  const title =
    seo?.title ||
    metaTitle(sections['home.hero.title']?.text || sections['home.hero.title_accent']?.text) ||
    SITE_NAME
  const description =
    seo?.description ||
    metaDescription(sections['home.hero.subtitle']?.text) ||
    `${SITE_NAME} — rượu truyền thống Việt Nam.`
  const ogImage = seo?.ogImage || systemConfig.defaultOgImage

  return {
    title,
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      url: absoluteUrl('/'),
      title: `${title} — ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
      images: ogImage ? [{ url: absoluteUrl(ogImage), alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
      images: ogImage ? [absoluteUrl(ogImage)] : undefined,
    },
  }
}

export default async function Home({ searchParams }: HomeProps) {
  const { section } = await searchParams
  const [banners, sections] = await Promise.all([
    getActiveBanners('home_hero'),
    getSections(),
  ])
  const heroBanners = banners.map((b) => ({
    imageUrl: b.imageUrl,
    title: b.title,
    linkUrl: b.linkUrl,
  }))

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/android-chrome-512x512.png'),
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
        banners={heroBanners}
        sections={sections}
      />
      <Trust sections={sections} />
      <Products sections={sections} />
      <CTA sections={sections} />
    </div>
  )
}
