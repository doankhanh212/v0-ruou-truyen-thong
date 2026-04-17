'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CTAButton } from '@/components/cta-button'
import { useFadeIn } from '@/hooks/use-fade-in'
import { brandVisuals } from '@/data/products'

export function CTA() {
  const { ref, isVisible } = useFadeIn()

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-secondary text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Chốt nhanh quà biếu hoặc dòng rượu phù hợp ngay hôm nay
              </h2>
              <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
                Đã có sẵn catalog thật, bảng giá rõ ràng và chatbot hỗ trợ chọn đúng nhu cầu.
                Bạn chỉ cần nhắn Zalo, đội ngũ sẽ chốt phương án phù hợp theo ngân sách.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <CTAButton
                  label="Chat Zalo Ngay"
                  className="w-full sm:w-auto bg-white text-primary px-8 py-4 rounded-lg hover:bg-blue-50 transition-all font-bold text-lg hover:shadow-lg"
                />
                <Link
                  href="/bang-gia"
                  className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all font-bold text-lg text-center"
                >
                  Xem bảng giá
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold mb-2">9</div>
                  <p className="text-sm opacity-90">Mẫu rượu và bộ quà thật</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">Nhanh</div>
                  <p className="text-sm opacity-90">Tư vấn qua Zalo</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <p className="text-sm opacity-90">Hỗ trợ khách hàng</p>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">Rõ</div>
                  <p className="text-sm opacity-90">Giá và quy cách đóng gói</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={brandVisuals.gifts}
                    alt="Quà tặng cao cấp Somo Gold"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl sm:translate-y-8">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={brandVisuals.contactAlt}
                    alt="Poster bộ quà tặng Lộc Xuân Somo Gold"
                    fill
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
