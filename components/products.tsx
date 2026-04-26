'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CTAButton } from '@/components/cta-button'
import { useFadeIn } from '@/hooks/use-fade-in'
import { useCatalogProducts } from '@/hooks/use-catalog-products'
import { Flame, TrendingUp } from 'lucide-react'
import { track } from '@/utils/track'

const URGENCY: Record<string, string> = {
  'minh-mang-tuu': 'Chi con 8 chai hom nay',
  'tay-duong-sam-tuu': 'Dang co 6 nguoi xem',
  'ruou-ba-kich': 'Ban chay nhat tuan',
}

export function Products() {
  const { ref, isVisible } = useFadeIn()
  const { products, loading, error } = useCatalogProducts({ featured: true, limit: 6 })

  const handleProductClick = (productId: string, dbId: number | undefined, productSlug: string, productName: string) => {
    track('click_product', { id: productId, dbId, slug: productSlug, name: productName, source: 'home' })
  }

  return (
    <section id="products" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`mb-14 text-center transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary">
            Cuu Long My Tuu
          </p>
          <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
            Dong San Pham Cao Cap
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/60">
            Thuong hieu Somo Gold - dat tieu chuan ISO 22000:2018 va OCOP 4 sao
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm"
              >
                <div className="aspect-square animate-pulse bg-slate-100" />
                <div className="space-y-3 p-6">
                  <div className="h-5 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center text-red-700">
            {error}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`group overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: isVisible ? `${index * 90}ms` : '0ms' }}
              >
                <Link
                  href={`/san-pham/${product.slug}`}
                  className="block"
                  onClick={() => handleProductClick(product.id, product.dbId, product.slug, product.name)}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/8 to-secondary/8">
                    <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                      {product.isBestSeller ? (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                          <Flame size={11} />
                          Ban chay
                        </span>
                      ) : null}
                      {product.tag && !product.isBestSeller ? (
                        <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                          <TrendingUp size={11} />
                          {product.tag}
                        </span>
                      ) : null}
                    </div>

                    {URGENCY[product.slug] ? (
                      <div className="absolute right-3 top-3 z-10 rounded-lg bg-red-500/90 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                        {URGENCY[product.slug]}
                      </div>
                    ) : null}

                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </Link>

                <div className="p-6">
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="block"
                    onClick={() => handleProductClick(product.id, product.dbId, product.slug, product.name)}
                  >
                    <div className="mb-1">
                      <h3 className="text-lg font-bold leading-snug text-primary transition-colors group-hover:text-secondary">
                        {product.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-foreground/50">
                        {product.alcohol} · {product.target}
                      </p>
                    </div>

                    <div className="mb-6 mt-3 space-y-1.5">
                      {product.benefits.map((benefit, benefitIndex) => (
                        <div key={`${product.id}-${benefitIndex}`} className="flex items-center gap-2 text-sm">
                          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-600">
                            +
                          </span>
                          <span className="text-foreground/65">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </Link>

                  <div className="flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="block text-lg font-bold text-primary">{product.price}d</span>
                    </div>
                    <CTAButton
                      label="Tu van ngay"
                      productName={product.name}
                      className="btn-lift w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary/20 hover:bg-secondary sm:w-auto"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-slate-50 px-6 py-12 text-center text-foreground/60">
            Danh muc hien chua co san pham dang ban.
          </div>
        )}

        <div className="mt-14 text-center">
          <p className="mb-6 text-sm text-foreground/50">
            Dang co <strong>23 khach</strong> xem san pham ngay luc nay
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/san-pham"
              className="btn-lift inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-white px-8 py-4 text-base font-bold text-primary transition-all hover:bg-primary/5 sm:w-auto"
            >
              Xem tat ca san pham
            </Link>
            <CTAButton
              label="Chat Zalo de duoc tu van"
              className="btn-lift w-full rounded-2xl bg-[#0068FF] px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 sm:w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
