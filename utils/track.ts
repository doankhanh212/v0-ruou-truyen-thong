/**
 * Lightweight client-side event tracker.
 * Logs to console in dev; ready to swap in GA4 / Meta Pixel / Vercel Analytics.
 */

type EventName =
  | 'page_view'
  | 'search'
  | 'filter_category'
  | 'filter_price'
  | 'ai_recommend'
  | 'click_product'
  | 'click_zalo'
  | 'page_change'
  | 'chatbot_open'
  | 'chatbot_step'
  | 'chatbot_complete'
  | 'chatbot_drop'

interface TrackPayload {
  [key: string]: string | number | boolean | undefined
}

export function track(event: EventName, payload?: TrackPayload): void {
  if (typeof window === 'undefined') return

  console.log(`[track] ${event}`, payload ?? {})

  // ── Vercel Analytics (auto-injected if @vercel/analytics is installed) ──
  // window.va?.('event', { name: event, data: payload })

  // ── Google Analytics 4 ──
  // window.gtag?.('event', event, payload)

  // ── Meta Pixel ──
  // window.fbq?.('trackCustom', event, payload)
}
