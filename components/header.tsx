'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ZALO_PHONE } from '@/utils/zalo'
import { track } from '@/utils/track'

const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/news', label: 'Tin tức' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/lien-he', label: 'Liên hệ' },
]

interface HeaderProps {
  zaloUrl?: string
}

export function Header({ zaloUrl }: HeaderProps = {}) {
  const zaloHref = zaloUrl?.trim() || `https://zalo.me/${ZALO_PHONE}`
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
            𝔐
          </div>
          <span className="text-lg font-semibold text-primary hidden sm:inline">Rượu Truyền Thống</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href
                  ? 'text-primary font-semibold'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={zaloHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('click_zalo', { source: 'header_desktop' })}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0068FF] px-6 py-2 text-white transition-colors hover:bg-[#0057d6]"
          >
            Chat Zalo
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden flex min-h-11 min-w-11 items-center justify-center p-2"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-11 w-full items-center rounded-lg py-2 transition-colors ${
                  pathname === link.href
                    ? 'text-primary font-semibold'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={zaloHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('click_zalo', { source: 'header_mobile' })}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#0068FF] px-4 py-2 text-center text-white transition-colors hover:bg-[#0057d6]"
            >
              Chat Zalo
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
