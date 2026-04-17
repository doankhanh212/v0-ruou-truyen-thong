'use client'

import Image from 'next/image'
import Link from 'next/link'
import { products } from '@/data/products'
import { CTAButton } from '@/components/cta-button'
import { useFadeIn } from '@/hooks/use-fade-in'
import { Flame, TrendingUp } from 'lucide-react'
import { track } from '@/utils/track'

// Static urgency — gives scarcity feel without deception
const URGENCY: Record<string, string> = {
  'minh-mang-tuu': 'Chỉ còn 8 chai hôm nay',
  'tay-duong-sam-tuu': 'Đang có 6 người xem',
  'ruou-ba-kich': 'Bán chạy nhất tuần',
}

export function Products() {
  const { ref, isVisible } = useFadeIn()

  const handleProductClick = (productId: string, productSlug: string, productName: string) => {
    track('click_product', { id: productId, slug: productSlug, name: productName, source: 'home' })
  }

  return (
    <section id="products" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-secondary font-semibold text-sm uppercase tracking-wide mb-3">
            Cửu Long Mỹ Tửu
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Dòng Sản Phẩm Cao Cấp
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Thương hiệu Somo Gold — đạt tiêu chuẩn ISO 22000:2018 & OCOP 4 sao
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`group bg-white rounded-2xl overflow-hidden border border-border/60 shadow-sm
                hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: isVisible ? `${index * 90}ms` : '0ms' }}
            >
              {/* Image */}
              <Link
                href={`/san-pham/${product.slug}`}
                className="block"
                onClick={() => handleProductClick(product.id, product.slug, product.name)}
              >
              <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/8 to-secondary/8">
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  {product.isBestSeller && (
                    <span className="flex items-center gap-1 bg-amber-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
                      <Flame size={11} />
                      Bán chạy
                    </span>
                  )}
                  {product.tag && !product.isBestSeller && (
                    <span className="flex items-center gap-1 bg-secondary text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
                      <TrendingUp size={11} />
                      {product.tag}
                    </span>
                  )}
                </div>

                {/* Urgency strip */}
                {URGENCY[product.id] && (
                  <div className="absolute top-3 right-3 z-10 bg-red-500/90 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-1 rounded-lg">
                    🔴 {URGENCY[product.id]}
                  </div>
                )}

                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              </Link>

              {/* Body */}
              <div className="p-6">
                <Link
                  href={`/san-pham/${product.slug}`}
                  className="block"
                  onClick={() => handleProductClick(product.id, product.slug, product.name)}
                >
                <div className="mb-1">
                  <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors leading-snug">
                    {product.name}
                  </h3>
                  <p className="text-xs text-foreground/50 mt-0.5">
                    {product.alcohol} · {product.target}
                  </p>
                </div>

                <div className="space-y-1.5 mt-3 mb-6">
                  {product.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-foreground/65">{benefit}</span>
                    </div>
                  ))}
                </div>
                </Link>

                <div className="flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-lg font-bold text-primary block">
                      {product.price}đ
                    </span>
                  </div>
                  <CTAButton
                    label="Tư vấn ngay"
                    productName={product.name}
                    className="btn-lift w-full sm:w-auto bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-primary/20 hover:bg-secondary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <p className="text-foreground/50 text-sm mb-6">
            🔥 Đang có <strong>23 khách</strong> xem sản phẩm ngay lúc này
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/san-pham"
              className="btn-lift inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-white px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary/5 sm:w-auto"
            >
              Xem tất cả sản phẩm →
            </Link>
            <CTAButton
              label="💬 Chat Zalo để được tư vấn"
              className="btn-lift w-full sm:w-auto bg-[#0068FF] text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-500/25"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
