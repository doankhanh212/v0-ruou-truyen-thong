'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Flame, MessageCircle } from 'lucide-react'
import { openZalo } from '@/utils/zalo'
import { track } from '@/utils/track'
import type { CatalogProduct } from '@/lib/catalog'
import { filterAlcoholComplianceTerms } from '@/lib/alcohol-compliance'

interface ProductCardProps {
  item: CatalogProduct
  /** Called when user clicks the Zalo button for parent-level tracking */
  onZaloClick?: (item: CatalogProduct) => void
}

export function ProductCard({ item, onZaloClick }: ProductCardProps) {
  const compliantBenefits = filterAlcoholComplianceTerms(item.benefits).slice(0, 3)
  const unavailable = item.isOutOfStock || item.inStock === false

  const handleProductClick = () => {
    track('click_product', { id: item.id, dbId: item.dbId, slug: item.slug, name: item.name, source: 'listing' })
  }

  const handleZalo = () => {
    if (unavailable) return
    onZaloClick?.(item)
    openZalo(undefined, `Xin chao, toi muon tu van ${item.name}`)
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/san-pham/${item.slug}`} className="block" onClick={handleProductClick}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-white">
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
            {unavailable ? (
              <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                Tạm hết hàng
              </span>
            ) : null}
            {item.isBestSeller ? (
              <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                <Flame size={11} />
                Bán chạy
              </span>
            ) : null}
          </div>

          <Image
            src={item.image}
            alt={item.imageAlt || item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${unavailable ? 'grayscale-[35%]' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/san-pham/${item.slug}`} className="flex flex-1 flex-col" onClick={handleProductClick}>
          <h3 className="line-clamp-2 min-h-[3rem] text-base font-bold leading-snug text-blue-900 transition-colors group-hover:text-blue-600">
            {item.name}
          </h3>
          <p className="mb-3 mt-1 line-clamp-1 text-xs text-gray-400">{item.target}</p>

          <ul className="mb-4 flex-1 space-y-1.5">
            {compliantBenefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-[10px] font-bold text-green-600">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </Link>

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_minmax(104px,auto)] items-end gap-3 border-t border-gray-100 pt-4">
          <div className="min-w-0">
            <span className="block break-words text-[15px] font-bold leading-tight text-blue-700 sm:text-sm xl:text-[15px]">
              {item.price}đ
            </span>
            <span className="mt-0.5 block text-[11px] italic leading-snug text-gray-500">(Giá đã bao gồm VAT)</span>
          </div>
          <button
            type="button"
            onClick={handleZalo}
            disabled={unavailable}
            className={`flex min-h-11 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:text-[13px] ${
              unavailable
                ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                : 'bg-blue-600 text-white shadow-sm shadow-blue-200 hover:bg-blue-700 active:scale-95'
            }`}
          >
            <MessageCircle size={14} />
            {unavailable ? 'Tạm hết hàng' : 'Tư vấn Zalo'}
          </button>
        </div>
      </div>
    </div>
  )
}
