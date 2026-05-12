"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, Eye, MessageCircle, Package2, Users } from "lucide-react";
import { useCatalogProduct } from "@/hooks/use-catalog-products";
import { formatCatalogPrice } from "@/lib/catalog";
import { openZalo } from "@/utils/zalo";
import { getSessionId } from "@/utils/track";

interface ProductDetailClientProps {
  slug: string;
  categoryHref?: string;
  categoryLabel?: string;
  inStock?: boolean;
}

function formatViewCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

function useProductViews(slug: string) {
  const [total, setTotal] = useState<number | null>(null);
  const [viewing, setViewing] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    const sessionId = getSessionId();

    async function heartbeat() {
      try {
        await fetch(`/api/products/${slug}/views`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
          keepalive: true,
        });
      } catch {
        // Best effort — tracking failures must never break the page.
      }
    }

    async function poll() {
      try {
        const res = await fetch(`/api/products/${slug}/views`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setTotal(typeof data.total === "number" ? data.total : 0);
          setViewing(typeof data.viewing === "number" ? data.viewing : 0);
        }
      } catch {
        // ignore
      }
    }

    function startTimers() {
      if (heartbeatTimer || pollTimer) return;
      heartbeat().then(poll);
      heartbeatTimer = setInterval(heartbeat, 30_000);
      pollTimer = setInterval(poll, 15_000);
    }

    function stopTimers() {
      if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }

    function onVisibilityChange() {
      // Pause heartbeat when the tab is hidden so the live count reflects
      // real concurrent viewers, not abandoned tabs. The server-side ZSET
      // entry will TTL out within 60s and the user disappears from the count.
      if (document.hidden) stopTimers();
      else { startTimers(); poll(); }
    }

    if (typeof document !== "undefined" && !document.hidden) startTimers();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      stopTimers();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [slug]);

  return { total, viewing };
}

export function ProductDetailClient({
  slug,
  categoryHref,
  categoryLabel,
  inStock = true,
}: ProductDetailClientProps) {
  const { product, loading, error } = useCatalogProduct(slug);
  const { total: totalViews, viewing: viewingNow } = useProductViews(slug);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-500">Đang tải chi tiết sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Không thể tải chi tiết sản phẩm</h1>
          <p className="mt-3 text-sm text-red-700">{error}</p>
          <Link
            href="/san-pham"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h1>
          <p className="mt-3 text-sm text-gray-500">
            Sản phẩm này chưa có trong cơ sở dữ liệu hoặc tạm thời không khả dụng.
          </p>
          <Link
            href="/san-pham"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            Quay lại danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const itemGallery = product.gallery?.length ? product.gallery : [product.image];
  const safeActiveIndex = Math.min(activeImageIndex, itemGallery.length - 1);
  const mainImage = itemGallery[safeActiveIndex] ?? product.image;

  return (
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Rượu Truyền Thống
              </p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900 md:text-4xl">{product.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {!inStock && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 font-semibold text-red-600 ring-1 ring-red-200">
                  Tạm hết hàng
                </span>
              )}
              {inStock && totalViews !== null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-700">
                  <Eye size={13} />
                  {formatViewCount(totalViews)} lượt xem
                </span>
              )}
              {inStock && viewingNow > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <Users size={13} />
                  {viewingNow} người đang xem
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-white">
              <Image
                key={mainImage}
                src={mainImage}
                alt={product.imageAlt || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {itemGallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {itemGallery.map((image, index) => {
                const isActive = index === safeActiveIndex;
                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Xem ảnh ${index + 1}`}
                    aria-current={isActive}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all sm:h-24 sm:w-24 ${
                      isActive
                        ? "border-blue-500 shadow-md ring-2 ring-blue-100"
                        : "border-gray-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ảnh ${index + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
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
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Thông tin</p>
                <p className="mt-1 font-medium text-gray-900">{product.alcohol}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phù hợp</p>
                <p className="mt-1 font-medium text-gray-900">{product.target}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Điểm nổi bật</h2>
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
          ) : null}

          {inStock ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => openZalo(undefined, `Xin chào, tôi muốn tư vấn ${product.name}`)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0068FF] px-5 py-3 text-base font-bold text-white transition-colors hover:bg-[#0057d6] sm:w-auto"
              >
                <MessageCircle size={18} />
                Tư vấn qua Zalo
              </button>
              <Link
                href="/lien-he"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-gray-200 px-5 py-3 text-base font-bold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700 sm:w-auto"
              >
                Gửi yêu cầu liên hệ
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
              <p className="font-semibold">Sản phẩm tạm thời hết hàng</p>
              <p className="mt-1 text-red-600/80">
                Liên hệ để được thông báo khi có hàng trở lại hoặc xem các sản phẩm tương tự.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openZalo(undefined, `Xin chào, tôi muốn hỏi về ${product.name} khi có hàng trở lại`)}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0057d6] sm:w-auto"
                >
                  <MessageCircle size={16} />
                  Hỏi qua Zalo
                </button>
                <Link
                  href="/san-pham"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:border-blue-300 hover:text-blue-700 sm:w-auto"
                >
                  Xem sản phẩm khác
                </Link>
              </div>
            </div>
          )}
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
                {product.pricing.map((option) => (
                  <tr key={`${option.packaging}-${option.volume}`}>
                    <td className="px-6 py-4">{option.packaging}</td>
                    <td className="px-6 py-4">{option.volume}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCatalogPrice(option.priceBeforeVAT)}đ
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-700">
                      {formatCatalogPrice(option.priceWithVAT)}đ
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
