'use client'

import { MessageCircle } from 'lucide-react'
import { track } from '@/utils/track'
import { ZALO_PHONE } from '@/utils/zalo'

type FloatingContactProps = {
  zaloUrl?: string
  messengerUrl?: string
}

function normalizeUrl(value: string | undefined, fallback: string) {
  const trimmed = value?.trim()
  return trimmed || fallback
}

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

export function FloatingContact({ zaloUrl, messengerUrl }: FloatingContactProps) {
  const zaloHref = normalizeUrl(zaloUrl, `https://zalo.me/${ZALO_PHONE}`)
  const messengerHref = normalizeUrl(messengerUrl, '/lien-he')

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-6">
      <a
        href={zaloHref}
        target={isExternalUrl(zaloHref) ? '_blank' : undefined}
        rel={isExternalUrl(zaloHref) ? 'noopener noreferrer' : undefined}
        onClick={() => track('click_zalo', { source: 'floating_widget', phone: ZALO_PHONE })}
        aria-label="Chat Zalo"
        className="group flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-[#0068ff] text-lg font-black text-white shadow-xl shadow-blue-500/30 ring-4 ring-white transition hover:scale-105 hover:bg-[#0057d8] focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        Z
        <span className="sr-only">Chat Zalo</span>
      </a>

      <a
        href={messengerHref}
        target={isExternalUrl(messengerHref) ? '_blank' : undefined}
        rel={isExternalUrl(messengerHref) ? 'noopener noreferrer' : undefined}
        onClick={() => track('click_messenger', { source: 'floating_widget', url: messengerHref })}
        aria-label="Chat Messenger"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0084ff] text-white shadow-xl shadow-sky-500/30 ring-4 ring-white transition hover:scale-105 hover:bg-[#0074df] focus:outline-none focus:ring-4 focus:ring-sky-200"
      >
        <MessageCircle size={26} strokeWidth={2.5} />
        <span className="sr-only">Chat Messenger</span>
      </a>
    </div>
  )
}
