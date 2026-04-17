'use client'

import type { PurposeId } from '@/lib/chatbot-rules'

export const CHATBOT_OPEN_EVENT = 'chatbot:open'

export interface ChatbotOpenDetail {
  purposeId?: PurposeId
}

export function triggerChatbotOpen(purposeId?: PurposeId) {
  window.dispatchEvent(
    new CustomEvent<ChatbotOpenDetail>(CHATBOT_OPEN_EVENT, {
      detail: { purposeId },
    })
  )
}