'use client'

import { MessageCircle, Phone } from 'lucide-react'

const ZALO_PHONE = process.env.NEXT_PUBLIC_ZALO_PHONE || '0999999999'

export function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      {/* Zalo Button */}
      <a
        href={`https://zalo.me/${ZALO_PHONE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center hover:bg-accent/90 transition-all hover:scale-110"
        aria-label="Contact on Zalo"
      >
        <Phone size={24} />
      </a>
    </div>
  )
}
