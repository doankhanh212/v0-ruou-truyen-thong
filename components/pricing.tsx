'use client'

import { useState, useEffect } from 'react'

export function Pricing() {
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
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Bảng Giá</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Giá cả công bằng cho chất lượng tuyệt vời
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            <thead>
              <tr className="border-b-2 border-primary">
                <th className="text-left py-4 px-6 font-bold text-primary">Sản Phẩm</th>
                <th className="text-left py-4 px-6 font-bold text-primary">Dung Tích</th>
                <th className="text-left py-4 px-6 font-bold text-primary">Giá</th>
                <th className="text-left py-4 px-6 font-bold text-primary">Chiết Khấu</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-blue-50 transition-colors">
                <td className="py-4 px-6 font-medium text-foreground">Cửu Long Mỹ Tửu Cơ Bản</td>
                <td className="py-4 px-6 text-foreground/70">500ml</td>
                <td className="py-4 px-6 font-bold text-primary">250.000đ</td>
                <td className="py-4 px-6 text-accent">-</td>
              </tr>
              <tr className="border-b border-border hover:bg-blue-50 transition-colors">
                <td className="py-4 px-6 font-medium text-foreground">Cửu Long Mỹ Tửu Nhân Sâm</td>
                <td className="py-4 px-6 text-foreground/70">500ml</td>
                <td className="py-4 px-6 font-bold text-primary">450.000đ</td>
                <td className="py-4 px-6 text-accent">-</td>
              </tr>
              <tr className="border-b border-border hover:bg-blue-50 transition-colors">
                <td className="py-4 px-6 font-medium text-foreground">Cửu Long Mỹ Tửu Phụ Nữ</td>
                <td className="py-4 px-6 text-foreground/70">500ml</td>
                <td className="py-4 px-6 font-bold text-primary">400.000đ</td>
                <td className="py-4 px-6 text-accent">-</td>
              </tr>
              <tr className="border-b border-border hover:bg-blue-50 transition-colors">
                <td className="py-4 px-6 font-medium text-foreground">Cửu Long Mỹ Tửu Nam</td>
                <td className="py-4 px-6 text-foreground/70">500ml</td>
                <td className="py-4 px-6 font-bold text-primary">500.000đ</td>
                <td className="py-4 px-6 text-accent">-</td>
              </tr>
              <tr className="border-b border-border hover:bg-blue-50 transition-colors bg-blue-50">
                <td className="py-4 px-6 font-bold text-primary">Combo Cơ Bản (3 chai)</td>
                <td className="py-4 px-6 text-foreground/70">500ml x 3</td>
                <td className="py-4 px-6 font-bold text-primary">680.000đ</td>
                <td className="py-4 px-6 font-bold text-accent">10%</td>
              </tr>
              <tr className="hover:bg-blue-50 transition-colors bg-blue-50">
                <td className="py-4 px-6 font-bold text-primary">Combo Cao Cấp (4 chai)</td>
                <td className="py-4 px-6 text-foreground/70">500ml x 4</td>
                <td className="py-4 px-6 font-bold text-primary">1.500.000đ</td>
                <td className="py-4 px-6 font-bold text-accent">20%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-accent/10 rounded-xl border border-accent/20">
          <p className="text-sm text-foreground/70">
            💡 <span className="font-semibold">Mẹo:</span> Mua combo để tiết kiệm hơn và có thêm quà tặng đặc biệt. 
            Liên hệ ngay để biết thêm chi tiết về các chương trình ưu đãi.
          </p>
        </div>
      </div>
    </section>
  )
}
