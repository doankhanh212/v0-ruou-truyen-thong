import type { Metadata } from 'next'
import { Contact } from '@/components/contact'
import { getSeoBySlug } from '@/lib/seo-pages'
import { absoluteUrl, SITE_NAME } from '@/lib/seo'

const FALLBACK_TITLE = 'Liên hệ — Rượu truyền thống'
const FALLBACK_DESC = 'Liên hệ mua rượu truyền thống. Hotline, Zalo, email — tư vấn miễn phí, giao hàng toàn quốc.'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoBySlug('lien-he')
  const title = seo?.title || FALLBACK_TITLE
  const description = seo?.description || FALLBACK_DESC
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

export default function LienHePage() {
  return (
    <div className="bg-white">
      <Contact />
    </div>
  )
}
