'use client'

import { useState, useEffect } from 'react'

const highlights = [
  {
    icon: '🌿',
    title: 'Dược Liệu Quý Việt Nam',
    description: 'Nguyên liệu được chọn lọc từ vùng trồng đạt chuẩn, kết hợp theo bài thuốc cổ phương.'
  },
  {
    icon: '🏺',
    title: 'Chưng Cất Thủ Công',
    description: 'Phương pháp truyền thống qua nhiều thế hệ, giữ trọn hương vị đặc trưng miền Tây.'
  },
  {
    icon: '🎖️',
    title: 'Đạt Chuẩn ISO 22000',
    description: 'Quy trình sản xuất đạt tiêu chuẩn an toàn thực phẩm quốc tế, OCOP 4 sao.'
  },
  {
    icon: '🎁',
    title: 'Quà Biếu Sang Trọng',
    description: 'Thiết kế bình sứ Bát Tràng, hộp quà cao cấp — phù hợp biếu đối tác, gia đình.'
  },
  {
    icon: '🏭',
    title: 'Nhà Máy Tại Vĩnh Long',
    description: 'Sản xuất tại nhà máy Somo Farm Cửu Long, vùng phù sa miền Tây sông nước.'
  },
  {
    icon: '💬',
    title: 'Tư Vấn Tận Tâm',
    description: 'Đội ngũ hỗ trợ qua Zalo 24/7, giúp bạn chọn đúng sản phẩm cho mọi dịp.'
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
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Vì Sao Chọn Cửu Long Mỹ Tửu?</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Giá trị truyền thống — chất lượng hiện đại
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
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
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                {item.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border border-border">
          <p className="text-center text-foreground/70 leading-relaxed">
            <span className="font-semibold text-primary">Lưu ý:</span> Sản phẩm rượu dược liệu không phải là thuốc, 
            không có tác dụng thay thế thuốc chữa bệnh. Uống có trách nhiệm.
          </p>
        </div>
      </div>
    </section>
  )
}
