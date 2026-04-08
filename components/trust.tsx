'use client'

import { CheckCircle2, Shield, Users, Leaf, Clock, Award } from 'lucide-react'
import { useFadeIn } from '@/hooks/use-fade-in'

const TRUST_POINTS = [
  {
    icon: Leaf,
    title: '100% Thảo dược tự nhiên',
    description: 'Không chất bảo quản, không phụ gia công nghiệp. Thuần khiết như thiên nhiên ban tặng.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Award,
    title: 'Chứng nhận chất lượng',
    description: 'Sản phẩm được kiểm định và cấp phép theo tiêu chuẩn y tế Việt Nam.',
    color: 'text-primary',
    bg: 'bg-blue-50',
  },
  {
    icon: Users,
    title: '10.000+ khách tin dùng',
    description: 'Được hàng chục nghìn gia đình tin tưởng và giới thiệu cho người thân.',
    color: 'text-secondary',
    bg: 'bg-indigo-50',
  },
  {
    icon: Clock,
    title: 'Tư vấn miễn phí 24/7',
    description: 'Đội ngũ tư vấn luôn sẵn sàng qua Zalo, giải đáp mọi thắc mắc ngay lập tức.',
    color: 'text-accent',
    bg: 'bg-orange-50',
  },
]

export function Trust() {
  const { ref, isVisible } = useFadeIn()

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
              Tại sao chọn chúng tôi
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Được tin tưởng vì lý do chính đáng
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_POINTS.map((point, idx) => {
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
