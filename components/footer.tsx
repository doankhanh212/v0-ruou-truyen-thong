'use client'

import Link from 'next/link'
import { FanpageWidget } from '@/components/fanpage'
import { track } from '@/utils/track'

interface FooterProps {
  fanpageUrl?: string
  brandName?: string
  brandDesc?: string
  copyright?: string
  phone?: string
  email?: string
  address?: string
  showFanpage?: boolean
}

export function Footer({
  fanpageUrl,
  brandName,
  brandDesc,
  copyright,
  phone,
  email,
  address,
  showFanpage = true,
}: FooterProps = {}) {
  const currentYear = new Date().getFullYear()
  const name = brandName?.trim() || 'Rượu Truyền Thống'
  const desc = brandDesc?.trim() || 'Rượu truyền thống cao cấp — chưng cất từ dược liệu Việt Nam theo phương pháp truyền thống.'
  const copyrightText = copyright?.trim() || `${name}. Tất cả các quyền được bảo lưu.`
  const phoneText = phone?.trim() || ''
  const emailText = email?.trim() || ''
  const addressText = address?.trim() || ''

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2 ${showFanpage ? 'xl:grid-cols-[1.1fr_0.8fr_0.9fr_0.9fr_1.3fr]' : 'xl:grid-cols-4'}`}>
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary font-bold text-lg">
                𝔐
              </div>
              <h3 className="font-bold text-lg">{name}</h3>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
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
                <Link href="/news" className="inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white">
                  Tin Tức
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
              {phoneText && (
                <li className="text-white/70">
                  <a
                    href={fanpageUrl ? `https://zalo.me/${phoneText.replace(/\D/g, '')}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('click_zalo', { source: 'footer' })}
                    className="hover:text-white transition-colors"
                  >
                    📱 {phoneText}
                  </a>
                </li>
              )}
              {emailText && (
                <li className="text-white/70">
                  <a href={`mailto:${emailText}`} className="hover:text-white transition-colors">
                    📧 {emailText}
                  </a>
                </li>
              )}
              {addressText && (
                <li className="text-white/70">
                  <span>📍 {addressText}</span>
                </li>
              )}
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

          {showFanpage && (
            <div className="sm:col-span-2 xl:col-span-1">
              <h4 className="mb-4 font-bold">Fanpage</h4>
              <FanpageWidget fanpageUrl={fanpageUrl} compact />
            </div>
          )}
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
            <p className="text-center text-sm text-white/70 md:text-left">
              © {currentYear} {copyrightText}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
