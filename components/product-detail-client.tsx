"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, MessageCircle, Package2 } from "lucide-react";
import { useCatalogProduct } from "@/hooks/use-catalog-products";
import { formatCatalogPrice } from "@/lib/catalog";
import { openZalo } from "@/utils/zalo";

interface ProductDetailClientProps {
  slug: string;
  categoryHref?: string;
  categoryLabel?: string;
}

export function ProductDetailClient({
  slug,
  categoryHref,
  categoryLabel,
}: ProductDetailClientProps) {
  const { product, loading, error } = useCatalogProduct(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-500">Dang tai chi tiet san pham...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Khong the tai chi tiet san pham</h1>
          <p className="mt-3 text-sm text-red-700">{error}</p>
          <Link
            href="/san-pham"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            Quay lai danh sach san pham
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Khong tim thay san pham</h1>
          <p className="mt-3 text-sm text-gray-500">
            San pham nay chua co trong co so du lieu hoac tam thoi khong kha dung.
          </p>
          <Link
            href="/san-pham"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            Quay lai danh sach san pham
          </Link>
        </div>
      </div>
    );
  }

  const itemGallery = product.gallery?.length ? product.gallery : [product.image];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/san-pham"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            <ChevronLeft size={16} />
            Quay lai san pham
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Cuu Long My Tuu
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900 md:text-4xl">{product.name}</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-white">
              <Image
                src={itemGallery[0] ?? product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {itemGallery.length > 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {itemGallery.slice(1).map((image, index) => (
                <div key={`${image}-${index}`} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                  <div className="relative aspect-[4/5] bg-slate-50">
                    <Image
                      src={image}
                      alt={`${product.name} mẫu ${index + 2}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Link
                href={categoryHref ?? `/san-pham?category=${product.category}`}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                {categoryLabel ?? product.category}
              </Link>
              {product.tag ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                  {product.tag}
                </span>
              ) : null}
            </div>

            <p className="text-base leading-7 text-gray-600">{product.description}</p>

            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Thong tin</p>
                <p className="mt-1 font-medium text-gray-900">{product.alcohol}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phu hop</p>
                <p className="mt-1 font-medium text-gray-900">{product.target}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Diem noi bat</h2>
            <div className="mt-3 space-y-2.5">
              {product.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {product.ingredients.length > 0 ? (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Thanh phan</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => openZalo(undefined, `Xin chao, toi muon tu van ${product.name}`)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0068FF] px-5 py-3 text-base font-bold text-white transition-colors hover:bg-[#0057d6] sm:w-auto"
            >
              <MessageCircle size={18} />
              Tu van qua Zalo
            </button>
            <Link
              href="/lien-he"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-base font-bold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700 sm:w-auto"
            >
              Gui yeu cau lien he
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
            <Package2 size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Bang gia tham khao</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-slate-50 text-left text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Quy cach</th>
                  <th className="px-6 py-3 font-semibold">Dung tich</th>
                  <th className="px-6 py-3 font-semibold">Gia chua VAT</th>
                  <th className="px-6 py-3 font-semibold">Gia co VAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {product.pricing.map((option) => (
                  <tr key={`${option.packaging}-${option.volume}`}>
                    <td className="px-6 py-4">{option.packaging}</td>
                    <td className="px-6 py-4">{option.volume}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCatalogPrice(option.priceBeforeVAT)}d
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-700">
                      {formatCatalogPrice(option.priceWithVAT)}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
