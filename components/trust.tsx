'use client'

import Image from 'next/image'
import { Users, Leaf, Clock, Award } from 'lucide-react'
import { useFadeIn } from '@/hooks/use-fade-in'
import { brandVisuals } from '@/lib/site-content'
import type { SectionsMap } from '@/lib/sections'

const POINT_ICONS = [
  { icon: Leaf, color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Award, color: 'text-primary', bg: 'bg-blue-50' },
  { icon: Users, color: 'text-secondary', bg: 'bg-indigo-50' },
  { icon: Clock, color: 'text-accent', bg: 'bg-orange-50' },
]

const DEFAULT_POINTS = [
  { title: '100% Thảo dược tự nhiên', description: 'Không chất bảo quản, không phụ gia công nghiệp. Thuần khiết như thiên nhiên ban tặng.' },
  { title: 'Chứng nhận chất lượng', description: 'Sản phẩm được kiểm định và cấp phép theo tiêu chuẩn y tế Việt Nam.' },
  { title: '10.000+ khách tin dùng', description: 'Được hàng chục nghìn gia đình tin tưởng và giới thiệu cho người thân.' },
  { title: 'Tư vấn miễn phí 24/7', description: 'Đội ngũ tư vấn luôn sẵn sàng qua Zalo, giải đáp mọi thắc mắc ngay lập tức.' },
]

interface TrustProps {
  sections?: Partial<SectionsMap>
}

export function Trust({ sections }: TrustProps = {}) {
  const { ref, isVisible } = useFadeIn()

  const label = sections?.['home.trust.label']?.text || 'Tại sao chọn chúng tôi'
  const title = sections?.['home.trust.title']?.text || 'Được tin tưởng vì lý do chính đáng'

  const card1 = {
    eyebrow: sections?.['home.trust.card1_eyebrow']?.text || 'Catalog thật',
    title: sections?.['home.trust.card1_title']?.text || 'Dòng rượu và bộ quà đã lên web bằng ảnh gốc',
    description: sections?.['home.trust.card1_desc']?.text || 'Từ rượu nếp, ba kích đến Minh Mạng, Hoàng Hoa, Tây Dương Sâm và các bộ quà biếu doanh nghiệp.',
    image: sections?.['home.trust.card1_image']?.image || brandVisuals.collection,
  }

  const card2 = {
    eyebrow: sections?.['home.trust.card2_eyebrow']?.text || 'Biếu tặng cao cấp',
    title: sections?.['home.trust.card2_title']?.text || 'Phù hợp quà Tết, quà đối tác và khách VIP',
    description: sections?.['home.trust.card2_desc']?.text || '',
    image: sections?.['home.trust.card2_image']?.image || brandVisuals.gifts,
  }

  const points = [0, 1, 2, 3].map((i) => ({
    title: sections?.[`home.trust.point${i + 1}_title` as keyof SectionsMap]?.text || DEFAULT_POINTS[i].title,
    description: sections?.[`home.trust.point${i + 1}_desc` as keyof SectionsMap]?.text || DEFAULT_POINTS[i].description,
    ...POINT_ICONS[i],
  }))

  return (
    <section id="trust" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-14">
            <p className="text-secondary font-semibold text-sm uppercase tracking-wide mb-3">
              {label}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              {title}
            </h2>
          </div>

          <div className="mb-10 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white shadow-sm">
              <div className="relative aspect-[16/9]">
                <Image
                  src={card1.image}
                  alt={card1.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  {card1.eyebrow ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">{card1.eyebrow}</p>
                  ) : null}
                  {card1.title ? <h3 className="mt-2 text-2xl font-bold">{card1.title}</h3> : null}
                  {card1.description ? (
                    <p className="mt-2 max-w-xl text-sm text-white/85">{card1.description}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-white shadow-sm">
              <div className="relative aspect-[4/5]">
                <Image
                  src={card2.image}
                  alt={card2.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  {card2.eyebrow ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">{card2.eyebrow}</p>
                  ) : null}
                  {card2.title ? (
                    <p className="mt-2 text-lg font-bold leading-snug">{card2.title}</p>
                  ) : null}
                  {card2.description ? (
                    <p className="mt-2 max-w-xl text-sm text-white/85">{card2.description}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {points.map((point, idx) => {
              const Icon = point.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center border border-border/50"
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className={`inline-flex p-3 ${point.bg} rounded-xl mb-4`}>
                    <Icon className={`${point.color} w-7 h-7`} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {point.title}
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
