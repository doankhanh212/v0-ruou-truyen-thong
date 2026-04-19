'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ExternalLink, MessageCircle, Share2, ThumbsUp } from 'lucide-react'

const FACEBOOK_URL = 'https://www.facebook.com/cuulongmytuu'

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

export function Fanpage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="bg-gradient-to-b from-sky-50 via-white to-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-10 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#1877F2]">
            Fanpage Facebook
          </p>
          <h2 className="mb-3 text-3xl font-bold text-primary md:text-4xl">
            Fanpage giống kiểu Facebook widget
          </h2>
          <p className="text-lg text-foreground/60">
            Giữ đúng tinh thần phần fanpage ở site cũ nhưng làm sạch hơn để hiển thị tốt trên mobile và desktop
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div
            className={`rounded-[32px] border border-sky-100 bg-white p-6 shadow-[0_18px_50px_rgba(24,119,242,0.08)] transition-all duration-700 sm:p-8 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="mb-3 inline-flex rounded-full bg-[#1877F2]/10 px-3 py-1 text-xs font-semibold text-[#1877F2]">
              Mô phỏng theo fanpage box ở site cũ
            </p>
            <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Giao diện giống Facebook Page Plugin, nhưng chủ động hơn về nội dung
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Phần này được làm theo đúng tinh thần khối fanpage trong ảnh bạn gửi: có tên trang, lượt theo dõi,
              nút theo dõi, nút chia sẻ và preview bài viết ngay trong một card trắng giống widget Facebook.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                Giữ được cảm giác quen thuộc với khách từ site cũ.
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                Không cần iframe nên load nhẹ hơn và kiểm soát UI tốt hơn.
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                Mobile vẫn xem tốt, không bị vỡ khung như plugin thật.
              </div>
            </div>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#1877F2] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#166FE5]"
            >
              Xem fanpage thật
              <ExternalLink size={15} />
            </a>
          </div>

          <div
            className={`rounded-[28px] border border-slate-200 bg-[#f0f2f5] p-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)] transition-all duration-700 sm:p-4 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '120ms' }}
          >
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-[#f7f8fa] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Fanpage
              </div>

              <div className="relative h-28 bg-[#dfe9f7] sm:h-32">
                <Image
                  src="/catalog/ruou-truyen-thong-cover.jpg"
                  alt="Cover fanpage Cửu Long Mỹ Tửu"
                  fill
                  className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
              </div>

              <div className="relative px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                <div className="-mt-10 flex items-end gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md sm:h-24 sm:w-24">
                    <Image
                      src="/catalog/cuu-long-my-tuu-cover.jpg"
                      alt="Avatar fanpage Cửu Long Mỹ Tửu"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <h3 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
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

                <div className="mt-4 rounded-2xl border border-slate-200 bg-[#f7f8fa] p-2 sm:p-3">
                  <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                    {SAMPLE_POSTS.map((post, idx) => (
                      <article key={idx} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 px-4 pt-4">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                            <Image
                              src="/catalog/cuu-long-my-tuu-cover.jpg"
                              alt="Avatar bài viết Cửu Long Mỹ Tửu"
                              fill
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
                            <Image src={post.image} alt="Bài viết fanpage Cửu Long Mỹ Tửu" fill className="object-cover" />
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
