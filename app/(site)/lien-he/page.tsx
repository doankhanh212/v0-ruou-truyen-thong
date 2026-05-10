import type { Metadata } from 'next'
import { Contact } from '@/components/contact'
import { getSeoBySlug } from '@/lib/seo-pages'
import { getStaticPage } from '@/lib/static-pages'
import { absoluteUrl, SITE_NAME } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const FALLBACK_TITLE = 'Liên hệ — Rượu truyền thống'
const FALLBACK_DESC = 'Liên hệ mua rượu truyền thống. Hotline, Zalo, email — tư vấn miễn phí, giao hàng toàn quốc.'

export async function generateMetadata(): Promise<Metadata> {
  const [seo, page] = await Promise.all([
    getSeoBySlug('lien-he'),
    getStaticPage('lien-he'),
  ])
  const title = seo?.title || page?.metaTitle || FALLBACK_TITLE
  const description = seo?.description || page?.metaDescription || FALLBACK_DESC
  const ogImage = seo?.ogImage ? absoluteUrl(seo.ogImage) : undefined
  return {
    title,
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: '/lien-he' },
    openGraph: {
      type: 'website',
      url: absoluteUrl('/lien-he'),
      title,
      description,
      siteName: SITE_NAME,
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function LienHePage() {
  const page = await getStaticPage('lien-he')

  if (page?.content) {
    return (
      <div className="bg-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">{page.title}</h1>
          <div
            className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <Contact />
    </div>
  )
}
