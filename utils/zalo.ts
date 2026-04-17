import { track } from '@/utils/track'

const DEFAULT_PHONE = '84902931119'
const DEFAULT_MESSAGE = 'Xin chào, tôi muốn tư vấn rượu'
const OPEN_GUARD_MS = 1200

let lastOpenedAt = 0

function isMobileDevice() {
  if (typeof navigator === 'undefined') return false

  const userAgent = navigator.userAgent || navigator.vendor || ''
  return /android|iphone|ipad|ipod|mobile|windows phone/i.test(userAgent)
}

function openDesktopZalo(url: string) {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Opens Zalo chat for the configured phone number.
 * Message param is reserved for future OA deep-link support.
 */
export function openZalo(
  phone: string = DEFAULT_PHONE,
  message: string = DEFAULT_MESSAGE
): void {
  const now = Date.now()
  if (now - lastOpenedAt < OPEN_GUARD_MS) return
  lastOpenedAt = now

  const normalizedPhone = phone.replace(/\s+/g, '')
  const url = `https://zalo.me/${normalizedPhone}`
  track('click_zalo', { phone: normalizedPhone, message })

  if (isMobileDevice()) {
    window.location.href = url
    return
  }

  openDesktopZalo(url)
}

export const ZALO_PHONE = DEFAULT_PHONE
export const HOTLINE = '0902931119'
