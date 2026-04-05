'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function HerbsShowcase() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">9 Vị Dược Liệu Tinh Chọn</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Mỗi thành phần được lựa chọn kỹ lưỡng từ những vùng trồng tự nhiên tốt nhất
          </p>
        </div>

        <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/herbs-collection.jpg"
            alt="9 vị dược liệu tinh chọn"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        <div className="mt-12 grid grid-cols-3 md:grid-cols-9 gap-4">
          {[
            'Nhân Sâm',
            'Đông Trùng',
            'Yến Mạch',
            'Linh Chi',
            'Hồ Tiêu',
            'Cao Lương Tính',
            'Đỉnh Thảo',
            'Quế Vỏ',
            'Tây Dương Sâm'
          ].map((herb, index) => (
            <div
              key={index}
              className={`bg-blue-50 rounded-lg p-4 text-center border border-border hover:border-primary transition-all duration-300 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 50}ms` : '0ms'
              }}
            >
              <p className="text-sm font-semibold text-primary">{herb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
