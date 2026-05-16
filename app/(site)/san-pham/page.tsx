'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight,
  SlidersHorizontal, Filter, X,
  Search, Gift, Heart, Users,
} from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { useAllCatalogProducts } from '@/hooks/use-catalog-products'
import type { CatalogProduct } from '@/lib/catalog'
import { track } from '@/utils/track'

const ITEMS_PER_PAGE = 6

const ALL_CATEGORY = { id: 'all', label: 'Tất cả' }

type CategoryOption = { id: string; label: string }

interface RecommendPreset {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  activeColor: string
  match: (item: CatalogProduct) => boolean
}

// Strip Vietnamese diacritics → lowercase ASCII for fuzzy keyword matching.
function stripDiacritics(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
}

const RECOMMEND_PRESETS: RecommendPreset[] = [
  {
    id: 'gift',
    label: 'Mua làm quà',
    icon: <Gift size={15} />,
    color: 'border-amber-300 text-amber-700 hover:bg-amber-50',
    activeColor: 'bg-amber-500 text-white border-amber-500',
    match: (item) =>
      item.kind === 'gift-set' ||
      item.category === 'qua-tang' ||
      stripDiacritics(item.target).includes('bieu') ||
      (item.tag ? stripDiacritics(item.tag).includes('qua') : false),
  },
  {
    id: 'health',
    label: 'Dược liệu quý',
    icon: <Heart size={15} />,
    color: 'border-green-300 text-green-700 hover:bg-green-50',
    activeColor: 'bg-green-600 text-white border-green-600',
    match: (item) =>
      item.category === 'ruou-thuoc' ||
      item.benefits.some((benefit) =>
        ['duoc lieu', 'co phuong', 'dong y', 'boi bo'].some((keyword) =>
          stripDiacritics(benefit).includes(keyword)
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
      stripDiacritics(item.target).includes('nam') ||
      item.benefits.some((benefit) =>
        ['co phuong', 'nam gioi', 'sinh luc'].some((keyword) =>
          stripDiacritics(benefit).includes(keyword)
        )
      ),
  },
]

export default function SanPhamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SanPhamPageInner />
    </Suspense>
  )
}

function SanPhamPageInner() {
  const { products: allItems, loading, error } = useAllCatalogProducts()
  const searchParams = useSearchParams()
  const initialSearch = searchParams?.get('q')?.trim() || ''
  const pendingCategoryParam = searchParams?.get('category')?.trim().toLowerCase() || ''
  const [categories, setCategories] = useState<CategoryOption[]>([ALL_CATEGORY])
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState<string>('all')
  const [recommend, setRecommend] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('load_failed'))))
      .then((data: { categories: { slug: string; name: string }[] }) => {
        if (cancelled) return
        const options: CategoryOption[] = [
          ALL_CATEGORY,
          ...data.categories.map((c) => ({ id: c.slug, label: c.name })),
        ]
        setCategories(options)
        if (pendingCategoryParam && options.some((o) => o.id === pendingCategoryParam)) {
          setCategory(pendingCategoryParam)
        }
      })
      .catch((err) => console.error('[san-pham] failed to load categories', err))
    return () => {
      cancelled = true
    }
  }, [pendingCategoryParam])

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (search.trim()) {
        // Diacritic-insensitive search: "ruou" matches "Rượu", "Rượu" matches "ruou".
        const query = stripDiacritics(search)
        const haystack = stripDiacritics(
          [item.name, item.target, item.description, item.category].join(' ')
        )
        if (!haystack.includes(query)) return false
      }

      if (recommend) {
        const preset = RECOMMEND_PRESETS.find((entry) => entry.id === recommend)
        return preset ? preset.match(item) : true
      }

      if (category !== 'all' && item.category !== category) return false

      return true
    })
  }, [allItems, search, recommend, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const pageItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const hasActiveFilter =
    search.trim() !== '' ||
    category !== 'all' ||
    recommend !== null

  useEffect(() => {
    setPage(1)
  }, [search, category, recommend])

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

  const handleRecommend = (id: string) => {
    const next = recommend === id ? null : id
    setRecommend(next)
    if (next) {
      setCategory('all')
      track('ai_recommend', { preset: next })
    }
  }

  const clearAll = useCallback(() => {
    setSearch('')
    setCategory('all')
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

  const Sidebar = () => (
    <div className="space-y-5">
      <div className="md:hidden">
        <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
          Tìm kiếm
        </h4>
        <input
          type="text"
          value={search}
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Tên sản phẩm..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
          <Filter size={14} className="text-blue-600" />
          Danh mục
        </h3>
        <ul className="space-y-1">
          {categories.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => handleCategory(entry.id)}
                className={`min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  category === entry.id && !recommend
                    ? 'bg-blue-600 font-semibold text-white'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {hasActiveFilter ? (
        <button
          type="button"
          onClick={() => { clearAll(); setShowMobileFilter(false) }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-100"
        >
          <X size={14} />
          Xóa tất cả bộ lọc
        </button>
      ) : null}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Rượu Truyền Thống
          </p>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Sản phẩm rượu</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
            Danh mục rượu truyền thống cao cấp — cập nhật trực tiếp từ kho sản phẩm chính thức.
          </p>
          {error ? (
            <p className="mt-3 text-sm text-red-700">{error}</p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Tìm tên sản phẩm..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          <div className="flex w-full items-center gap-2 md:hidden">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setShowMobileFilter(true)}
              className="flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 shadow-sm"
            >
              <SlidersHorizontal size={15} />
              Lọc
              {hasActiveFilter ? <span className="h-2 w-2 rounded-full bg-blue-600" /> : null}
            </button>
          </div>

          <div className="hidden flex-wrap items-center gap-2 md:flex">
            {recommend ? (
              <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {RECOMMEND_PRESETS.find((entry) => entry.id === recommend)?.label}
                <button type="button" onClick={() => setRecommend(null)}><X size={11} /></button>
              </span>
            ) : null}
            {category !== 'all' && !recommend ? (
              <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {categories.find((entry) => entry.id === category)?.label}
                <button type="button" onClick={() => setCategory('all')}><X size={11} /></button>
              </span>
            ) : null}
            {search.trim() ? (
              <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                "{search}"
                <button type="button" onClick={() => setSearch('')}><X size={11} /></button>
              </span>
            ) : null}
            {hasActiveFilter ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Xóa tất cả
              </button>
            ) : null}
          </div>
        </div>

        {showMobileFilter ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileFilter(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[min(20rem,86vw)] overflow-y-auto bg-gray-50 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
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
        ) : null}

        <div className="flex gap-6">
          <aside className="hidden w-48 flex-shrink-0 md:block lg:w-52">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="aspect-square animate-pulse bg-slate-100" />
                    <div className="space-y-3 p-5">
                      <div className="h-5 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 animate-pulse rounded bg-slate-100" />
                      <div className="h-10 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
                <p className="text-lg font-semibold text-red-800">
                  Không thể tải danh mục sản phẩm
                </p>
                <p className="mt-2 text-sm text-red-700">
                  {error}
                </p>
              </div>
            ) : pageItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pageItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="mb-2 text-lg font-medium text-gray-500">
                  Không tìm thấy sản phẩm
                </p>
                <p className="mb-6 text-sm text-gray-400">
                  Thử thay đổi từ khóa hoặc bộ lọc
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {totalPages > 1 ? (
              <>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 sm:h-11 sm:w-11"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => handlePageChange(pageNumber)}
                      className={`h-10 w-10 rounded-xl text-sm font-bold shadow-sm transition-all sm:h-11 sm:w-11 ${
                        page === pageNumber
                          ? 'bg-blue-600 text-white shadow-blue-200'
                          : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 sm:h-11 sm:w-11"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <p className="mt-3 text-center text-sm text-gray-400">
                  Trang {page} / {totalPages} — {filtered.length} sản phẩm
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
