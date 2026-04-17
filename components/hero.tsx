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
      className="relative min-h-[660px] overflow-hidden py-20 md:py-28"
      style={{
        background:
          'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f0f9ff 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

          {/* ── Left: copy ── */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            {/* Pre-title badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              ✨ Bí quyết sức khỏe truyền thống Việt Nam
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.05] mb-6">
              Rượu Truyền Thống{' '}
              <span className="text-secondary whitespace-nowrap">Cửu Long</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/65 mb-8 leading-relaxed max-w-lg">
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
            <div className="flex flex-wrap gap-3">
              {TRUST_BADGES.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 text-sm text-foreground/65 bg-white border border-border px-3 py-2 rounded-full shadow-sm"
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
            <div className="relative w-full h-[460px] rounded-3xl overflow-hidden shadow-2xl shadow-primary/15">
              <Image
                src={brandVisuals.hero}
                alt="Catalog rượu truyền thống Cửu Long"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />

              {/* Floating stats card */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl">
                <p className="text-2xl font-bold text-primary">10.000+</p>
                <p className="text-sm text-foreground/60">Khách hàng tin dùng</p>
              </div>

              {/* Rating pill */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-1.5">
                <span className="text-amber-500 text-base">★★★★★</span>
                <span className="text-sm font-bold text-foreground">4.9</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
