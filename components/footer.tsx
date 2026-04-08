'use client'

import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary font-bold text-sm">
                CL
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
                <button
                  onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Danh Mục
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Sản Phẩm
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Lợi Ích
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Câu Chuyện
                </button>
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
                <span>📧 somogold@somogroup.vn</span>
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
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Điều Khoản Dịch Vụ
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Chính Sách Bảo Mật
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Chính Sách Hoàn Trả
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-white/70 text-sm">
              © {currentYear} Cửu Long Mỹ Tửu — Somo Gold. Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Facebook
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                Instagram
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors text-sm">
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
