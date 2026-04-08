'use client'

import { Phone } from 'lucide-react'
import { openZalo, HOTLINE, ZALO_PHONE } from '@/utils/zalo'

export function FloatingButtons() {
  return (
    <div className="fixed bottom-24 right-5 flex flex-col gap-4 z-40 items-end">

      {/* Hotline */}
      <div className="group flex items-center gap-2">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
          {HOTLINE}
        </span>
        <a
          href={`tel:${HOTLINE}`}
          aria-label="Gọi hotline"
          title={`Hotline: ${HOTLINE}`}
          className="w-12 h-12 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all"
        >
          <Phone size={20} />
        </a>
      </div>

      {/* Zalo — with pulse ring + label */}
      <div className="group flex flex-col items-end gap-1.5">
        {/* Label above button */}
        <span className="text-[11px] font-bold text-white bg-[#0068FF] px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
          Tư vấn miễn phí
        </span>

        <div className="flex items-center gap-2">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
            Chat Zalo ngay
          </span>
          <button
            type="button"
            onClick={() => openZalo(ZALO_PHONE)}
            aria-label="Nhắn Zalo"
            title="Chat Zalo"
            className="zalo-pulse w-14 h-14 bg-[#0068FF] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#0057d6] hover:scale-110 transition-transform font-bold text-lg select-none"
          >
            Z
          </button>
        </div>
      </div>

    </div>
  )
}

