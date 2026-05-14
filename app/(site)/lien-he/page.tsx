import type { Metadata } from 'next'
import Link from 'next/link'
import { getSeoByPath } from '@/lib/seo-pages'
import { getStaticPage } from '@/lib/static-pages'
import { absoluteUrl, SITE_NAME } from '@/lib/seo'
import { companyInfo } from '@/lib/site-content'
import { Phone, Mail, MapPin, MessageCircle, Clock, ArrowRight, Building2 } from 'lucide-react'
import sanitizeHtml from 'sanitize-html'
import { PAGE_HTML_OPTIONS } from '@/lib/sanitize-page-html'
import { getSettings, getSystemConfig } from '@/lib/settings'

export const dynamic = 'force-dynamic'

const FALLBACK_TITLE = 'Liên hệ — Rượu truyền thống'
const FALLBACK_DESC = 'Liên hệ mua rượu truyền thống. Hotline, Zalo, email — tư vấn miễn phí, giao hàng toàn quốc.'

export async function generateMetadata(): Promise<Metadata> {
  const [seo, page, settings] = await Promise.all([
    getSeoByPath('/lien-he'),
    getStaticPage('lien-he'),
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
    alternates: { canonical: '/lien-he' },
    openGraph: {
      type: 'website', url: absoluteUrl('/lien-he'), title, description,
      siteName: SITE_NAME, images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description, images: ogImage ? [ogImage] : undefined },
  }
}

const CONTACT_ITEMS = [
  {
    icon: Phone,
    label: 'Hotline',
    value: companyInfo.phone[0],
    sub: companyInfo.phone[1],
    href: `tel:${companyInfo.phone[0].replace(/\s/g, '')}`,
    cta: 'Gọi ngay',
    color: 'bg-green-50 text-green-700',
    iconColor: 'text-green-600',
    ringColor: 'bg-green-100',
  },
  {
    icon: MessageCircle,
    label: 'Zalo',
    value: 'Nhắn tin Zalo',
    sub: companyInfo.phone[1],
    href: `https://zalo.me/${companyInfo.phone[1].replace(/\s/g, '')}`,
    cta: 'Mở Zalo',
    color: 'bg-blue-50 text-blue-700',
    iconColor: 'text-blue-600',
    ringColor: 'bg-blue-100',
  },
  {
    icon: Mail,
    label: 'Email',
    value: companyInfo.email,
    sub: 'Phản hồi trong 24h',
    href: `mailto:${companyInfo.email}`,
    cta: 'Gửi email',
    color: 'bg-amber-50 text-amber-700',
    iconColor: 'text-amber-600',
    ringColor: 'bg-amber-100',
  },
]

export default async function LienHePage() {
  const page = await getStaticPage('lien-he')

  if (page?.content) {
    return (
      <div className="min-h-screen bg-[#faf8f5]">
        <div className="mx-auto max-w-4xl px-4 pt-12 pb-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{page.title}</h1>
        </div>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <article className="rounded-2xl bg-white px-6 py-8 shadow-sm sm:px-8 md:px-10">
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:leading-relaxed prose-p:text-gray-700
                prose-a:text-[#8B1A1A] prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-img:rounded-xl prose-img:shadow-sm prose-img:mx-auto
                prose-blockquote:border-l-[#8B1A1A] prose-blockquote:bg-amber-50
                prose-li:text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content, PAGE_HTML_OPTIONS) }}
            />
          </article>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Title */}
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-4 sm:px-6 lg:px-8 text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#8B1A1A]/10 px-3 py-1 text-xs font-semibold text-[#8B1A1A]">
          <Phone size={12} />
          Liên hệ & Hỗ trợ
        </p>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Chúng tôi luôn sẵn sàng hỗ trợ
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
          Tư vấn miễn phí — giao hàng toàn quốc. Liên hệ ngay để được hỗ trợ nhanh nhất.
        </p>
      </div>

      {/* Contact cards */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CONTACT_ITEMS.map(({ icon: Icon, label, value, sub, href, cta, color, iconColor, ringColor }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group flex flex-col items-center rounded-2xl border border-amber-100 bg-white p-6 text-center shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${ringColor}`}>
                <Icon size={24} className={iconColor} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
              <p className="mt-1 font-bold text-gray-900 text-lg leading-snug">{value}</p>
              {sub && <p className="mt-0.5 text-sm text-gray-500">{sub}</p>}
              <span className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold ${color} group-hover:gap-2.5 transition-all`}>
                {cta} <ArrowRight size={13} />
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Hours + address */}
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Hours */}
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A1A]/10">
                <Clock size={20} className="text-[#8B1A1A]" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Giờ làm việc</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                <span className="font-medium text-gray-700">Thứ Hai — Thứ Sáu</span>
                <span className="font-bold text-green-700">08:00 — 17:30</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
                <span className="font-medium text-gray-700">Thứ Bảy</span>
                <span className="font-bold text-amber-700">08:00 — 12:00</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="font-medium text-gray-700">Chủ Nhật</span>
                <span className="text-gray-400">Nghỉ</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1A1A]/10">
                <MapPin size={20} className="text-[#8B1A1A]" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Địa chỉ văn phòng</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{companyInfo.address}</p>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Nhà máy sản xuất</p>
              <p className="text-sm font-medium text-gray-700">{companyInfo.factory.name}</p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{companyInfo.factory.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company info */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#8B1A1A]">Thông tin doanh nghiệp</p>
            <h2 className="text-2xl font-bold text-gray-900">Cty CP Somo Gold</h2>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex gap-3">
                  <Building2 size={16} className="mt-0.5 flex-shrink-0 text-[#8B1A1A]" />
                  <div>
                    <p className="font-semibold text-gray-900">Tên công ty</p>
                    <p>{companyInfo.name}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#8B1A1A]" />
                  <div>
                    <p className="font-semibold text-gray-900">Địa chỉ</p>
                    <p>{companyInfo.address}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone size={16} className="mt-0.5 flex-shrink-0 text-[#8B1A1A]" />
                  <div>
                    <p className="font-semibold text-gray-900">Hotline</p>
                    <p>{companyInfo.phone.join(' — ')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail size={16} className="mt-0.5 flex-shrink-0 text-[#8B1A1A]" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p>{companyInfo.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Thương hiệu</p>
                  <p>{companyInfo.brand}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Đơn vị phân phối</p>
                  <p>{companyInfo.distributor.name}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Chứng nhận</p>
                  <div className="flex flex-wrap gap-2">
                    {companyInfo.certifications.map((cert) => (
                      <span key={cert} className="rounded-full bg-[#8B1A1A]/10 px-3 py-1 text-xs font-semibold text-[#8B1A1A]">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Sẵn sàng đặt hàng?</h2>
        <p className="mt-3 text-base text-gray-500">Xem bộ sưu tập sản phẩm và đặt hàng ngay hôm nay.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 rounded-xl bg-[#8B1A1A] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#6f1414] transition-colors"
          >
            Xem sản phẩm <ArrowRight size={15} />
          </Link>
          <a
            href={`tel:${companyInfo.phone[0].replace(/\s/g, '')}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[#8B1A1A] px-6 py-3 text-sm font-semibold text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white transition-colors"
          >
            <Phone size={15} /> Gọi tư vấn
          </a>
        </div>
      </div>
    </div>
  )
}
