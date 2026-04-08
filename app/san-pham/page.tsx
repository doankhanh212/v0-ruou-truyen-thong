'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, SlidersHorizontal, Filter, X } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FloatingButtons } from '@/components/floating-buttons'
import { ProductCard } from '@/components/product-card'
import { getCatalogItems } from '@/data/products'

const ITEMS_PER_PAGE = 6

const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'bồi bổ', label: 'Bồi bổ' },
  { id: 'sinh lý', label: 'Sinh lý nam' },
  { id: 'nhẹ', label: 'Thơm nhẹ' },
  { id: 'entry', label: 'Nhập môn' },
  { id: 'truyền thống', label: 'Truyền thống' },
  { id: 'quà tặng', label: 'Quà tặng' },
]

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá', min: 0, max: Infinity },
  { id: 'under500', label: 'Dưới 500.000đ', min: 0, max: 500000 },
  { id: '500-1m', label: '500k – 1.000.000đ', min: 500000, max: 1000000 },
  { id: '1m-2m', label: '1tr – 2.000.000đ', min: 1000000, max: 2000000 },
  { id: 'over2m', label: 'Trên 2.000.000đ', min: 2000000, max: Infinity },
]

export default function SanPhamPage() {
  const allItems = getCatalogItems()
  const [category, setCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [page, setPage] = useState(1)
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  // Filter items
  const filtered = allItems.filter((item) => {
    if (category !== 'all' && item.category !== category) return false
    const range = PRICE_RANGES.find((r) => r.id === priceRange)!
    if (item.priceMin < range.min || item.priceMin > range.max) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [category, priceRange])

  const Sidebar = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
        <Filter size={16} className="text-blue-600" />
        Bộ lọc
      </h3>

      {/* Category filter */}
      <div className="mb-6">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Danh mục
        </h4>
        <ul className="space-y-1">
          {CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => { setCategory(cat.id); setShowMobileFilter(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  category === cat.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price range filter */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Mức giá
        </h4>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <li key={range.id}>
              <button
                type="button"
                onClick={() => { setPriceRange(range.id); setShowMobileFilter(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  priceRange === range.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        {/* Page banner */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-blue-600 text-sm font-semibold mb-1 uppercase tracking-wide">
              Cửu Long Mỹ Tửu — Somo Gold
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Tất Cả Sản Phẩm</h1>
            <p className="text-gray-400 mt-1 text-sm">
              {filtered.length} sản phẩm
              {category !== 'all' || priceRange !== 'all' ? ' (đang lọc)' : ''}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile filter toggle */}
          <div className="md:hidden mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowMobileFilter(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
            >
              <SlidersHorizontal size={16} />
              Bộ lọc
            </button>
            {(category !== 'all' || priceRange !== 'all') && (
              <button
                type="button"
                onClick={() => { setCategory('all'); setPriceRange('all') }}
                className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-2.5 rounded-xl text-sm font-semibold"
              >
                <X size={14} />
                Xóa lọc
              </button>
            )}
          </div>

          {/* Mobile filter drawer */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Bộ lọc</h3>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilter(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                <Sidebar />
              </div>
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-56 flex-shrink-0">
              <div className="sticky top-24">
                <Sidebar />
              </div>
            </aside>

            {/* Product grid + pagination */}
            <div className="flex-1 min-w-0">
              {pageItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pageItems.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg mb-4">
                    Không có sản phẩm nào phù hợp với bộ lọc.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setCategory('all'); setPriceRange('all') }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Xóa bộ lọc →
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                        page === n
                          ? 'bg-blue-600 text-white shadow-blue-200'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Page info */}
              {totalPages > 1 && (
                <p className="text-center text-gray-400 text-sm mt-3">
                  Trang {page} / {totalPages} — {filtered.length} sản phẩm
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingButtons />
    </>
  )
}
