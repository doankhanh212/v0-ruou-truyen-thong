'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ZALO_PHONE } from '@/utils/zalo'
import { track } from '@/utils/track'
import { getHeaderColorStyle } from '@/lib/header-colors'

const DEFAULT_NAV = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/gioi-thieu', label: 'Giới thiệu' },
  { href: '/lien-he', label: 'Liên hệ' },
]

interface NavLink { href: string; label: string }

interface HeaderProps {
  zaloUrl?: string
  siteName?: string
  navLinks?: NavLink[]
  zaloLabel?: string
  colorPreset?: string
}

function normalizeNavHref(href: string) {
  const value = href.trim()
  if (!value) return '/'
  const lower = value.toLowerCase().replace(/^\/+|\/+$/g, '')
  if (lower === 'trang-chu' || lower === 'trangchu' || lower === 'home') return '/'
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('#')) return value
  return value.startsWith('/') ? value : `/${value}`
}

export function Header({ zaloUrl, siteName, navLinks, zaloLabel, colorPreset }: HeaderProps = {}) {
  const zaloHref = zaloUrl?.trim() || `https://zalo.me/${ZALO_PHONE}`
  const NAV_LINKS = (navLinks && navLinks.length > 0 ? navLinks : DEFAULT_NAV).map((link) => ({
    ...link,
    href: normalizeNavHref(link.href),
  }))
  const displayName = siteName?.trim() || 'Rượu Truyền Thống'
  const btnLabel = zaloLabel?.trim() || 'Chat Zalo'
  const headerColor = getHeaderColorStyle(colorPreset, 'white')
  const isDarkText = headerColor.textTone === 'dark'
  const headerBorderClass = isDarkText ? 'border-border' : 'border-white/15'
  const brandTextClass = isDarkText ? 'text-primary' : 'text-white'
  const logoClass = isDarkText ? 'bg-primary text-white' : 'bg-white/15 text-white ring-1 ring-white/25'
  const menuButtonClass = isDarkText ? 'text-foreground' : 'text-white'
  const activeLinkClass = isDarkText ? 'text-primary font-semibold' : 'text-white font-semibold'
  const inactiveLinkClass = isDarkText ? 'text-foreground hover:text-primary' : 'text-white/85 hover:text-white'
  const mobileMenuClass = isDarkText ? 'bg-white border-border' : 'border-white/15'
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
    <header
      className={`sticky top-0 z-50 border-b ${headerBorderClass} ${headerColor.className}`}
      style={headerColor.style}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${logoClass}`}>
            𝔐
          </div>
          <span className={`text-lg font-semibold hidden sm:inline ${brandTextClass}`}>{displayName}</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href
                  ? activeLinkClass
                  : inactiveLinkClass
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
            {btnLabel}
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
          {isOpen ? <X size={24} className={menuButtonClass} /> : <Menu size={24} className={menuButtonClass} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className={`md:hidden border-t ${mobileMenuClass}`}>
          <div className="px-4 py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex min-h-11 w-full items-center rounded-lg py-2 transition-colors ${
                  pathname === link.href
                    ? activeLinkClass
                    : inactiveLinkClass
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
              {btnLabel}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
