'use client'

import { track } from '@/utils/track'

type FloatingContactProps = {
  zaloUrl?: string
  messengerUrl?: string
  whatsappUrl?: string
}

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current">
      <path d="M12 2C6.35 2 2 6.13 2 11.71c0 2.92 1.2 5.44 3.15 7.17v3.12l2.88-1.58c1.18.33 2.52.51 3.97.51 5.65 0 10-4.13 10-9.71S17.65 2 12 2Zm1.02 13.08-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82Z" />
    </svg>
  )
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-current">
      <path d="M12.04 2.01A9.86 9.86 0 0 0 2.2 11.86c0 1.73.45 3.41 1.31 4.91L2 22l5.37-1.41a9.83 9.83 0 0 0 4.67 1.19h.01a9.86 9.86 0 0 0-.01-19.77Zm5.79 14.08c-.24.68-1.4 1.3-1.95 1.36-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.61-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.55-1.17-2.96 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36h.55c.17.01.41-.06.64.49.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.31.38-.43.5-.14.14-.29.29-.12.57.17.29.74 1.22 1.59 1.97 1.1.98 2.02 1.28 2.31 1.43.29.14.45.12.62-.07.19-.22.72-.84.91-1.13.19-.29.38-.24.64-.14.26.1 1.67.79 1.95.93.29.14.48.22.55.34.07.12.07.69-.17 1.36Z" />
    </svg>
  )
}

export function FloatingContact({ zaloUrl, messengerUrl, whatsappUrl }: FloatingContactProps) {
  const zaloHref = zaloUrl?.trim() || ''
  const messengerHref = messengerUrl?.trim() || ''
  const whatsappHref = whatsappUrl?.trim() || ''

  if (!zaloHref && !messengerHref && !whatsappHref) return null

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-6">
      {zaloHref ? (
        <a
          href={zaloHref}
          target={isExternalUrl(zaloHref) ? '_blank' : undefined}
          rel={isExternalUrl(zaloHref) ? 'noopener noreferrer' : undefined}
          onClick={() => track('click_zalo', { source: 'floating_widget', url: zaloHref })}
          aria-label="Chat Zalo"
          className="group flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-[#0068ff] text-lg font-black text-white shadow-xl shadow-blue-500/30 ring-4 ring-white transition hover:scale-105 hover:bg-[#0057d8] focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          Z
          <span className="sr-only">Chat Zalo</span>
        </a>
      ) : null}

      {messengerHref ? (
        <a
          href={messengerHref}
          target={isExternalUrl(messengerHref) ? '_blank' : undefined}
          rel={isExternalUrl(messengerHref) ? 'noopener noreferrer' : undefined}
          onClick={() => track('click_messenger', { source: 'floating_widget', url: messengerHref })}
          aria-label="Chat Messenger"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0084ff] text-white shadow-xl shadow-sky-500/30 ring-4 ring-white transition hover:scale-105 hover:bg-[#0074df] focus:outline-none focus:ring-4 focus:ring-sky-200"
        >
          <MessengerIcon />
          <span className="sr-only">Chat Messenger</span>
        </a>
      ) : null}

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target={isExternalUrl(whatsappHref) ? '_blank' : undefined}
          rel={isExternalUrl(whatsappHref) ? 'noopener noreferrer' : undefined}
          onClick={() => track('click_whatsapp', { source: 'floating_widget', url: whatsappHref })}
          aria-label="Chat WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-xl shadow-emerald-500/30 ring-4 ring-white transition hover:scale-105 hover:bg-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          <WhatsappIcon />
          <span className="sr-only">Chat WhatsApp</span>
        </a>
      ) : null}
    </div>
  )
}
