'use client'

import { products, giftSets, formatPrice } from '@/data/products'
import { CTAButton } from '@/components/cta-button'
import { useFadeIn } from '@/hooks/use-fade-in'
import { Check, Gift } from 'lucide-react'

const TIER_IDS = ['ruou-ba-kich', 'minh-mang-tuu', 'tay-duong-sam-tuu']
const TIER_LABELS: Record<string, { label: string; highlight: boolean }> = {
  'ruou-ba-kich': { label: 'Khởi đầu', highlight: false },
  'minh-mang-tuu': { label: 'Phổ biến nhất', highlight: true },
  'tay-duong-sam-tuu': { label: 'Cao cấp', highlight: false },
}

export function Pricing() {
  const { ref, isVisible } = useFadeIn()

  return (
    <section
      id="pricing"
      className="py-20 md:py-28 bg-gradient-to-b from-blue-50/60 to-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-secondary font-semibold text-sm uppercase tracking-wide mb-3">
              Bảng giá
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Giá Cả Minh Bạch, Chất Lượng Đảm Bảo
            </h2>
            <p className="text-lg text-foreground/60 max-w-xl mx-auto">
              Giá chưa bao gồm VAT — liên hệ Zalo để nhận báo giá tốt nhất
            </p>
          </div>

          {/* Urgency bar */}
          <div className="flex justify-center mb-10">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2">
              ⚡ Bán chạy nhất tuần này — Liên hệ ngay để nhận ưu đãi
            </div>
          </div>

          {/* Pricing cards — 3 main products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {TIER_IDS.map((id, idx) => {
              const product = products.find((p) => p.id === id)
              if (!product) return null
              const tier = TIER_LABELS[id]
              const startPrice = Math.min(...product.pricing.map((p) => p.priceBeforeVAT))

              return (
                <div
                  key={id}
                  className={`relative rounded-2xl p-8 flex flex-col transition-all duration-500
                    ${tier.highlight
                      ? 'bg-primary text-white shadow-2xl shadow-primary/30 md:-mt-4 md:mb-4 ring-4 ring-primary/20'
                      : 'bg-white border border-border/70 shadow-md hover:shadow-xl'
                    }
                    hover:-translate-y-1`}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  {/* Popular badge */}
                  {tier.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      🔥 Phổ biến nhất
                    </div>
                  )}

                  <div className="mb-6">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        tier.highlight
                          ? 'bg-white/20 text-white'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {tier.label}
                    </span>
                  </div>

                  <h3
                    className={`text-xl font-bold mb-1 leading-snug ${
                      tier.highlight ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {product.name}
                  </h3>
                  <p
                    className={`text-sm mb-2 ${
                      tier.highlight ? 'text-white/70' : 'text-foreground/55'
                    }`}
                  >
                    {product.alcohol} · {product.target}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <span
                      className={`text-2xl font-bold ${
                        tier.highlight ? 'text-white' : 'text-primary'
                      }`}
                    >
                      Từ {formatPrice(startPrice)}
                    </span>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            tier.highlight ? 'bg-white/25' : 'bg-green-100'
                          }`}
                        >
                          <Check
                            size={11}
                            className={tier.highlight ? 'text-white' : 'text-green-600'}
                            strokeWidth={3}
                          />
                        </span>
                        <span
                          className={
                            tier.highlight ? 'text-white/85' : 'text-foreground/65'
                          }
                        >
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Packaging options */}
                  <div className={`text-xs mb-6 space-y-1 ${tier.highlight ? 'text-white/60' : 'text-foreground/45'}`}>
                    {product.pricing.slice(0, 4).map((opt, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{opt.packaging} — {opt.volume}</span>
                        <span className="font-semibold">{formatPrice(opt.priceBeforeVAT)}</span>
                      </div>
                    ))}
                    {product.pricing.length > 4 && (
                      <p className="italic">+ {product.pricing.length - 4} tùy chọn khác</p>
                    )}
                  </div>

                  {/* CTA */}
                  <CTAButton
                    label={tier.highlight ? '💬 Đặt tư vấn ngay' : 'Tư vấn ngay'}
                    productName={product.name}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all btn-lift text-center ${
                      tier.highlight
                        ? 'bg-white text-primary hover:bg-blue-50 shadow-lg'
                        : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
                    }`}
                  />
                </div>
              )
            })}
          </div>

          {/* Gift Sets Section */}
          <div className="mt-16">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-5 py-2 rounded-full text-sm font-semibold mb-4">
                <Gift size={16} /> Bộ Quà Tặng Cao Cấp
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-primary">
                Quà Tặng Sang Trọng — Ý Nghĩa
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {giftSets.map((set) => {
                const minPrice = Math.min(...set.variants.map((v) => v.priceBeforeVAT))
                const maxPrice = Math.max(...set.variants.map((v) => v.priceBeforeVAT))
                return (
                  <div
                    key={set.id}
                    className="bg-white rounded-2xl border border-amber-200/60 shadow-sm p-6 hover:shadow-lg transition-shadow"
                  >
                    <h4 className="text-lg font-bold text-primary mb-1">{set.name}</h4>
                    <p className="text-sm text-foreground/55 mb-4">{set.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">
                        {formatPrice(minPrice)} – {formatPrice(maxPrice)}
                      </span>
                      <CTAButton
                        label="Xem chi tiết"
                        productName={set.name}
                        className="btn-lift bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-600"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom CTA row */}
          <div className="mt-12 bg-white rounded-2xl border border-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="font-semibold text-foreground">
                Cần giá tốt hơn hoặc mua số lượng lớn?
              </p>
              <p className="text-sm text-foreground/55 mt-0.5">
                Liên hệ trực tiếp qua Zalo để nhận ưu đãi riêng
              </p>
            </div>
            <CTAButton
              label="💬 Chat Zalo để nhận giá tốt nhất"
              className="btn-lift bg-[#0068FF] text-white px-7 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap shadow-lg shadow-blue-500/25"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
