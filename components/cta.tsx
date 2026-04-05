'use client'

import { useState, useEffect } from 'react'

export function CTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-primary to-secondary text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Sẵn Sàng Bắt Đầu Hành Trình Sức Khỏe?
          </h2>
          <p className="text-lg md:text-xl opacity-90 mb-8 leading-relaxed">
            Tham gia hàng ngàn khách hàng hài lòng đã trải nghiệm lợi ích của Rượu Truyền Thống. 
            Đặt hàng ngay hôm nay và nhận ưu đãi đặc biệt!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0999999999'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg hover:bg-blue-50 transition-all font-bold text-lg hover:shadow-lg"
            >
              Đặt Hàng Ngay
            </a>
            <a
              href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0999999999'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-all font-bold text-lg"
            >
              Tư Vấn Miễn Phí
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <p className="text-sm opacity-90">Dược Liệu Tự Nhiên</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Nhanh</div>
              <p className="text-sm opacity-90">Giao Hàng Toàn Quốc</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <p className="text-sm opacity-90">Hỗ Trợ Khách Hàng</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Hoàn Tiền</div>
              <p className="text-sm opacity-90">100% Nếu Không Hài Lòng</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
