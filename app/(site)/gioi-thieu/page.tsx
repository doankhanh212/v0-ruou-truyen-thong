import type { Metadata } from 'next'
import { Story } from '@/components/story'
import { SocialProof } from '@/components/social-proof'
import { getSeoBySlug } from '@/lib/seo-pages'
import { absoluteUrl, SITE_NAME } from '@/lib/seo'

const FALLBACK_TITLE = 'Giới thiệu — Rượu truyền thống'
const FALLBACK_DESC =
  'Câu chuyện rượu truyền thống — kế thừa bí quyết chế tác rượu thuốc truyền thống từ đời xưa của người dân miền Nam Việt Nam.'

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoBySlug('gioi-thieu')
  const title = seo?.title || FALLBACK_TITLE
  const description = seo?.description || FALLBACK_DESC
  const ogImage = seo?.ogImage ? absoluteUrl(seo.ogImage) : undefined
  return {
    title,
    description,
    keywords: seo?.keywords || undefined,
    alternates: { canonical: '/gioi-thieu' },
    openGraph: {
      type: 'website',
      url: absoluteUrl('/gioi-thieu'),
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

export default function GioiThieuPage() {
  return (
    <div className="bg-white">
      <Story />
      <SocialProof />
    </div>
  )
}
