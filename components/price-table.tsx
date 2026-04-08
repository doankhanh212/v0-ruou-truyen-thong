'use client'

import { useState, useEffect } from 'react'
import { products } from '@/data/products'
import { CTAButton } from '@/components/cta-button'

export function PriceTable() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full border-collapse transition-all duration-700 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <thead>
          <tr className="border-b-2 border-primary bg-primary/5">
            <th className="text-left py-4 px-6 font-bold text-primary">Sản Phẩm</th>
            <th className="text-left py-4 px-6 font-bold text-primary">Dung Tích</th>
            <th className="text-left py-4 px-6 font-bold text-primary">Giá</th>
            <th className="text-center py-4 px-6 font-bold text-primary">Tư Vấn</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={product.id}
              className={`border-b border-border transition-all duration-500 ${
                product.isBestSeller
                  ? 'bg-amber-50 hover:bg-amber-100'
                  : 'hover:bg-blue-50'
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 60}ms` : '0ms',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
              }}
            >
              <td className="py-4 px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{product.name}</span>
                  {product.isBestSeller && (
                    <span className="inline-block bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                      🔥 Best
                    </span>
                  )}
                  {product.tag && !product.isBestSeller && (
                    <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-0.5 rounded whitespace-nowrap">
                      {product.tag}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/50 mt-0.5">{product.target}</p>
              </td>
              <td className="py-4 px-6 text-foreground/70 whitespace-nowrap">{product.alcohol}</td>
              <td className="py-4 px-6 whitespace-nowrap">
                <span
                  className={`font-bold text-lg ${
                    product.isBestSeller ? 'text-amber-600' : 'text-primary'
                  }`}
                >
                  {product.price}đ
                </span>
              </td>
              <td className="py-4 px-6 text-center">
                <CTAButton
                  label="Tư vấn ngay"
                  productName={product.name}
                  className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition-all text-sm font-semibold whitespace-nowrap"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-center">
        <CTAButton
          label="💬 Chat Zalo để được báo giá tốt hơn"
          className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:shadow-lg inline-block"
        />
      </div>

      <div className="mt-6 p-6 bg-accent/10 rounded-xl border border-accent/20">
        <p className="text-sm text-foreground/70 text-center">
          💡 <span className="font-semibold">Mẹo:</span> Mua combo để tiết kiệm thêm và nhận quà tặng đặc biệt. Liên hệ ngay để biết thêm về các chương trình ưu đãi.
        </p>
      </div>
    </div>
  )
}
