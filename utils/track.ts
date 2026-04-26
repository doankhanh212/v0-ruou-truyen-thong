type EventName =
  | 'page_view'
  | 'search'
  | 'filter_category'
  | 'filter_price'
  | 'ai_recommend'
  | 'click_product'
  | 'click_zalo'
  | 'click_call'
  | 'page_change'
  | 'chatbot_open'
  | 'chatbot_step'
  | 'chatbot_complete'
  | 'chatbot_drop'

interface TrackPayload {
  [key: string]: string | number | boolean | undefined
}

const SESSION_KEY = 'tracking_session_id'
const LAST_ACTIVITY_KEY = 'tracking_last_activity_at'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

function createSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function getSessionId() {
  const now = Date.now()

  try {
    const lastActivityRaw = window.localStorage.getItem(LAST_ACTIVITY_KEY)
    const lastActivity = lastActivityRaw ? Number.parseInt(lastActivityRaw, 10) : 0
    const currentSessionId = window.localStorage.getItem(SESSION_KEY)
    const expired = !lastActivity || Number.isNaN(lastActivity) || now - lastActivity > SESSION_TIMEOUT_MS

    const sessionId = !currentSessionId || expired ? createSessionId() : currentSessionId
    window.localStorage.setItem(SESSION_KEY, sessionId)
    window.localStorage.setItem(LAST_ACTIVITY_KEY, String(now))
    return sessionId
  } catch {
    return createSessionId()
  }
}

function getNumericProductId(payload?: TrackPayload) {
  if (typeof payload?.dbId === 'number' && Number.isFinite(payload.dbId)) {
    return payload.dbId
  }

  if (typeof payload?.productId === 'number' && Number.isFinite(payload.productId)) {
    return payload.productId
  }

  if (typeof payload?.productId === 'string' && /^\d+$/.test(payload.productId)) {
    return Number.parseInt(payload.productId, 10)
  }

  if (typeof payload?.id === 'number' && Number.isFinite(payload.id)) {
    return payload.id
  }

  if (typeof payload?.id === 'string' && /^\d+$/.test(payload.id)) {
    return Number.parseInt(payload.id, 10)
  }

  return undefined
}

export function track(event: EventName, payload?: TrackPayload): void {
  if (typeof window === 'undefined') return

  const sessionId = getSessionId()
  const productId = getNumericProductId(payload)

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[track] ${event}`, payload ?? {})
  }

  void fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      sessionId,
      productId,
      metadata: payload ?? {},
    }),
    keepalive: true,
  }).catch(() => {
    // Tracking must never block the user flow.
  })
}
