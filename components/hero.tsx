'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CTAButton } from '@/components/cta-button'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { SectionsMap, SectionValue } from '@/lib/sections'

const TRUST_BADGES = [
  '100% thảo dược tự nhiên',
  'Cam kết chất lượng',
  'Tư vấn miễn phí 24/7',
]

const AUTOPLAY_MS = 2000

interface BannerItem {
  imageUrl: string
  title?: string | null
  linkUrl?: string | null
}

interface HeroProps {
  bannerUrl?: string | null
  bannerAlt?: string | null
  banners?: BannerItem[]
  sections?: Partial<SectionsMap>
}

function val(sections: Partial<SectionsMap> | undefined, key: keyof SectionsMap): SectionValue {
  return sections?.[key] ?? { text: '', image: null }
}

export function Hero({ bannerUrl, bannerAlt, banners, sections }: HeroProps = {}) {
  const [isVisible, setIsVisible] = useState(false)

  // Normalize: prefer banners[] (carousel). Fallback to single bannerUrl for backward compat.
  const slides: BannerItem[] = (banners && banners.length > 0)
    ? banners
    : (bannerUrl && bannerUrl.trim()
        ? [{ imageUrl: bannerUrl, title: bannerAlt ?? null, linkUrl: null }]
        : [])

  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Auto-rotate carousel when there are multiple slides
  useEffect(() => {
    if (slides.length <= 1) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [slides.length])

  function goTo(index: number) {
    setActiveIndex(((index % slides.length) + slides.length) % slides.length)
    // Reset autoplay timer so user click feels responsive
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % slides.length)
      }, AUTOPLAY_MS)
    }
  }

  const badge = val(sections, 'home.hero.badge')
  const title = val(sections, 'home.hero.title')
  const titleAccent = val(sections, 'home.hero.title_accent')
  const subtitle = val(sections, 'home.hero.subtitle')
  const ctaPrimary = val(sections, 'home.hero.cta_primary_label')
  const ctaSecondary = val(sections, 'home.hero.cta_secondary_label')
  const statNumber = val(sections, 'home.hero.stat_number')
  const statLabel = val(sections, 'home.hero.stat_label')

  const hasSlides = slides.length > 0
  const showControls = slides.length > 1

  return (
    <section
      id="hero"
      className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-28"
      style={{
        background:
          'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f0f9ff 100%)',
      }}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-[320px] w-[320px] -translate-y-1/3 translate-x-1/3 rounded-full bg-primary/5 blur-3xl sm:h-[420px] sm:w-[420px] md:h-[480px] md:w-[480px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-60 w-60 -translate-x-1/4 translate-y-1/3 rounded-full bg-secondary/5 blur-3xl sm:h-72 sm:w-72 md:h-80 md:w-80" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-14">

          {/* ── Left: copy ── */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
          >
            {badge.text ? (
              <div
                className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent sm:mb-6 sm:px-4 sm:text-sm"
                dangerouslySetInnerHTML={{ __html: badge.text }}
              />
            ) : null}

            {(title.text || titleAccent.text) && (
              <h1 className="mb-5 text-3xl font-bold leading-[1.1] text-primary sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                {title.text ? (
                  <span dangerouslySetInnerHTML={{ __html: title.text }} />
                ) : null}
                {title.text && titleAccent.text ? ' ' : null}
                {titleAccent.text ? (
                  <span
                    className="whitespace-nowrap text-secondary"
                    dangerouslySetInnerHTML={{ __html: titleAccent.text }}
                  />
                ) : null}
              </h1>
            )}

            {subtitle.text ? (
              <p
                className="mb-6 max-w-lg text-sm leading-relaxed text-foreground/65 sm:mb-8 sm:text-base md:text-lg lg:text-xl"
                dangerouslySetInnerHTML={{ __html: subtitle.text }}
              />
            ) : null}

            {(ctaPrimary.text || ctaSecondary.text) && (
              <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:gap-4">
                {ctaPrimary.text ? (
                  <CTAButton
                    label={ctaPrimary.text}
                    className="btn-lift w-full rounded-xl bg-primary px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-primary/25 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
                  />
                ) : null}
                {ctaSecondary.text ? (
                  <Link
                    href="/san-pham"
                    className="btn-lift min-h-11 w-full rounded-xl border-2 border-primary/30 px-6 py-3.5 text-center text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary/5 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
                  >
                    {ctaSecondary.text}
                  </Link>
                ) : null}
              </div>
            )}

            <div className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3">
              {TRUST_BADGES.map((b) => (
                <div
                  key={b}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1.5 text-xs text-foreground/65 shadow-sm sm:px-3 sm:py-2 sm:text-sm"
                >
                  <CheckCircle2 size={14} className="flex-shrink-0 text-green-500" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: image carousel ── */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
          >
            <div className="group relative h-[240px] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-xl shadow-primary/10 sm:h-[320px] sm:rounded-3xl sm:shadow-2xl md:h-[400px] lg:h-[460px]">
              {hasSlides ? (
                <>
                  {/* Slides */}
                  {slides.map((slide, i) => {
                    const inner = (
                      <Image
                        src={slide.imageUrl}
                        alt={slide.title?.trim() || 'Banner trang chủ'}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority={i === 0}
                      />
                    )
                    return (
                      <div
                        key={`${slide.imageUrl}-${i}`}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                          i === activeIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                        aria-hidden={i !== activeIndex}
                      >
                        {slide.linkUrl ? (
                          <Link href={slide.linkUrl} className="block h-full w-full">
                            {inner}
                          </Link>
                        ) : (
                          inner
                        )}
                      </div>
                    )
                  })}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />

                  {/* Prev / next */}
                  {showControls && (
                    <>
                      <button
                        type="button"
                        onClick={() => goTo(activeIndex - 1)}
                        aria-label="Banner trước"
                        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary opacity-0 shadow-md backdrop-blur-sm transition-opacity hover:bg-white group-hover:opacity-100 sm:left-3 sm:h-10 sm:w-10"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => goTo(activeIndex + 1)}
                        aria-label="Banner sau"
                        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary opacity-0 shadow-md backdrop-blur-sm transition-opacity hover:bg-white group-hover:opacity-100 sm:right-3 sm:h-10 sm:w-10"
                      >
                        <ChevronRight size={18} />
                      </button>

                      {/* Dots */}
                      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                        {slides.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`Banner ${i + 1}`}
                            className={`h-2 rounded-full transition-all ${
                              i === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-center text-sm text-slate-500">
                  <div className="px-6">
                    <p className="font-semibold text-slate-700">Banner đang được cập nhật</p>
                    <p className="mt-1 text-xs text-slate-500">Hình ảnh sản phẩm mới sẽ sớm được giới thiệu.</p>
                  </div>
                </div>
              )}

              {statNumber.text || statLabel.text ? (
                <div className="absolute bottom-3 left-3 z-10 rounded-xl bg-white/90 px-3 py-2 shadow-xl backdrop-blur-sm sm:bottom-4 sm:left-4 sm:rounded-2xl sm:px-4 sm:py-3 md:bottom-6 md:left-6 md:px-5 md:py-4">
                  {statNumber.text ? (
                    <p className="text-lg font-bold text-primary sm:text-xl md:text-2xl">
                      {statNumber.text}
                    </p>
                  ) : null}
                  {statLabel.text ? (
                    <p className="text-xs text-foreground/60 sm:text-sm">{statLabel.text}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 shadow-lg backdrop-blur-sm sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 md:right-6 md:top-6 md:px-4 md:py-2">
                <span className="text-xs text-amber-500 sm:text-sm md:text-base">★★★★★</span>
                <span className="text-xs font-bold text-foreground sm:text-sm">4.9</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
