import type { Metadata } from 'next'
import { Story } from '@/components/story'
import { SocialProof } from '@/components/social-proof'
import { getPageBySlug, sanitizePageHtml } from '@/lib/pages'

const FALLBACK_TITLE = 'Giới Thiệu - Rượu Truyền Thống'
const FALLBACK_DESC = 'Câu chuyện rượu truyền thống — kế thừa bí quyết chế tác rượu thuốc truyền thống từ đời xưa của người dân miền Nam Việt Nam.'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('gioi-thieu')
  return {
    title: page?.metaTitle || FALLBACK_TITLE,
    description: page?.metaDescription || FALLBACK_DESC,
  }
}

export default async function GioiThieuPage() {
  const page = await getPageBySlug('gioi-thieu')

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
      <Story />
      <SocialProof />
    </div>
  )
}
