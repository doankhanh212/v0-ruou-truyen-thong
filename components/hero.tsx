'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative min-h-[600px] bg-gradient-to-b from-blue-50 to-white overflow-hidden py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 leading-tight">
              Rượu Thuốc Truyền Thống <span className="text-secondary">Cửu Long</span>
            </h1>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              Chế tác từ 9 loại dược liệu quý hiếm được chọn lọc kỹ lưỡng, mỗi tách rượu là một liệu pháp sức khỏe tự nhiên. 
              Kế thừa bí quyết cổ truyền, hòa quyện với khoa học hiện đại.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0999999999'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-all hover:shadow-lg font-semibold text-center"
              >
                Đặt Hàng Ngay
              </a>
              <button
                onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-block border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-blue-50 transition-all font-semibold text-center"
              >
                Tìm Hiểu Thêm
              </button>
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
                <div className="text-6xl mb-4">🍶</div>
                <p className="text-primary font-semibold">Rượu Thuốc Cửu Long</p>
                <p className="text-sm text-foreground/60 mt-2">Truyền thống Việt Nam</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
