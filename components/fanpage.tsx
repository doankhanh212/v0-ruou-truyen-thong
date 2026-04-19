'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ThumbsUp, MessageCircle, Share2, ExternalLink } from 'lucide-react'

const FACEBOOK_URL = 'https://www.facebook.com/cuulongmytuu'

const SAMPLE_POSTS = [
  {
    date: '2 ngày trước',
    text: 'Bộ quà Tết Lộc Xuân 2025 đã sẵn sàng! Thiết kế hộp mở cánh sang trọng, phối 2 chai rượu dược liệu cao cấp — phù hợp biếu đối tác, khách hàng dịp đầu năm.',
    image: '/catalog/bo-qua-tang-loc-xuan.jpg',
    likes: 128,
    comments: 24,
    shares: 15,
  },
  {
    date: '5 ngày trước',
    text: 'Tây Dương Sâm Tửu — dòng cao cấp nhất của Cửu Long Mỹ Tửu. Bình sứ Bát Tràng, nhụy hoa nghệ tây, nồng độ 33%. Sẵn hộp lục giác và túi nhung.',
    image: '/catalog/tay-duong-sam-tuu-poster.jpg',
    likes: 96,
    comments: 18,
    shares: 8,
  },
  {
    date: '1 tuần trước',
    text: 'Cảm ơn 1.000+ khách hàng đã tin tưởng Somo Gold trong năm qua! Chúng tôi cam kết tiếp tục giữ vững chất lượng, đạt chuẩn ISO 22000:2018 & OCOP 4 sao.',
    likes: 215,
    comments: 42,
    shares: 31,
  },
]

export function Fanpage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-10 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            Cộng Đồng Cửu Long Mỹ Tửu
          </h2>
          <p className="text-foreground/60 text-lg">
            Theo dõi Fanpage để cập nhật sản phẩm mới và ưu đãi đặc biệt
          </p>
        </div>

        {/* Page header card */}
        <div
          className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Cover */}
          <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary to-primary/80">
            <div className="absolute inset-0 bg-[url('/catalog/ruou-truyen-thong-cover.jpg')] bg-cover bg-center opacity-30" />
          </div>

          {/* Page info */}
          <div className="px-5 pb-5 -mt-8 relative">
            <div className="flex items-end gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border-4 border-white shadow-md flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full rounded-lg bg-primary flex items-center justify-center text-white font-bold text-2xl sm:text-3xl">
                  𝔐
                </div>
              </div>
              <div className="min-w-0 flex-1 pt-8">
                <h3 className="text-base font-bold leading-tight text-gray-900 sm:text-xl">
                  Cửu Long Mỹ Tửu — Somo Gold
                </h3>
                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  1.2K người theo dõi · Rượu truyền thống cao cấp
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166FE5]"
              >
                <ThumbsUp size={15} />
                Thích trang
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ExternalLink size={15} />
                Xem Fanpage
              </a>
            </div>
          </div>
        </div>

        {/* Sample posts */}
        <div className="space-y-4">
          {SAMPLE_POSTS.map((post, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${(idx + 1) * 150}ms` }}
            >
              {/* Post header */}
              <div className="px-5 pt-4 pb-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  𝔐
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Cửu Long Mỹ Tửu</p>
                  <p className="text-xs text-gray-400">{post.date}</p>
                </div>
              </div>

              {/* Post text */}
              <p className="px-5 pb-3 text-sm text-gray-700 leading-relaxed">{post.text}</p>

              {/* Post image */}
              {post.image && (
                <div className="relative aspect-[16/9] bg-slate-100">
                  <Image src={post.image} alt="" fill className="object-cover" />
                </div>
              )}

              {/* Engagement bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-5 py-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 sm:gap-4">
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={13} className="text-[#1877F2]" />
                    {post.likes}
                  </span>
                  <span>{post.comments} bình luận</span>
                  <span>{post.shares} chia sẻ</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2 border-t border-gray-100 px-3 py-2 sm:flex sm:px-5">
                <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg py-2 text-xs text-gray-500 transition-colors hover:bg-gray-50 sm:flex-1 sm:text-sm">
                  <ThumbsUp size={16} />
                  Thích
                </button>
                <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg py-2 text-xs text-gray-500 transition-colors hover:bg-gray-50 sm:flex-1 sm:text-sm">
                  <MessageCircle size={16} />
                  Bình luận
                </button>
                <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg py-2 text-xs text-gray-500 transition-colors hover:bg-gray-50 sm:flex-1 sm:text-sm">
                  <Share2 size={16} />
                  Chia sẻ
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* See all CTA */}
        <div className="text-center mt-8">
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1877F2] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#166FE5] shadow-lg shadow-blue-500/20 sm:px-8"
          >
            Xem tất cả bài viết trên Facebook
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </section>
  )
}
