'use client'

import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary font-bold text-lg">
                𝔐
              </div>
              <h3 className="font-bold text-lg">Cửu Long Mỹ Tửu</h3>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Rượu truyền thống cao cấp — Công Ty Cổ Phần Somo Gold. Đạt tiêu chuẩn ISO 22000:2018 & OCOP 4 sao.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/san-pham" className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white">
                  Sản Phẩm
                </Link>
              </li>
              <li>
                <Link href="/bang-gia" className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white">
                  Bảng Giá
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white">
                  Giới Thiệu
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white">
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Liên Hệ</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-white/70">
                <a
                  href="https://zalo.me/84902931119"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  📱 0909 799 311 – 0902 931 119
                </a>
              </li>
              <li className="text-white/70">
                <a href="mailto:somogold@somogroup.vn" className="hover:text-white transition-colors">
                  📧 somogold@somogroup.vn
                </a>
              </li>
              <li className="text-white/70">
                <span>📍 29 Nguyễn Khắc Nhu, P. Cầu Ông Lãnh, TP. HCM</span>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-bold mb-4">Chính Sách</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/lien-he" className="inline-flex min-h-11 items-center text-white/70 transition-colors hover:text-white">
                  Điều Khoản Dịch Vụ
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="inline-flex min-h-11 items-center text-white/70 transition-colors hover:text-white">
                  Chính Sách Bảo Mật
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="inline-flex min-h-11 items-center text-white/70 transition-colors hover:text-white">
                  Chính Sách Hoàn Trả
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <p className="text-center text-sm text-white/70 md:text-left">
              © {currentYear} Cửu Long Mỹ Tửu — Somo Gold. Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
              <a href="https://www.facebook.com/cuulongmytuu" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white">
                Facebook
              </a>
              <a href="https://www.instagram.com/cuulongmytuu" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white">
                Instagram
              </a>
              <a href="https://www.tiktok.com/@cuulongmytuu" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white">
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
