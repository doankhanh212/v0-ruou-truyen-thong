'use client'

import { Star } from 'lucide-react'

export function SocialProof() {
  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      location: 'Hà Nội',
      rating: 5,
      text: 'Sản phẩm tuyệt vời! Uống được 2 tuần, tôi cảm thấy sức khỏe tốt lên rõ rệt.'
    },
    {
      name: 'Trần Thị B',
      location: 'TP.HCM',
      rating: 5,
      text: 'Da em lên màu, tinh thần tốt hơn. Rất hài lòng, sẽ mua thêm sản phẩm.'
    },
    {
      name: 'Lê Minh C',
      location: 'Đà Nẵng',
      rating: 5,
      text: 'Quà tặng tuyệt vời cho ba mẹ. Họ rất thích và hài lòng với chất lượng.'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
          Cảm nhận của khách hàng
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((review, idx) => (
            <div key={idx} className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground/80 mb-4 italic">
                "{review.text}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">{review.name}</p>
                <p className="text-sm text-foreground/60">{review.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-primary">10K+</p>
            <p className="text-foreground/70 mt-2">Khách hàng hài lòng</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">4.9★</p>
            <p className="text-foreground/70 mt-2">Đánh giá trung bình</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">98%</p>
            <p className="text-foreground/70 mt-2">Tỷ lệ hài lòng</p>
          </div>
        </div>
      </div>
    </section>
  )
}
