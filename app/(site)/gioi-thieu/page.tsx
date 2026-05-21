import type { Metadata } from 'next'
import Link from 'next/link'
import sanitizeHtml from 'sanitize-html'
import { getSeoByPath } from '@/lib/seo-pages'
import { getStaticPage } from '@/lib/static-pages'
import { absoluteUrl, SITE_NAME } from '@/lib/seo'
import { PAGE_HTML_OPTIONS } from '@/lib/sanitize-page-html'
import { getSettings, getSystemConfig } from '@/lib/settings'
import { getSections } from '@/lib/sections'
import { getHeroColorStyle } from '@/lib/hero-colors'
import { ArrowRight, Sparkles, Phone, MessageCircle } from 'lucide-react'
import { companyInfo } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

const FALLBACK_TITLE = 'Giới thiệu — Rượu truyền thống'
const FALLBACK_DESC =
  'Câu chuyện rượu truyền thống — kế thừa bí quyết chế tác rượu thuốc truyền thống từ đời xưa của người dân miền Nam Việt Nam.'

function cleanHref(value: string, fallback: string) {
  const trimmed = value.trim()
  if (!trimmed) return fallback
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('#')) {
    return trimmed
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export async function generateMetadata(): Promise<Metadata> {
  const [seo, page, settings] = await Promise.all([
    getSeoByPath('/gioi-thieu'),
    getStaticPage('gioi-thieu'),
    getSettings(),
  ])
  const systemConfig = getSystemConfig(settings)
  const title = seo?.title || page?.metaTitle || FALLBACK_TITLE
  const description = seo?.description || page?.metaDescription || FALLBACK_DESC
  const rawOgImage = seo?.ogImage || systemConfig.defaultOgImage
  const ogImage = rawOgImage ? absoluteUrl(rawOgImage) : undefined
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
  const [page, sections] = await Promise.all([
    getStaticPage('gioi-thieu'),
    getSections(),
  ])
  const safeContent = page?.content
    ? sanitizeHtml(page.content, PAGE_HTML_OPTIONS)
    : ''
  const title = page?.title || 'Về Rượu Truyền Thống'
  const heroBadge = sections['gioi-thieu.hero.badge']?.text?.trim() || 'Câu chuyện thương hiệu'
  const heroSubtitle =
    sections['gioi-thieu.hero.subtitle']?.text?.trim() ||
    'Kế thừa bí quyết chế tác rượu thuốc truyền thống Việt Nam — chắt lọc tinh hoa từ đất, nước và thảo mộc của miền Tây Nam Bộ.'
  const heroColor = getHeroColorStyle(sections['gioi-thieu.hero.color']?.text, 'blue')
  const ctaLabel = sections['gioi-thieu.cta.label']?.text?.trim() || 'Khám phá sản phẩm'
  const ctaTitle =
    sections['gioi-thieu.cta.title']?.text?.trim() ||
    'Trải nghiệm tinh hoa rượu truyền thống Việt Nam.'
  const ctaBody =
    sections['gioi-thieu.cta.body']?.text?.trim() ||
    'Đậm đà bản sắc - khẳng định đẳng cấp người sành rượu.'
  const ctaPrimaryLabel =
    sections['gioi-thieu.cta.primary_label']?.text?.trim() || 'Xem sản phẩm'
  const ctaPrimaryHref = cleanHref(sections['gioi-thieu.cta.primary_href']?.text || '', '/san-pham')
  const ctaZaloLabel = sections['gioi-thieu.cta.zalo_label']?.text?.trim() || 'Chat Zalo'
  const ctaPhoneLabel = sections['gioi-thieu.cta.phone_label']?.text?.trim() || 'Gọi tư vấn'
  const ctaColor = getHeroColorStyle(sections['gioi-thieu.cta.color']?.text, 'red')
  const zaloPhone = (companyInfo.phone[1] || companyInfo.phone[0] || '').replace(/\s/g, '')

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Hero */}
      <section
        className={`relative overflow-hidden ${heroColor.className} px-4 py-14 sm:py-20`}
        style={heroColor.style}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #d4af37 1px, transparent 1px), radial-gradient(circle at 80% 70%, #d4af37 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          {heroBadge ? (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37] ring-1 ring-white/20 backdrop-blur">
              <Sparkles size={12} />
              {heroBadge}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {heroSubtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-sm text-blue-100 sm:text-base">
              {heroSubtitle}
            </p>
          ) : null}
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {safeContent ? (
          <article className="rounded-3xl bg-white px-6 py-10 shadow-md ring-1 ring-black/5 sm:px-10 md:px-14">
            <div
              className="article-content max-w-none"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
          </article>
        ) : (
          <article className="rounded-3xl border border-dashed border-amber-300 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-base font-semibold text-gray-700">
              Trang đang được cập nhật nội dung.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Vui lòng quay lại sau — chúng tôi sẽ sớm chia sẻ câu chuyện thương hiệu.
            </p>
          </article>
        )}
      </section>

      {/* CTA strip */}
      <section className={`${ctaColor.className} px-4 py-12 text-white sm:py-16`} style={ctaColor.style}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37]">
              {ctaLabel}
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
              {ctaTitle}
            </h2>
            <p className="mt-2 text-sm text-white/85">
              {ctaBody}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={ctaPrimaryHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-extrabold text-[#3d2400] shadow-lg transition-all hover:scale-105 hover:bg-[#e2c15b]"
            >
              {ctaPrimaryLabel} <ArrowRight size={15} />
            </Link>
            {zaloPhone && ctaZaloLabel ? (
              <a
                href={`https://zalo.me/${zaloPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <MessageCircle size={15} /> {ctaZaloLabel}
              </a>
            ) : null}
            {companyInfo.phone[0] && ctaPhoneLabel ? (
              <a
                href={`tel:${companyInfo.phone[0].replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <Phone size={15} /> {ctaPhoneLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
