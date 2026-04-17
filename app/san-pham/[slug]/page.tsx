import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, ChevronLeft, MessageCircle, Package2 } from 'lucide-react'
import {
  companyInfo,
  formatPrice,
  getGiftSetBySlug,
  getProductBySlug,
  giftSets,
  products,
} from '@/data/products'

interface ProductDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return [...products, ...giftSets].map((item) => ({ slug: item.slug }))
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  const giftSet = getGiftSetBySlug(slug)

  if (!product && !giftSet) {
    redirect('/')
  }

  const itemName = product?.name ?? giftSet!.name
  const itemImage = product?.image ?? giftSet!.image
  const itemGallery = product?.gallery ?? giftSet?.gallery ?? [itemImage]
  const itemDescription = product?.description ?? giftSet!.description
  const itemCategory = product?.category ?? 'quà tặng'
  const itemBenefits = product?.benefits ?? giftSet?.benefits ?? ['Sang trọng', 'Biếu tặng', 'Hộp quà cao cấp']
  const itemTarget = product?.target ?? giftSet?.target ?? 'Phù hợp biếu tặng sang trọng'
  const itemTag = product?.tag ?? giftSet?.tag

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <Link
              href="/san-pham"
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-700"
            >
              <ChevronLeft size={16} />
              Quay lại sản phẩm
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Cửu Long Mỹ Tửu
              </p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900 md:text-4xl">
                {itemName}
              </h1>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-white">
                <Image
                  src={itemGallery[0] ?? itemImage}
                  alt={itemName}
                  fill
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
                        alt={`${itemName} mẫu ${index + 2}`}
                        fill
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
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {itemCategory}
                </span>
                {itemTag && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                    {itemTag}
                  </span>
                )}
              </div>

              <p className="text-base leading-7 text-gray-600">{itemDescription}</p>

              <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-gray-600 sm:grid-cols-2">
                {product && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Nồng độ</p>
                    <p className="mt-1 font-medium text-gray-900">{product.alcohol}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phù hợp</p>
                  <p className="mt-1 font-medium text-gray-900">{itemTarget}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Điểm nổi bật</h2>
              <div className="mt-3 space-y-2.5">
                {itemBenefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-green-600" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {product && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Thành phần</h2>
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
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`https://zalo.me/${companyInfo.phone[1].replace(/\s/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Nhắn Zalo về ${itemName}`}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0068FF] px-5 py-3 text-base font-bold text-white transition-colors hover:bg-[#0057d6] sm:w-auto"
              >
                <MessageCircle size={18} />
                Tư vấn qua Zalo
              </a>
              <Link
                href="/lien-he"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-base font-bold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700 sm:w-auto"
              >
                Gửi yêu cầu liên hệ
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
              <Package2 size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Bảng giá tham khảo</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-slate-50 text-left text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Quy cách</th>
                    <th className="px-6 py-3 font-semibold">Dung tích</th>
                    <th className="px-6 py-3 font-semibold">Giá chưa VAT</th>
                    <th className="px-6 py-3 font-semibold">Giá có VAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                  {product
                    ? product.pricing.map((option) => (
                        <tr key={`${option.packaging}-${option.volume}`}>
                          <td className="px-6 py-4">{option.packaging}</td>
                          <td className="px-6 py-4">{option.volume}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {formatPrice(option.priceBeforeVAT)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-blue-700">
                            {formatPrice(option.priceWithVAT)}
                          </td>
                        </tr>
                      ))
                    : giftSet!.variants.map((variant) => (
                        <tr key={`${variant.label}-${variant.volume}`}>
                          <td className="px-6 py-4">{variant.label}</td>
                          <td className="px-6 py-4">{variant.volume}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {formatPrice(variant.priceBeforeVAT)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-blue-700">
                            {formatPrice(variant.priceWithVAT)}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}