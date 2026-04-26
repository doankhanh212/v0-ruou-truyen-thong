'use client'

import Image from 'next/image'
import { useFadeIn } from '@/hooks/use-fade-in'

export function Story() {
  const { ref, isVisible } = useFadeIn()

  return (
    <section id="story" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 items-center">
          {/* Left Content */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Câu Chuyện Rượu Truyền Thống
            </h2>
            
            <div className="space-y-4 text-foreground/80">
              <p className="leading-relaxed">
                Rượu Truyền Thống kế thừa bí quyết chế tác rượu thuốc truyền thống từ đời xưa của người dân 
                miền Nam Việt Nam. Mỗi công thức được truyền lại qua nhiều thế hệ, lưu giữ sự huyền bí 
                và hiệu quả của y học cổ truyền.
              </p>
              
              <p className="leading-relaxed">
                Với sự kết hợp giữa 9 loại dược liệu được lựa chọn kỹ lưỡng từ những vùng đất 
                có khí hậu thích hợp, chúng tôi tạo ra một sản phẩm độc đáo mang đầy đủ các dưỡng chất 
                tự nhiên.
              </p>

              <p className="leading-relaxed">
                Đây không chỉ là một loại rượu, mà là một tinh hoa văn hóa, một thể hiện của tình yêu 
                gia đình và một di sản văn hóa được bảo tồn và phát triển bởi chúng tôi.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 sm:gap-6">
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

          {/* Right Image */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="relative h-60 w-full overflow-hidden rounded-2xl shadow-lg sm:h-80 md:h-96">
              <Image
                src="/story-tradition.jpg"
                alt="Truyền thống rượu thuốc Việt Nam"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
