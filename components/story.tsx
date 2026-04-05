'use client'

import { useState, useEffect } from 'react'

export function Story() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section id="story" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Câu Chuyện Cửu Long Mỹ Tửu
            </h2>
            
            <div className="space-y-4 text-foreground/80">
              <p className="leading-relaxed">
                Cửu Long Mỹ Tửu kế thừa bí quyết chế tác rượu thuốc truyền thống từ đời xưa của người dân 
                miền Nam Việt Nam. Mỗi công thức được truyền lại qua nhiều thế hệ, lưu giữ sự huyền bí 
                và hiệu quả của y học cổ truyền.
              </p>
              
              <p className="leading-relaxed">
                Với sự kết hợp giữa 9 loại dược liệu được lựa chọn kỹ lưỡng từ những vùng đất 
                có khí hậu thích hợp, chúng tôi tạo ra một sản phẩm độc đáo mang đầy đủ các dưỡng chất 
                tự nhiên.
              </p>

              <p className="leading-relaxed">
                Đây không chỉ là một loại rượu, mà là một liệu pháp sức khỏe, một thể hiện của tình yêu 
                gia đình và một di sản văn hóa được bảo tồn và phát triển bởi chúng tôi.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100+</div>
                <p className="text-sm text-foreground/60">Năm lịch sử</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">9</div>
                <p className="text-sm text-foreground/60">Vị dược liệu</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1000+</div>
                <p className="text-sm text-foreground/60">Khách hàng hài lòng</p>
              </div>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="relative w-full h-96 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
              <div className="relative text-center">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-primary font-semibold">Truyền Thống Và Hiện Đại</p>
                <p className="text-sm text-foreground/60 mt-2">Kết hợp hoàn hảo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
