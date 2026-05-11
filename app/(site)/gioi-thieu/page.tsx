import type { Metadata } from 'next'
import sanitizeHtml from 'sanitize-html'
import { Story } from '@/components/story'
import { SocialProof } from '@/components/social-proof'
import { getSeoBySlug } from '@/lib/seo-pages'
import { getStaticPage } from '@/lib/static-pages'
import { absoluteUrl, SITE_NAME } from '@/lib/seo'
import { PAGE_HTML_OPTIONS } from '@/lib/sanitize-page-html'

export const dynamic = 'force-dynamic'

const FALLBACK_TITLE = 'Giới thiệu — Rượu truyền thống'
const FALLBACK_DESC =
  'Câu chuyện rượu truyền thống — kế thừa bí quyết chế tác rượu thuốc truyền thống từ đời xưa của người dân miền Nam Việt Nam.'

export async function generateMetadata(): Promise<Metadata> {
  const [seo, page] = await Promise.all([
    getSeoBySlug('gioi-thieu'),
    getStaticPage('gioi-thieu'),
  ])
  const title = seo?.title || page?.metaTitle || FALLBACK_TITLE
  const description = seo?.description || page?.metaDescription || FALLBACK_DESC
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

export default async function GioiThieuPage() {
  const page = await getStaticPage('gioi-thieu')

  if (page?.content) {
    return (
      <div className="bg-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">{page.title}</h1>
          <div
            className="prose prose-lg max-w-none prose-headings:text-primary prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content, PAGE_HTML_OPTIONS) }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <Story />
      <SocialProof />
    </div>
  )
}
