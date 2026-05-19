import type { Metadata } from 'next'
import Link from 'next/link'
import sanitizeHtml from 'sanitize-html'
import { getSeoByPath } from '@/lib/seo-pages'
import { getStaticPage } from '@/lib/static-pages'
import { absoluteUrl, SITE_NAME } from '@/lib/seo'
import {
  type LucideIcon,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowRight,
  Headphones,
} from 'lucide-react'
import { PAGE_HTML_OPTIONS } from '@/lib/sanitize-page-html'
import { getSettings, getSystemConfig } from '@/lib/settings'
import { getSections } from '@/lib/sections'
import { getHeroColorStyle } from '@/lib/hero-colors'

export const dynamic = 'force-dynamic'

const FALLBACK_TITLE = 'Liên hệ — Rượu truyền thống'
const FALLBACK_DESC = 'Liên hệ mua rượu truyền thống. Hotline, Zalo, email — tư vấn miễn phí, giao hàng toàn quốc.'

type ContactCardId = 'phone' | 'zalo' | 'email'

type QuickContactTemplate = {
  id: ContactCardId
  icon: LucideIcon
  accent: string
  iconBg: string
  iconColor: string
}

const QUICK_CONTACT: QuickContactTemplate[] = [
  {
    id: 'phone',
    icon: Phone,
    accent: 'from-green-500 to-emerald-600',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    id: 'zalo',
    icon: MessageCircle,
    accent: 'from-blue-500 to-sky-600',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'email',
    icon: Mail,
    accent: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
]

function sectionText(sections: Awaited<ReturnType<typeof getSections>>, key: string) {
  return sections[key as keyof typeof sections]?.text?.trim() ?? ''
}
function isGoogleMapEmbed(src: string) {
  try {
    const url = new URL(src)
    const host = url.hostname.toLowerCase()
    return (
      host.includes('google.') ||
      host === 'maps.app.goo.gl' ||
      host === 'goo.gl'
    ) && (url.pathname.includes('/maps') || url.href.includes('/maps/') || url.href.includes('maps?'))
  } catch {
    const value = src.toLowerCase()
    return value.includes('google.') && value.includes('maps')
  }
}

function splitContactHtml(html: string) {
  let mapHtml = ''
  const contentHtml = html
    .replace(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/iframe>/gi, (match, src: string) => {
      if (!mapHtml && isGoogleMapEmbed(src)) {
        mapHtml = match
        return ''
      }
      return match
    })
    .replace(/<p>\s*(?:&nbsp;|\s|<br\s*\/?>)*\s*<\/p>/gi, '')
    .trim()

  return { mapHtml, contentHtml }
}

function phoneHref(value: string) {
  const cleaned = value.replace(/[^\d+]/g, '')
  return cleaned.replace(/^\+?84/, '0').length >= 8 ? `tel:${cleaned}` : ''
}

function emailHref(value: string) {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match ? `mailto:${match[0]}` : ''
}

function normalizeContactHref(id: ContactCardId, href: string, value: string) {
  const raw = href.trim()
  const source = raw || value.trim()
  if (!source) return ''
  if (/^(https?:\/\/|tel:|mailto:)/i.test(source) || source.startsWith('/')) return source

  if (id === 'phone') return phoneHref(source)
  if (id === 'email') return emailHref(source)
  if (id === 'zalo') {
    const phone = phoneHref(source).replace(/^tel:/, '')
    if (phone) return `https://zalo.me/${phone}`
    return source.includes('zalo.me') ? `https://${source.replace(/^\/+/, '')}` : ''
  }

  return ''
}

export default async function LienHePage() {
  const [page, sections] = await Promise.all([
    getStaticPage('lien-he'),
    getSections(),
  ])
  const safeContent = page?.content ? sanitizeHtml(page.content, PAGE_HTML_OPTIONS) : ''
  const splitContent = splitContactHtml(safeContent)
  const mapHtml = sections['lien-he.map.embed']?.text?.trim() ?? ''
  const contentHtml = splitContent.contentHtml
  const title = page?.title || 'Liên Hệ Mua Hàng'
  const heroBadge = sections['lien-he.hero.badge']?.text?.trim() ?? ''
  const heroSubtitle = sections['lien-he.hero.subtitle']?.text?.trim() ?? ''
  const heroColor = getHeroColorStyle(sections['lien-he.hero.color']?.text, 'red')
  const contactCards = QUICK_CONTACT.map((card) => {
    const label = sectionText(sections, `lien-he.contact.${card.id}.label`)
    const value = sectionText(sections, `lien-he.contact.${card.id}.value`)
    const rawHref = sectionText(sections, `lien-he.contact.${card.id}.href`)
    return {
      ...card,
      label,
      value,
      sub: sectionText(sections, `lien-he.contact.${card.id}.sub`),
      href: normalizeContactHref(card.id, rawHref, value),
      cta: sectionText(sections, `lien-he.contact.${card.id}.cta`),
    }
  }).filter((card) => card.label || card.value || card.sub || card.cta)

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
              'radial-gradient(circle at 25% 30%, #d4af37 1px, transparent 1px), radial-gradient(circle at 75% 70%, #d4af37 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />
        <div className="relative mx-auto max-w-4xl text-center">
          {heroBadge ? (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37] ring-1 ring-white/20 backdrop-blur">
              <Headphones size={12} />
              {heroBadge}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {heroSubtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-sm text-red-100 sm:text-base">
              {heroSubtitle}
            </p>
          ) : null}
        </div>
      </section>

      {/* Quick contact cards (floating above content) */}
      {contactCards.length ? (
        <section className="mx-auto -mt-10 max-w-6xl px-4 sm:-mt-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {contactCards.map(({ id, icon: Icon, label, value, sub, href, cta, accent, iconBg, iconColor }) => {
              const content = (
                <>
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
                      <Icon size={20} className={iconColor} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {label ? (
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
                      ) : null}
                      {value ? <p className="mt-0.5 truncate text-base font-bold text-gray-900">{value}</p> : null}
                      {sub ? <p className="mt-0.5 truncate text-xs text-gray-500">{sub}</p> : null}
                    </div>
                  </div>
                  {cta ? (
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#8B1A1A]">
                      {cta} {href ? <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /> : null}
                    </span>
                  ) : null}
                </>
              )
              const cardClass = `group relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 transition-all duration-300 ${
                href ? 'hover:-translate-y-1 hover:shadow-xl' : ''
              }`
              return href ? (
                <a
                  key={id}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={cardClass}
                >
                  {content}
                </a>
              ) : (
                <div key={id} className={cardClass}>
                  {content}
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Content + map */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {safeContent || mapHtml ? (
          <div className={`grid gap-6 ${mapHtml ? 'lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]' : ''}`}>
            {safeContent ? (
              <article className="order-2 rounded-3xl bg-white px-6 py-10 shadow-md ring-1 ring-black/5 sm:px-10 lg:order-1">
                <div
                  className="article-content max-w-none [&_iframe]:block [&_iframe]:min-h-[320px] [&_iframe]:w-full [&_iframe]:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: contentHtml || safeContent }}
                />
              </article>
            ) : null}

            {mapHtml ? (
              <aside className="order-1 rounded-3xl bg-white p-4 shadow-md ring-1 ring-black/5 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <div className="mb-3 flex items-center gap-2 px-2">
                  <MapPin size={16} className="text-[#8B1A1A]" />
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">Bản đồ</h2>
                </div>
                <div
                  className="overflow-hidden rounded-2xl bg-slate-100 [&_iframe]:block [&_iframe]:h-[320px] [&_iframe]:w-full [&_iframe]:border-0 md:[&_iframe]:h-[380px] lg:[&_iframe]:h-[440px]"
                  dangerouslySetInnerHTML={{ __html: mapHtml }}
                />
                <p className="mt-3 px-2 text-xs leading-5 text-gray-500">
                  Bấm vào bản đồ để xem đường đi chi tiết trên Google Maps.
                </p>
              </aside>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#003b7a] to-[#2b6cb0] px-4 py-12 text-white sm:py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4af37]">Sẵn sàng đặt hàng?</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
              Khám phá bộ sưu tập rượu truyền thống Việt Nam.
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              Hàng chính hãng — đóng gói cẩn thận — giao hàng toàn quốc.
            </p>
          </div>
          <Link
            href="/san-pham"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#d4af37] px-6 py-3 text-sm font-extrabold text-[#003b7a] shadow-lg transition-all hover:scale-105 hover:bg-[#e2c15b]"
          >
            Xem sản phẩm <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  )
}
