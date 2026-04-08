'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useFadeIn } from '@/hooks/use-fade-in'

const TESTIMONIALS = [
  {
    name: 'Nguyễn Văn Hùng',
    location: 'Hà Nội',
    initials: 'NH',
    color: 'bg-blue-500',
    rating: 5,
    product: 'Rượu Ba Kích',
    text: 'Uống được 3 tuần, cảm giác sức khỏe tốt lên rõ rệt. Ngủ ngon hơn, tinh thần sảng khoái. Rất hài lòng, đã giới thiệu cho anh em trong nhà.',
  },
  {
    name: 'Trần Thị Lan',
    location: 'TP.HCM',
    initials: 'TL',
    color: 'bg-pink-500',
    rating: 5,
    product: 'Rượu Phụ Nữ',
    text: 'Da em lên màu hồng hào, ít mệt mỏi hơn so với trước. Đã dùng được 2 hộp và sẽ tiếp tục. Chất lượng xứng đáng với giá tiền!',
  },
  {
    name: 'Lê Minh Tuấn',
    location: 'Đà Nẵng',
    initials: 'LT',
    color: 'bg-green-500',
    rating: 5,
    product: 'Combo Cao Cấp',
    text: 'Mua làm quà tặng ba dịp sinh nhật. Ông thích lắm, cứ khen hoài. Đóng gói đẹp, giao hàng nhanh, nhân viên tư vấn nhiệt tình.',
  },
  {
    name: 'Phạm Quốc Bảo',
    location: 'Cần Thơ',
    initials: 'PB',
    color: 'bg-amber-500',
    rating: 5,
    product: 'Rượu Nhân Sâm',
    text: 'Làm việc văn phòng hay bị mệt buổi chiều, từ khi dùng sản phẩm này thì đỡ hẳn. Vị ngon, không bị kích đau đầu như rượu thường.',
  },
  {
    name: 'Hồ Thị Mỹ Linh',
    location: 'Nha Trang',
    initials: 'HL',
    color: 'bg-purple-500',
    rating: 5,
    product: 'Rượu Ba Kích',
    text: 'Chồng em dùng tuần thứ 4 rồi, thấy khỏe hẳn. Quan trọng là sản phẩm nguồn gốc rõ ràng, không lo tác dụng phụ. Sẽ mua thêm.',
  },
  {
    name: 'Đinh Văn Dũng',
    location: 'Hải Phòng',
    initials: 'DĐ',
    color: 'bg-teal-500',
    rating: 5,
    product: 'Combo Cơ Bản',
    text: 'Giá cả hợp lý, dịch vụ tư vấn qua Zalo nhanh và nhiệt tình. Giao hàng đến trong 2 ngày. Đây là lần thứ 3 tôi đặt mua rồi.',
  },
]

export function SocialProof() {
  const [viewers, setViewers] = useState(5)
  const [current, setCurrent] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { ref: sectionRef, isVisible } = useFadeIn()

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((v) => {
        const delta = Math.random() > 0.5 ? 1 : -1
        return Math.max(3, Math.min(15, v + delta))
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const scrollTo = (idx: number) => {
    setCurrent(idx)
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.scrollWidth / TESTIMONIALS.length
    el.scrollTo({ left: cardWidth * idx, behavior: 'smooth' })
  }

  const prev = () => scrollTo(Math.max(0, current - 1))
  const next = () => scrollTo(Math.min(TESTIMONIALS.length - 1, current + 1))

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={sectionRef}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-secondary font-semibold text-sm uppercase tracking-wide mb-3">
              Đánh giá thực tế
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Đã có hơn <span className="text-secondary">500+</span> khách hàng tin tưởng
            </h2>

            {/* Live proof pills */}
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                Đang có <strong className="mx-1">{viewers}</strong> người xem trang này
              </div>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-medium">
                🔥 Bán chạy nhất tuần này — 120+ sản phẩm
              </div>
            </div>
          </div>

          {/* Carousel */}
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {TESTIMONIALS.map((t, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 w-[300px] sm:w-[340px] snap-start bg-white rounded-2xl p-6 shadow-sm border border-border/60 hover:shadow-md transition-shadow"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-foreground/75 text-sm leading-relaxed mb-5 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                    <div
                      className={`w-10 h-10 ${t.color} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{t.name}</p>
                      <p className="text-xs text-foreground/50">{t.location} · {t.product}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nav buttons */}
            <button
              type="button"
              onClick={prev}
              disabled={current === 0}
              aria-label="Trước"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white border border-border rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={current === TESTIMONIALS.length - 1}
              aria-label="Tiếp"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white border border-border rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === current ? 'bg-primary w-5' : 'bg-border hover:bg-primary/40'
                }`}
              />
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-6 text-center bg-white rounded-2xl border border-border/60 shadow-sm p-8">
            <div>
              <p className="text-4xl font-bold text-primary">10K+</p>
              <p className="text-foreground/55 mt-1.5 text-sm">Khách hàng hài lòng</p>
            </div>
            <div className="border-x border-border/40">
              <p className="text-4xl font-bold text-primary">4.9★</p>
              <p className="text-foreground/55 mt-1.5 text-sm">Đánh giá trung bình</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">98%</p>
              <p className="text-foreground/55 mt-1.5 text-sm">Tỷ lệ hài lòng</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
