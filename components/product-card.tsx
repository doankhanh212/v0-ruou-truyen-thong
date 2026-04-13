'use client'

import Image from 'next/image'
import { Flame, TrendingUp, MessageCircle } from 'lucide-react'
import { openZalo } from '@/utils/zalo'
import { track } from '@/utils/track'
import type { CatalogItem } from '@/data/products'

interface ProductCardProps {
  item: CatalogItem
  /** Called when user clicks the Zalo button — for parent-level tracking */
  onZaloClick?: (item: CatalogItem) => void
}

export function ProductCard({ item, onZaloClick }: ProductCardProps) {
  const handleZalo = () => {
    track('product_click_zalo', { id: item.id, name: item.name, category: item.category })
    onZaloClick?.(item)
    openZalo(undefined, `Xin chào, tôi muốn tư vấn ${item.name}`)
  }

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {item.isBestSeller && (
            <span className="flex items-center gap-1 bg-amber-500 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
              <Flame size={11} />
              Bán chạy
            </span>
          )}
          {item.tag && !item.isBestSeller && (
            <span className="flex items-center gap-1 bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
              <TrendingUp size={11} />
              {item.tag}
            </span>
          )}
        </div>

        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-blue-900 text-base leading-snug group-hover:text-blue-600 transition-colors">
          {item.name}
        </h3>
        <p className="text-xs text-gray-400 mt-1 mb-3 line-clamp-1">{item.target}</p>

        <ul className="space-y-1.5 mb-4 flex-1">
          {item.benefits.slice(0, 3).map((benefit, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-4 h-4 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <span className="font-bold text-blue-700 text-base whitespace-nowrap">
            {item.price}đ
          </span>
          <button
            type="button"
            onClick={handleZalo}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 whitespace-nowrap"
          >
            <MessageCircle size={14} />
            Tư vấn Zalo
          </button>
        </div>
      </div>
    </div>
  )
}
