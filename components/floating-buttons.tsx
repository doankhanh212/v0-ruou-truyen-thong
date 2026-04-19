'use client'

import { Phone } from 'lucide-react'
import { openZalo, HOTLINE, ZALO_PHONE } from '@/utils/zalo'

export function FloatingButtons() {
  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-24 sm:right-5 sm:gap-4">

      {/* Hotline */}
      <div className="group flex items-center gap-2">
        <span className="pointer-events-none hidden whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block">
          {HOTLINE}
        </span>
        <a
          href={`tel:${HOTLINE}`}
          aria-label="Gọi hotline"
          title={`Hotline: ${HOTLINE}`}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-600 sm:h-12 sm:w-12"
        >
          <Phone size={20} />
        </a>
      </div>

      {/* Zalo — with pulse ring + label */}
      <div className="group flex flex-col items-end gap-1.5">
        {/* Label above button */}
        <span className="whitespace-nowrap rounded-full bg-[#0068FF] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
          Tư vấn miễn phí
        </span>

        <div className="flex items-center gap-2">
          <span className="pointer-events-none hidden whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block">
            Chat Zalo ngay
          </span>
          <button
            type="button"
            onClick={() => openZalo(ZALO_PHONE)}
            aria-label="Nhắn Zalo"
            title="Chat Zalo"
            className="zalo-pulse flex h-12 w-12 select-none items-center justify-center rounded-full bg-[#0068FF] text-base font-bold text-white shadow-xl transition-transform hover:scale-110 hover:bg-[#0057d6] sm:h-14 sm:w-14 sm:text-lg"
          >
            Z
          </button>
        </div>
      </div>

    </div>
  )
}

