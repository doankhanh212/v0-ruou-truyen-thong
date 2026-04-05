'use client'

import { useState, useEffect } from 'react'

const benefits = [
  {
    icon: '🛡️',
    title: 'Tăng Sức Đề Kháng',
    description: 'Giúp cơ thể chống lại các bệnh tật và tăng cường hệ miễn dịch tự nhiên.'
  },
  {
    icon: '⚡',
    title: 'Tăng Năng Lượng',
    description: 'Cung cấp năng lượng tự nhiên cho cơ thể trong suốt ngày dài.'
  },
  {
    icon: '😴',
    title: 'Giúp Ngủ Ngon',
    description: 'Cải thiện chất lượng giấc ngủ và giúp bạn thức dậy tỉnh táo hơn.'
  },
  {
    icon: '🦴',
    title: 'Tăng Cường Xương',
    description: 'Hỗ trợ sức khỏe xương và khớp, phòng chống loãng xương.'
  },
  {
    icon: '❤️',
    title: 'Khỏe Mạnh Tim',
    description: 'Hỗ trợ sức khỏe tim mạch và tuần hoàn máu toàn thân.'
  },
  {
    icon: '🧠',
    title: 'Tỉnh Táo Tâm Trí',
    description: 'Tăng cường trí nhớ, giúp tập trung và giảm căng thẳng.'
  }
]

export function Benefits() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="benefits" className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Lợi Ích Sức Khỏe</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Khám phá những lợi ích tuyệt vời mà Rượu Truyền Thống mang lại
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group border border-border ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
              }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                {benefit.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-border">
          <p className="text-center text-foreground/70 leading-relaxed">
            <span className="font-semibold text-primary">Lưu ý:</span> Sản phẩm này không phải để chẩn đoán, 
            điều trị, chữa bệnh hoặc ngăn ngừa bất kỳ bệnh nào. Vui lòng tham khảo ý kiến bác sĩ 
            trước khi sử dụng.
          </p>
        </div>
      </div>
    </section>
  )
}
