'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CTAButton } from '@/components/cta-button'
import { CheckCircle2 } from 'lucide-react'
import { brandVisuals } from '@/data/products'

const TRUST_BADGES = [
  '100% thảo dược tự nhiên',
  'Cam kết chất lượng',
  'Tư vấn miễn phí 24/7',
]

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-[480px] overflow-hidden py-14 sm:py-18 md:min-h-[660px] md:py-28"
      style={{
        background:
          'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f0f9ff 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14 items-center">

          {/* ── Left: copy ── */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            {/* Pre-title badge */}
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent sm:text-sm mb-6">
              ✨ Tinh hoa rượu truyền thống Việt Nam
            </div>

            <h1 className="text-4xl font-bold leading-[1.05] text-primary sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              Rượu Truyền Thống{' '}
              <span className="text-secondary whitespace-nowrap">Cửu Long</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-foreground/65 sm:text-lg md:text-xl mb-8">
              Catalog Somo Gold gồm <strong className="text-foreground/80">rượu nếp, ba kích, Minh Mạng, Hoàng Hoa và Tây Dương Sâm</strong>,
              cùng nhiều bộ quà biếu cao cấp cho gia đình, đối tác và khách VIP.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <CTAButton
                label="💬 Nhận tư vấn miễn phí"
                className="btn-lift w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl font-bold text-base text-center shadow-lg shadow-primary/25"
              />
              <Link
                href="/bang-gia"
                className="btn-lift min-h-11 w-full sm:w-auto border-2 border-primary/30 text-primary px-8 py-4 rounded-xl font-bold text-base text-center hover:border-primary hover:bg-primary/5 transition-colors"
              >
                Xem bảng giá →
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {TRUST_BADGES.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-xs text-foreground/65 shadow-sm sm:text-sm"
                >
                  <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: image ── */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative h-[300px] w-full overflow-hidden rounded-3xl shadow-2xl shadow-primary/15 sm:h-[380px] md:h-[460px]">
              <Image
                src={brandVisuals.hero}
                alt="Catalog rượu truyền thống Cửu Long"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />

              {/* Floating stats card */}
              <div className="absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-3 shadow-xl backdrop-blur-sm sm:bottom-6 sm:left-6 sm:px-5 sm:py-4">
                <p className="text-xl font-bold text-primary sm:text-2xl">10.000+</p>
                <p className="text-xs text-foreground/60 sm:text-sm">Khách hàng tin dùng</p>
              </div>

              {/* Rating pill */}
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-sm sm:right-6 sm:top-6 sm:px-4 sm:py-2">
                <span className="text-sm text-amber-500 sm:text-base">★★★★★</span>
                <span className="text-xs font-bold text-foreground sm:text-sm">4.9</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
