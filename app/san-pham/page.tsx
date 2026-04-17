'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import {
  ChevronLeft, ChevronRight,
  SlidersHorizontal, Filter, X,
  Search, Sparkles, Gift, Heart, Users,
} from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { triggerChatbotOpen } from '@/lib/chatbot-trigger'
import { brandVisuals, getCatalogItems } from '@/data/products'
import type { PurposeId } from '@/lib/chatbot-rules'
import { track } from '@/utils/track'
import type { CatalogItem } from '@/data/products'

const ITEMS_PER_PAGE = 6

// ─── Filters ───────────────────────────────────────────────
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
  { id: 'under1m', label: 'Dưới 1.000.000đ', min: 0, max: 1000000 },
  { id: 'over1m', label: 'Trên 1.000.000đ', min: 1000000, max: Infinity },
]

// ─── AI Recommend presets ────────────────────────────────
interface RecommendPreset {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  activeColor: string
  match: (item: CatalogItem) => boolean
}

const RECOMMEND_PRESETS: RecommendPreset[] = [
  {
    id: 'gift',
    label: 'Mua làm quà',
    icon: <Gift size={15} />,
    color: 'border-amber-300 text-amber-700 hover:bg-amber-50',
    activeColor: 'bg-amber-500 text-white border-amber-500',
    match: (item) =>
      item.category === 'quà tặng' ||
      item.target.toLowerCase().includes('quà') ||
      item.tag?.includes('Quà') === true,
  },
  {
    id: 'health',
    label: 'Tăng sức khỏe',
    icon: <Heart size={15} />,
    color: 'border-green-300 text-green-700 hover:bg-green-50',
    activeColor: 'bg-green-600 text-white border-green-600',
    match: (item) =>
      item.category === 'bồi bổ' ||
      item.benefits.some((b) =>
        ['đề kháng', 'huyết áp', 'lão hóa', 'sức khỏe'].some((kw) =>
          b.toLowerCase().includes(kw)
        )
      ),
  },
  {
    id: 'male',
    label: 'Nam giới',
    icon: <Users size={15} />,
    color: 'border-blue-300 text-blue-700 hover:bg-blue-50',
    activeColor: 'bg-blue-600 text-white border-blue-600',
    match: (item) =>
      item.category === 'sinh lý' ||
      item.target.toLowerCase().includes('nam') ||
      item.benefits.some((b) =>
        ['sinh lý', 'sinh lực', 'nam'].some((kw) => b.toLowerCase().includes(kw))
      ),
  },
]

// ─── Page ────────────────────────────────────────────────
export default function SanPhamPage() {
  const allItems = getCatalogItems()

  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('all')
  const [priceRange, setPriceRange]   = useState('all')
  const [recommend, setRecommend]     = useState<string | null>(null)
  const [page, setPage]               = useState(1)
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  // ── Filtered list ──
  const filtered = allItems.filter((item) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!item.name.toLowerCase().includes(q) && !item.target.toLowerCase().includes(q))
        return false
    }
    // AI recommend overrides category/price
    if (recommend) {
      const preset = RECOMMEND_PRESETS.find((p) => p.id === recommend)
      return preset ? preset.match(item) : true
    }
    // Category
    if (category !== 'all' && item.category !== category) return false
    // Price
    const range = PRICE_RANGES.find((r) => r.id === priceRange)!
    if (item.priceMin < range.min || item.priceMin > range.max) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const pageItems  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const hasActiveFilter =
    search.trim() !== '' ||
    category !== 'all' ||
    priceRange !== 'all' ||
    recommend !== null

  // Reset page when any filter changes
  useEffect(() => {
    setPage(1)
  }, [search, category, priceRange, recommend])

  // ── Handlers ──
  const handleSearch = (value: string) => {
    setSearch(value)
    if (value.trim()) track('search', { query: value })
  }

  const handleCategory = (id: string) => {
    setCategory(id)
    setRecommend(null)
    setShowMobileFilter(false)
    track('filter_category', { category: id })
  }

  const handlePrice = (id: string) => {
    setPriceRange(id)
    setShowMobileFilter(false)
    track('filter_price', { range: id })
  }

  const handleRecommend = (id: string) => {
    const next = recommend === id ? null : id
    setRecommend(next)
    if (next) {
      setCategory('all')
      setPriceRange('all')
      track('ai_recommend', { preset: next })
      triggerChatbotOpen(next as PurposeId)
    }
  }

  const clearAll = useCallback(() => {
    setSearch('')
    setCategory('all')
    setPriceRange('all')
    setRecommend(null)
  }, [])

  useEffect(() => {
    if (!showMobileFilter) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [showMobileFilter])

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return

    setPage(nextPage)
    track('page_change', { page: nextPage })
  }

  // ── Sidebar (shared desktop + mobile drawer) ──
  const Sidebar = () => (
    <div className="space-y-5">
      {/* Search — mobile only inside drawer */}
      <div className="md:hidden">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          Tìm kiếm
        </h4>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Tên sản phẩm..."
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Category */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <Filter size={14} className="text-blue-600" />
          Danh mục
        </h3>
        <ul className="space-y-1">
          {CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => handleCategory(cat.id)}
                className={`min-h-11 w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  category === cat.id && !recommend
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

      {/* Price range */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">💰 Mức giá</h3>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range) => (
            <li key={range.id}>
              <button
                type="button"
                onClick={() => handlePrice(range.id)}
                className={`min-h-11 w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  priceRange === range.id && !recommend
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

      {hasActiveFilter && (
        <button
          type="button"
          onClick={() => { clearAll(); setShowMobileFilter(false) }}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all"
        >
          <X size={14} />
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  )

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* ── Page banner ── */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto grid gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:items-center">
            <div>
              <p className="text-blue-600 text-xs font-semibold mb-1 uppercase tracking-wide">
                Cửu Long Mỹ Tửu — Somo Gold
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tất Cả Sản Phẩm</h1>
              <p className="text-gray-500 mt-2 text-sm leading-6 max-w-xl">
                Catalog hiện gồm cả rượu lẻ và bộ quà tặng, dùng ảnh thật từ bộ tài liệu công ty để khách xem nhanh và chọn đúng nhu cầu.
              </p>
              <p className="text-gray-400 mt-2 text-sm">
                {filtered.length} sản phẩm
                {hasActiveFilter ? ' (đang lọc)' : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative aspect-[4/5] bg-slate-100">
                  <Image
                    src={brandVisuals.collection}
                    alt="Bộ sưu tập Cửu Long Mỹ Tửu"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative aspect-[4/5] bg-slate-100">
                  <Image
                    src={brandVisuals.gifts}
                    alt="Quà tặng cao cấp Somo Gold"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* ── AI Recommend strip ── */}
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-blue-600" />
              <span className="text-sm font-bold text-gray-700">Gợi ý nhanh cho bạn</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RECOMMEND_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleRecommend(preset.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                    recommend === preset.id ? preset.activeColor : preset.color
                  }`}
                >
                  {preset.icon}
                  {preset.label}
                </button>
              ))}
              {recommend && (
                <button
                  type="button"
                  onClick={() => setRecommend(null)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-all"
                >
                  <X size={13} />
                  Bỏ gợi ý
                </button>
              )}
            </div>
          </div>

          {/* ── Search bar (desktop) + mobile filter toggle ── */}
          <div className="flex items-center gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md hidden md:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm tên sản phẩm..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Mobile: filter toggle + search */}
            <div className="flex items-center gap-2 md:hidden w-full">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <X size={13} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilter(true)}
                className="flex min-h-11 items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-semibold shadow-sm flex-shrink-0"
              >
                <SlidersHorizontal size={15} />
                Lọc
                {hasActiveFilter && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>
            </div>

            {/* Desktop: active filter tags */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {recommend && (
                <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  ✨ {RECOMMEND_PRESETS.find((p) => p.id === recommend)?.label}
                  <button type="button" onClick={() => setRecommend(null)}><X size={11} /></button>
                </span>
              )}
              {category !== 'all' && !recommend && (
                <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {CATEGORIES.find((c) => c.id === category)?.label}
                  <button type="button" onClick={() => setCategory('all')}><X size={11} /></button>
                </span>
              )}
              {priceRange !== 'all' && !recommend && (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {PRICE_RANGES.find((r) => r.id === priceRange)?.label}
                  <button type="button" onClick={() => setPriceRange('all')}><X size={11} /></button>
                </span>
              )}
              {search.trim() && (
                <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  "{search}"
                  <button type="button" onClick={() => setSearch('')}><X size={11} /></button>
                </span>
              )}
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Xóa tất cả
                </button>
              )}
            </div>
          </div>

          {/* ── Mobile filter drawer ── */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-gray-50 shadow-2xl overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                  <h3 className="font-bold text-gray-900">Bộ lọc</h3>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilter(false)}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-1.5 hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <Sidebar />
                </div>
              </div>
            </div>
          )}

          {/* ── Main layout: sidebar + grid ── */}
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-52 flex-shrink-0">
              <div className="sticky top-24">
                <Sidebar />
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1 min-w-0">
              {pageItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pageItems.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-gray-500 text-lg font-medium mb-2">
                    Không tìm thấy sản phẩm
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    Thử thay đổi từ khóa hoặc bộ lọc
                  </p>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Xóa bộ lọc →
                  </button>
                </div>
              )}

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-blue-400 hover:text-blue-600 disabled:opacity-30"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handlePageChange(n)}
                      className={`h-11 w-11 rounded-xl text-sm font-bold transition-all shadow-sm ${
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
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-blue-400 hover:text-blue-600 disabled:opacity-30"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <p className="text-center text-gray-400 text-sm mt-3">
                  Trang {page} / {totalPages} — {filtered.length} sản phẩm
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
