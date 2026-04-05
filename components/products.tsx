'use client'

import { useState, useEffect } from 'react'

const products = [
  {
    id: 1,
    name: 'Cửu Long Mỹ Tửu Cơ Bản',
    price: '250,000đ',
    volume: '500ml',
    description: '9 vị dược liệu tinh chọn',
    benefits: ['Tăng sức đề kháng', 'Hỗ trợ tiêu hóa', 'Giúp ngủ ngon']
  },
  {
    id: 2,
    name: 'Cửu Long Mỹ Tửu Nhân Sâm',
    price: '450,000đ',
    volume: '500ml',
    description: 'Với nhân sâm và yến mạch',
    benefits: ['Tăng năng lượng', 'Chống mệt mỏi', 'Tăng miễn dịch']
  },
  {
    id: 3,
    name: 'Cửu Long Mỹ Tửu Phụ Nữ',
    price: '400,000đ',
    volume: '500ml',
    description: 'Công thức dành riêng cho phụ nữ',
    benefits: ['Cân bằng nội tiết', 'Làm đẹp da', 'Hỗ trợ sức khỏe']
  },
  {
    id: 4,
    name: 'Cửu Long Mỹ Tửu Nam',
    price: '500,000đ',
    volume: '500ml',
    description: 'Công thức tăng cường sinh lực',
    benefits: ['Tăng sức mạnh', 'Cải thiện sức bền', 'Giúp hồi phục']
  },
  {
    id: 5,
    name: 'Combo Cơ Bản (3 chai)',
    price: '680,000đ',
    volume: '500ml x 3',
    description: 'Bộ ba loại rượu thuốc cơ bản',
    benefits: ['Tiết kiệm 10%', 'Dùng cả nhân trong gia đình', 'Quà tặng lý tưởng']
  },
  {
    id: 6,
    name: 'Combo Cao Cấp (4 chai)',
    price: '1,500,000đ',
    volume: '500ml x 4',
    description: 'Bộ đầy đủ tất cả các dòng sản phẩm',
    benefits: ['Tiết kiệm 20%', 'Quà tặng sang trọng', 'Hết sức toàn diện']
  }
]

export function Products() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="products" className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Sản Phẩm Của Chúng Tôi</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Mỗi chai rượu là một liệu pháp sức khỏe được chế tác với tình yêu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-border ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : '0ms'
              }}
            >
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 h-40 flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
                <span className="text-5xl">🍶</span>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mt-1">{product.volume}</p>
                  </div>
                </div>

                <p className="text-foreground/70 text-sm mb-4">{product.description}</p>

                <div className="space-y-2 mb-6">
                  {product.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-accent">✓</span>
                      <span className="text-foreground/70">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-2xl font-bold text-primary">{product.price}</span>
                  <a
                    href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0999999999'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-all text-sm font-semibold"
                  >
                    Đặt Hàng
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
