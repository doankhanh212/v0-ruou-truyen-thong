/**
 * Lightweight client-side event tracker.
 * Logs to console in dev; ready to swap in GA4 / Meta Pixel / Vercel Analytics.
 */

type EventName =
  | 'search'
  | 'filter_category'
  | 'filter_price'
  | 'ai_recommend'
  | 'product_click_zalo'
  | 'page_change'

interface TrackPayload {
  [key: string]: string | number | boolean | undefined
}

export function track(event: EventName, payload?: TrackPayload): void {
  if (typeof window === 'undefined') return

  // Console log in dev
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[track] ${event}`, payload ?? '')
  }

  // ── Vercel Analytics (auto-injected if @vercel/analytics is installed) ──
  // window.va?.('event', { name: event, data: payload })

  // ── Google Analytics 4 ──
  // window.gtag?.('event', event, payload)

  // ── Meta Pixel ──
  // window.fbq?.('trackCustom', event, payload)
}
