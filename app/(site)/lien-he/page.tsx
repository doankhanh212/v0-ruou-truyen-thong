import type { Metadata } from 'next'
import { Contact } from '@/components/contact'
import { getPageBySlug, sanitizePageHtml } from '@/lib/pages'

const FALLBACK_TITLE = 'Liên Hệ - Rượu Truyền Thống'
const FALLBACK_DESC = 'Liên hệ mua rượu truyền thống. Hotline, Zalo, email — tư vấn miễn phí, giao hàng toàn quốc.'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('lien-he')
  return {
    title: page?.metaTitle || FALLBACK_TITLE,
    description: page?.metaDescription || FALLBACK_DESC,
  }
}

export default async function LienHePage() {
  const page = await getPageBySlug('lien-he')

  if (page) {
    return (
      <div className="bg-white">
        <article className="container mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizePageHtml(page.content) }}
          />
        </article>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <Contact />
    </div>
  )
}
