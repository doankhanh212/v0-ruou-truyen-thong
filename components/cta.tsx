'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CTAButton } from '@/components/cta-button'
import { useFadeIn } from '@/hooks/use-fade-in'
import { brandVisuals } from '@/lib/site-content'
import type { SectionsMap, SectionValue } from '@/lib/sections'

function val(sections: Partial<SectionsMap> | undefined, key: keyof SectionsMap): SectionValue {
  return sections?.[key] ?? { text: '', image: null }
}

interface CTAProps {
  sections?: Partial<SectionsMap>
}

export function CTA({ sections }: CTAProps = {}) {
  const { ref, isVisible } = useFadeIn()
  const title = val(sections, 'home.cta.title')
  const body = val(sections, 'home.cta.body')
  const primary = val(sections, 'home.cta.primary_label')
  const secondary = val(sections, 'home.cta.secondary_label')

  const hasContent =
    title.text || body.text || primary.text || secondary.text

  if (!hasContent) return null

  return (
    <section className="bg-gradient-to-r from-primary to-secondary py-12 text-white sm:py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="text-center lg:text-left">
              {title.text ? (
                <h2
                  className="mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl"
                  dangerouslySetInnerHTML={{ __html: title.text }}
                />
              ) : null}

              {body.text ? (
                <p
                  className="mb-6 text-base leading-relaxed opacity-90 sm:mb-8 sm:text-lg md:text-xl"
                  dangerouslySetInnerHTML={{ __html: body.text }}
                />
              ) : null}

              {(primary.text || secondary.text) && (
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
                  {primary.text ? (
                    <CTAButton
                      label={primary.text}
                      className="w-full rounded-lg bg-white px-6 py-3.5 text-base font-bold text-primary transition-all hover:bg-blue-50 hover:shadow-lg sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                    />
                  ) : null}
                  {secondary.text ? (
                    <Link
                      href="/san-pham"
                      className="w-full rounded-lg border-2 border-white px-6 py-3.5 text-center text-base font-bold text-white transition-all hover:bg-white/10 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                    >
                      {secondary.text}
                    </Link>
                  ) : null}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl sm:rounded-3xl">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={brandVisuals.gifts}
                    alt="Quà tặng cao cấp Somo Gold"
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl sm:translate-y-8 sm:rounded-3xl">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={brandVisuals.contactAlt}
                    alt="Poster bộ quà tặng Lộc Xuân Somo Gold"
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
