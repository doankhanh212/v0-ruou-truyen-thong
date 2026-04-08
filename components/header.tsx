'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
            𝔐
          </div>
          <span className="text-lg font-semibold text-primary hidden sm:inline">Rượu Truyền Thống</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('hero')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Trang chủ
          </button>
          <Link
            href="/san-pham"
            className="text-foreground hover:text-primary transition-colors"
          >
            Sản Phẩm
          </Link>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Bảng Giá
          </button>
          <button
            onClick={() => scrollToSection('story')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Giới Thiệu
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="text-foreground hover:text-primary transition-colors"
          >
            Liên Hệ
          </button>
          <a
            href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0999999999'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors"
          >
            Liên Hệ
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-4">
            <button
              onClick={() => scrollToSection('categories')}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2"
            >
              Danh Mục
            </button>
            <Link
              href="/san-pham"
              onClick={() => setIsOpen(false)}
              className="block text-foreground hover:text-primary transition-colors py-2"
            >
              Sản Phẩm
            </Link>
            <button
              onClick={() => scrollToSection('story')}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2"
            >
              Câu Chuyện
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="block w-full text-left text-foreground hover:text-primary transition-colors py-2"
            >
              Lợi Ích
            </button>
            <a
              href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0999999999'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-primary text-white px-4 py-2 rounded-lg text-center hover:bg-secondary transition-colors"
            >
              Liên Hệ
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
