import Image from 'next/image'
import { ExternalLink, MessageCircle, Share2, ThumbsUp } from 'lucide-react'

const DEFAULT_FACEBOOK_URL = 'https://www.facebook.com/cuulongmytuu'

const SAMPLE_POSTS = [
  {
    date: 'khoảng 3 tháng trước',
    text: 'BỘ SƯU TẬP CỬU LONG MỸ TỬU - BÌNH SỨ BÁT TRÀNG CAO CẤP. Lựa chọn quà biếu chỉn chu cho gia đình, đối tác và khách hàng dịp lễ Tết.',
    image: '/catalog/bo-qua-tang-loc-xuan.jpg',
    likes: 186,
    comments: 21,
    shares: 9,
  },
  {
    date: 'khoảng 2 tháng trước',
    text: 'Tây Dương Sâm Tửu là dòng quà biếu cao cấp nổi bật của Somo Gold với bình sứ Bát Tràng, nhụy hoa nghệ tây và nhiều quy cách đóng gói đẹp mắt.',
    image: '/catalog/tay-duong-sam-tuu-poster.jpg',
    likes: 124,
    comments: 17,
    shares: 6,
  },
]

interface FanpageWidgetProps {
  fanpageUrl?: string
  compact?: boolean
}

export function FanpageWidget({ fanpageUrl, compact = false }: FanpageWidgetProps = {}) {
  const FACEBOOK_URL = fanpageUrl?.trim() || DEFAULT_FACEBOOK_URL

  if (compact) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-white text-slate-900 shadow-lg">
        <div className="relative h-20 bg-[#dfe9f7]">
          <Image
            src="/catalog/ruou-truyen-thong-cover.jpg"
            alt="Cover fanpage Cửu Long Mỹ Tửu"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent" />
        </div>
        <div className="px-3 pb-3 pt-2">
          <div className="-mt-7 flex items-end gap-2.5">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border-4 border-white bg-white shadow-sm">
              <Image
                src="/catalog/cuu-long-my-tuu-cover.jpg"
                alt="Avatar fanpage Cửu Long Mỹ Tửu"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 pb-0.5">
              <h3 className="truncate text-sm font-bold text-slate-900">Cửu Long Mỹ Tửu</h3>
              <p className="text-xs text-slate-500">30.8K người theo dõi</p>
            </div>
          </div>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#166FE5]"
          >
            <ThumbsUp size={14} />
            Theo dõi Trang
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#1877F2] hover:underline"
          >
            Xem fanpage
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/15 bg-[#f0f2f5] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-[#f7f8fa] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Fanpage
        </div>

        <div className="relative h-28 bg-[#dfe9f7]">
          <Image
            src="/catalog/ruou-truyen-thong-cover.jpg"
            alt="Cover fanpage Cửu Long Mỹ Tửu"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
        </div>

        <div className="relative px-4 pb-4 pt-3">
          <div className="-mt-10 flex items-end gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
              <Image
                src="/catalog/cuu-long-my-tuu-cover.jpg"
                alt="Avatar fanpage Cửu Long Mỹ Tửu"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h3 className="truncate text-lg font-bold text-slate-900">
                Cửu Long Mỹ Tửu
              </h3>
              <p className="text-sm text-slate-500">30.8K người theo dõi</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166FE5]"
            >
              <ThumbsUp size={16} />
              Theo dõi Trang
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Share2 size={15} />
              Chia sẻ
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-[#f7f8fa] p-2">
            <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
              {SAMPLE_POSTS.map((post, idx) => (
                <article key={idx} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center gap-3 px-4 pt-4">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                      <Image
                        src="/catalog/cuu-long-my-tuu-cover.jpg"
                        alt="Avatar bài viết Cửu Long Mỹ Tửu"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">Cửu Long Mỹ Tửu</p>
                      <p className="text-xs text-slate-400">{post.date}</p>
                    </div>
                  </div>

                  <p className="px-4 pb-3 pt-3 text-sm leading-6 text-slate-700">{post.text}</p>

                  {post.image && (
                    <div className="relative aspect-[16/10] bg-slate-100">
                      <Image src={post.image} alt="Bài viết fanpage Cửu Long Mỹ Tửu" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp size={13} className="text-[#1877F2]" />
                      {post.likes}
                    </span>
                    <span>{post.comments} bình luận</span>
                    <span>{post.shares} chia sẻ</span>
                  </div>

                  <div className="grid grid-cols-3 border-t border-slate-100 px-2 py-2">
                    <button type="button" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 sm:text-sm">
                      <ThumbsUp size={15} />
                      Thích
                    </button>
                    <button type="button" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 sm:text-sm">
                      <MessageCircle size={15} />
                      Bình luận
                    </button>
                    <button type="button" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 sm:text-sm">
                      <Share2 size={15} />
                      Chia sẻ
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#166FE5]"
          >
            Xem fanpage thật
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </div>
  )
}
