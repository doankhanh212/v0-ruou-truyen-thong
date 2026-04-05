'use client'

import { useState, useEffect } from 'react'

const categories = [
  {
    id: 1,
    name: 'Rượu Thuốc Cơ Bản',
    description: 'Công thức truyền thống 9 vị dược liệu',
    icon: '🌿'
  },
  {
    id: 2,
    name: 'Rượu Thuốc Cao Cấp',
    description: 'Chứa thêm nhân sâm và yến mạch quý',
    icon: '👑'
  },
  {
    id: 3,
    name: 'Rượu Thuốc Phụ Nữ',
    description: 'Hỗ trợ sức khỏe và vẻ đẹp phụ nữ',
    icon: '💎'
  },
  {
    id: 4,
    name: 'Rượu Thuốc Nam',
    description: 'Tăng cường sức mạnh và sức bền',
    icon: '⚡'
  }
]

export function Categories() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="categories" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Danh Mục Sản Phẩm</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Khám phá các loại rượu thuốc được chế tác riêng cho từng nhu cầu sức khỏe
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`group bg-blue-50 rounded-xl p-6 cursor-pointer transition-all duration-500 hover:shadow-lg hover:bg-gradient-to-br hover:from-primary/10 hover:to-secondary/10 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 150}ms` : '0ms'
              }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
              <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {category.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
