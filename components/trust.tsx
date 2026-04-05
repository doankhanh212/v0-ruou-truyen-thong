'use client'

import { CheckCircle2, Shield, Users } from 'lucide-react'

export function Trust() {
  const trustPoints = [
    {
      icon: Shield,
      title: 'Chứng chỉ y tế',
      description: 'Sản phẩm được cấp phép và kiểm định chất lượng theo tiêu chuẩn y tế Việt Nam'
    },
    {
      icon: Users,
      title: '10,000+ khách hài lòng',
      description: 'Được tin tưởng bởi hàng chục nghìn gia đình và doanh nghiệp tại Việt Nam'
    },
    {
      icon: CheckCircle2,
      title: 'Nguyên liệu thiên nhiên',
      description: 'Sử dụng 100% nguyên liệu từ thiên nhiên, không chất bảo quản hóa học'
    }
  ]

  return (
    <section id="trust" className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-12">
          Tại sao chọn Rượu Truyền Thống?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {trustPoints.map((point, idx) => {
            const Icon = point.icon
            return (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="flex justify-center mb-4">
                  <Icon className="text-secondary w-12 h-12" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {point.title}
                </h3>
                <p className="text-foreground/70">
                  {point.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
