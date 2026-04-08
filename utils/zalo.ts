const DEFAULT_PHONE = '84902931119'
const DEFAULT_MESSAGE = 'Xin chào, tôi muốn tư vấn rượu'

/**
 * Opens Zalo chat for the configured phone number.
 * Message param is reserved for future OA deep-link support.
 */
export function openZalo(
  phone: string = DEFAULT_PHONE,
  _message: string = DEFAULT_MESSAGE
): void {
  const url = `https://zalo.me/${phone}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export const ZALO_PHONE = DEFAULT_PHONE
export const HOTLINE = '0902931119'
