'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { MessageCircle, RefreshCw, Send, X } from 'lucide-react'

type ApiProduct = {
  id: number
  name: string
  slug: string
  price: number
  category: string
  imageUrl: string
  tags: string[]
  description?: string | null
  featured?: boolean
}

function apiProductToRecommendation(p: ApiProduct): RecommendationItem {
  const isGift = p.category === 'qua-tang'
  return {
    id: String(p.id),
    slug: p.slug,
    kind: isGift ? 'gift-set' : 'product',
    name: p.name,
    category: p.category,
    price: String(p.price),
    priceMin: p.price,
    image: p.imageUrl,
    benefits: [],
    target: p.description ?? '',
    tag: p.tags?.[0],
    isBestSeller: Boolean(p.featured),
  }
}
import {
  BUDGET_OPTIONS,
  PREFERENCE_OPTIONS,
  PURPOSE_OPTIONS,
  detectBudget,
  detectIntent,
  detectNamedItems,
  detectPreference,
  inferIntentFromQuery,
  matchProducts,
  type BudgetId,
  type IntentId,
  type PreferenceId,
  type RecommendationItem,
  type PurposeId,
} from '@/lib/chatbot-rules'
import { CHATBOT_OPEN_EVENT, type ChatbotOpenDetail } from '@/lib/chatbot-trigger'
import { companyInfo, formatPrice } from '@/data/products'
import { track } from '@/utils/track'
import { openZalo } from '@/utils/zalo'

/* ─── Types ──────────────────────────────────────── */

type ConvoState =
  | 'idle'          // Waiting for first user input or purpose selection
  | 'got-intent'    // Have intent, need budget
  | 'got-budget'    // Have intent + budget, need preference
  | 'result'        // Showing recommendations

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Answers {
  intent?: IntentId
  budget?: Exclude<BudgetId, 'unknown'>
  preference?: PreferenceId
  query?: string
}

/* ─── Constants ──────────────────────────────────── */

const STORAGE_KEY = 'chatbot_hybrid_session'
const DISMISSED_KEY = 'chatbot_dismissed'
const TYPING_DELAY = 600

const GREETING: Message = {
  role: 'assistant',
  content: 'Xin chào anh/chị! 👋 Em là trợ lý tư vấn Somo Gold. Chúc anh/chị một ngày thật tốt lành.\n\nEm có thể hỗ trợ chọn rượu, bộ quà, báo giá nhanh, hoặc cung cấp thông tin liên hệ công ty. Anh/chị cứ gõ tự nhiên như: "quà Tết cho đối tác khoảng 2 triệu", "Minh Mạng Tửu", hoặc "xin hotline".',
}

type SupportTopic = 'contact' | 'phone' | 'email' | 'office' | 'factory' | 'distributor' | 'pricing' | 'catalog'

function isGreeting(input: string) {
  const text = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()

  return /^(hi|hello|helo|alo|chao|xin chao|hey|shop oi|ad oi|em oi)(\b|\s|!|\?|\.)/.test(text)
}

/* ─── Helpers ────────────────────────────────────── */

function labelFor(type: 'purpose' | 'budget' | 'preference', id: string) {
  if (type === 'purpose') return PURPOSE_OPTIONS.find((o) => o.id === id)?.label ?? id
  if (type === 'budget') return BUDGET_OPTIONS.find((o) => o.id === id)?.label ?? id
  return PREFERENCE_OPTIONS.find((o) => o.id === id)?.label ?? id
}

function detectSupportTopic(input: string): SupportTopic | null {
  const text = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')

  if (/(so dien thoai|sdt|hotline|goi so nao|lien he so nao)/.test(text)) return 'phone'
  if (/email|mail/.test(text)) return 'email'
  if (/(dia chi|van phong|cong ty o dau|o dau)/.test(text)) return 'office'
  if (/(nha may|san xuat o dau|factory)/.test(text)) return 'factory'
  if (/(apt|phan phoi|don vi phan phoi|nha phan phoi)/.test(text)) return 'distributor'
  if (/(bang gia|bao nhieu tien|gia bao nhieu|gia ca)/.test(text)) return 'pricing'
  if (/(co nhung san pham nao|catalog|danh muc|co bo qua nao)/.test(text)) return 'catalog'
  if (/(lien he|thong tin cong ty|thong tin mua hang)/.test(text)) return 'contact'

  return null
}

function supportReply(topic: SupportTopic) {
  switch (topic) {
    case 'phone':
      return `Hotline Somo Gold: ${companyInfo.phone.join(' – ')}.`
    case 'email':
      return `Email liên hệ: ${companyInfo.email}.`
    case 'office':
      return `Văn phòng Somo Gold ở: ${companyInfo.address}.`
    case 'factory':
      return `Nhà máy sản xuất: ${companyInfo.factory.name} — ${companyInfo.factory.address}.`
    case 'distributor':
      return `Đơn vị phân phối: ${companyInfo.distributor.name} — ${companyInfo.distributor.address}.`
    case 'pricing':
      return 'Bạn có thể xem trang Bảng giá để so nhanh các mẫu. Nếu cần, chỉ cần gõ tên sản phẩm như "Minh Mạng Tửu" hoặc "Lộc Xuân" để tôi gợi ý ngay trong chat.'
    case 'catalog':
      return 'Hiện tại Somo Gold có 5 dòng rượu chính: Rượu Nếp, Rượu Ba Kích, Minh Mạng Tửu, Hoàng Hoa Tửu, Tây Dương Sâm Tửu; cùng 4 bộ quà: Sum Vầy, Thịnh Vượng, Cát Tường và Lộc Xuân.'
    case 'contact':
      return `Thông tin mua hàng: hotline ${companyInfo.phone.join(' – ')}, email ${companyInfo.email}, văn phòng tại ${companyInfo.address}. Nếu cần nhanh nhất, bạn bấm nút Zalo ở dưới nhé.`
  }
}

function defaultPreferenceForIntent(intent: IntentId): PreferenceId {
  switch (intent) {
    case 'gift':
    case 'health':
      return 'premium'
    case 'male':
      return 'strength'
    case 'daily':
      return 'traditional'
    default:
      return 'easy'
  }
}

function RecommendationCard({ product }: { product: RecommendationItem }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-3 overflow-hidden rounded-xl bg-slate-50">
        <div className="relative aspect-square">
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </div>
      </div>

      <Link
        href={`/san-pham/${product.slug}`}
        onClick={() => track('click_product', { id: product.id, slug: product.slug, name: product.name, source: 'chatbot' })}
        className="block"
      >
        <h4 className="text-sm font-bold leading-snug text-foreground">{product.name}</h4>
      </Link>

      <p className="mt-1 text-xs text-foreground/55">{product.target}</p>
      <p className="mt-2 text-sm font-bold text-primary">Từ {formatPrice(product.priceMin)}</p>
      {product.tag && (
        <p className="mt-1 text-xs font-semibold text-amber-700">{product.tag}</p>
      )}

      <button
        type="button"
        onClick={() => openZalo(undefined, `Xin chào, tôi muốn tư vấn ${product.kind === 'gift-set' ? 'bộ quà ' : ''}${product.name}`)}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#0068FF] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0057d6] active:scale-[0.99]"
      >
        Tư vấn Zalo
      </button>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────── */

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [showBadge, setShowBadge] = useState(false)
  const [convoState, setConvoState] = useState<ConvoState>('idle')
  const [answers, setAnswers] = useState<Answers>({})
  const [isTyping, setIsTyping] = useState(false)
  const [apiRecommendations, setApiRecommendations] = useState<RecommendationItem[] | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const localRecommendations = useMemo(() => {
    if (convoState !== 'result' || !answers.intent) return []
    return matchProducts({
      intent: answers.intent,
      budget: answers.budget,
      preference: answers.preference,
      query: answers.query,
    })
  }, [convoState, answers])

  const recommendations = apiRecommendations ?? localRecommendations

  useEffect(() => {
    if (convoState !== 'result' || !answers.intent) {
      setApiRecommendations(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/chatbot/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: answers.query,
            purpose: answers.intent,
            budget: answers.budget,
            preference: answers.preference,
          }),
        })
        if (!res.ok) throw new Error('api failed')
        const data = (await res.json()) as { items?: ApiProduct[] }
        if (cancelled) return
        if (Array.isArray(data.items) && data.items.length > 0) {
          setApiRecommendations(data.items.map(apiProductToRecommendation))
        } else {
          setApiRecommendations(null)
        }
      } catch {
        if (!cancelled) setApiRecommendations(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [convoState, answers])

  /* ─── Append helpers with typing delay ─────────── */

  const appendAssistant = useCallback((content: string) => {
    setIsTyping(true)
    const timer = window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content }])
      setIsTyping(false)
    }, TYPING_DELAY)
    return () => window.clearTimeout(timer)
  }, [])

  const appendUser = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: 'user', content }])
  }, [])

  /* ─── State transitions ────────────────────────── */

  const goToIntent = useCallback((intentId: IntentId, query?: string) => {
    setAnswers((prev) => ({ ...prev, intent: intentId, query: prev.query ?? query }))
    setConvoState('got-intent')
    track('chatbot_step', { from: 'idle', to: 'got-intent', intent: intentId })
    setIsTyping(true)
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Tuyệt vời! Bạn muốn ${labelFor('purpose', intentId).toLowerCase()}.\nNgân sách khoảng bao nhiêu ạ?` },
      ])
      setIsTyping(false)
    }, TYPING_DELAY)
  }, [])

  const goToBudget = useCallback((budgetId: Exclude<BudgetId, 'unknown'>, query?: string) => {
    setAnswers((prev) => ({ ...prev, budget: budgetId, query: prev.query ?? query }))
    setConvoState('got-budget')
    track('chatbot_step', { from: 'got-intent', to: 'got-budget', budget: budgetId })
    setIsTyping(true)
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Ngân sách ${labelFor('budget', budgetId).toLowerCase()} — được ạ!\nBạn thích phong cách nào?` },
      ])
      setIsTyping(false)
    }, TYPING_DELAY)
  }, [])

  const goToResult = useCallback((preferenceId: PreferenceId, currentAnswers: Answers, query?: string) => {
    const finalAnswers = { ...currentAnswers, preference: preferenceId, query: currentAnswers.query ?? query }
    setAnswers(finalAnswers)
    setConvoState('result')

    const results = matchProducts({
      intent: finalAnswers.intent!,
      budget: finalAnswers.budget,
      preference: finalAnswers.preference,
      query: query ?? finalAnswers.query,
    })

    track('ai_recommend', {
      source: 'chatbot',
      intent: finalAnswers.intent,
      budget: finalAnswers.budget,
      preference: finalAnswers.preference,
      results: results.map((p) => p.slug).join(','),
    })

    track('chatbot_complete', {
      intent: finalAnswers.intent,
      budget: finalAnswers.budget,
      preference: finalAnswers.preference,
      result_count: results.length,
    })

    setIsTyping(true)
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Đây là 3 sản phẩm phù hợp nhất cho bạn 🎯\nBấm "Tư vấn Zalo" để được hỗ trợ nhanh nhất!` },
      ])
      setIsTyping(false)
    }, TYPING_DELAY)
  }, [])

  /** Try to extract everything from a single free-text message */
  const processFullMessage = useCallback((text: string) => {
    const namedItems = detectNamedItems(text)
    const supportTopic = detectSupportTopic(text)
    const intent = inferIntentFromQuery(text)
    const budget = detectBudget(text)

    if (isGreeting(text)) {
      appendUser(text)
      appendAssistant('Em chào anh/chị ạ. Rất vui được hỗ trợ hôm nay. Anh/chị cần tư vấn sản phẩm, bộ quà, bảng giá hay thông tin liên hệ công ty thì cứ nhắn trực tiếp cho em nhé!')
      return true
    }

    if (supportTopic) {
      appendUser(text)
      appendAssistant(supportReply(supportTopic))
      return true
    }

    if (namedItems.length > 0 && budget === 'unknown') {
      appendUser(text)
      const inferredIntent = intent === 'unknown' ? (namedItems[0]?.kind === 'gift-set' ? 'gift' : 'daily') : intent
      const a: Answers = { intent: inferredIntent, query: text }
      setAnswers(a)
      goToResult(detectPreference(text) ?? defaultPreferenceForIntent(inferredIntent), a, text)
      return true
    }

    if (intent !== 'unknown' && budget !== 'unknown') {
      let pref: PreferenceId = detectPreference(text) ?? 'easy'

      appendUser(text)
      const a: Answers = { intent, budget, query: text }
      setAnswers(a)
      goToResult(pref, a, text)
      return true
    }

    if (intent !== 'unknown') {
      appendUser(text)
      goToIntent(intent, text)
      return true
    }

    return false
  }, [appendUser, goToIntent, goToResult])

  /* ─── Reset ────────────────────────────────────── */

  const reset = useCallback(() => {
    setMessages([GREETING])
    setAnswers({})
    setConvoState('idle')
    setInput('')
    setIsTyping(false)
    try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* */ }
  }, [])

  /* ─── Persistence ──────────────────────────────── */

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as { answers: Answers; messages: Message[]; convoState: ConvoState }
      setAnswers(saved.answers)
      setMessages(saved.messages)
      setConvoState(saved.convoState)
    } catch { /* */ }
  }, [])

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, messages, convoState }))
    } catch { /* */ }
  }, [answers, messages, convoState])

  /* ─── Auto-open timers ─────────────────────────── */

  useEffect(() => {
    try { if (localStorage.getItem(DISMISSED_KEY)) return } catch { return }
    const badgeTimer = window.setTimeout(() => setShowBadge(true), 4000)
    const openTimer = window.setTimeout(() => {
      setIsOpen(true)
      setShowBadge(false)
      track('chatbot_open', { trigger: 'auto' })
    }, 7000)
    return () => { window.clearTimeout(badgeTimer); window.clearTimeout(openTimer) }
  }, [])

  /* ─── External trigger event ───────────────────── */

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const detail = (event as CustomEvent<ChatbotOpenDetail>).detail
      setIsOpen(true)
      setShowBadge(false)
      track('chatbot_open', { trigger: 'external', purpose: detail?.purposeId })
      if (detail?.purposeId) {
        reset()
        window.setTimeout(() => {
          appendUser(labelFor('purpose', detail.purposeId!))
          goToIntent(detail.purposeId!)
        }, 100)
      }
    }
    window.addEventListener(CHATBOT_OPEN_EVENT, handleOpen as EventListener)
    return () => window.removeEventListener(CHATBOT_OPEN_EVENT, handleOpen as EventListener)
  }, [appendUser, goToIntent, reset])

  /* ─── Scroll / focus ───────────────────────────── */

  useEffect(() => {
    if (!isOpen) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [isOpen, messages, recommendations, isTyping])

  useEffect(() => {
    if (isOpen && !isTyping) inputRef.current?.focus()
  }, [isOpen, isTyping])

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  /* ─── Close ────────────────────────────────────── */

  const closeChatbot = () => {
    if (convoState !== 'result') {
      track('chatbot_drop', {
        state: convoState,
        intent: answers.intent,
        budget: answers.budget,
        preference: answers.preference,
      })
    }
    setIsOpen(false)
    try { localStorage.setItem(DISMISSED_KEY, '1') } catch { /* */ }
  }

  /* ─── Option button handlers ───────────────────── */

  const handlePurposeSelect = (id: IntentId) => {
    appendUser(labelFor('purpose', id))
    goToIntent(id)
  }

  const handleBudgetSelect = (id: Exclude<BudgetId, 'unknown'>) => {
    appendUser(labelFor('budget', id))
    goToBudget(id)
  }

  const handlePreferenceSelect = (id: PreferenceId) => {
    appendUser(labelFor('preference', id))
    goToResult(id, answers)
  }

  /* ─── Free-text submit ─────────────────────────── */

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isTyping) return
    setInput('')

    // Reset command
    if (/^(lam lai|làm lại|reset|start over)/i.test(text)) {
      reset()
      return
    }

    // Zalo shortcut
    if (/^zalo/i.test(text)) {
      openZalo()
      return
    }

    switch (convoState) {
      case 'idle': {
        // Try full-message parse first
        if (processFullMessage(text)) return
        // Fallback
        appendUser(text)
        appendAssistant('Mình chưa hiểu rõ lắm. Bạn có thể gõ tên sản phẩm, hỏi hotline/email/địa chỉ, hoặc chọn nhanh một nhu cầu bên dưới nhé!')
        break
      }
      case 'got-intent': {
        if (processFullMessage(text)) return
        const budgetId = detectBudget(text)
        if (budgetId !== 'unknown') {
          appendUser(text)
          goToBudget(budgetId, text)
        } else {
          appendUser(text)
          appendAssistant('Bạn cho mình biết ngân sách nhé — hoặc chọn nhanh bên dưới.')
        }
        break
      }
      case 'got-budget': {
        if (processFullMessage(text)) return
        const pref = detectPreference(text)
        if (pref) {
          appendUser(text)
          goToResult(pref, { ...answers, query: answers.query ?? text }, text)
        } else {
          appendUser(text)
          appendAssistant('Bạn thích phong cách nào? Chọn nhanh bên dưới nhé!')
        }
        break
      }
      case 'result': {
        // In result state, try to start a new conversation
        if (processFullMessage(text)) return
        appendUser(text)
        appendAssistant('Bạn có thể gõ tên sản phẩm khác, hỏi thông tin liên hệ công ty, nhấn "Làm lại", hoặc nhắn Zalo để được tư vấn chi tiết hơn nhé!')
        break
      }
    }
  }

  /* ─── Current quick-option buttons ─────────────── */

  const quickOptions = (() => {
    if (isTyping) return null

    if (convoState === 'idle') {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {PURPOSE_OPTIONS.map((o) => (
            <button key={o.id} type="button" onClick={() => handlePurposeSelect(o.id)}
              className="min-h-11 rounded-full border border-secondary bg-white px-4 py-2 text-xs font-semibold text-secondary transition-all hover:bg-secondary hover:text-white">
              {o.label}
            </button>
          ))}
          <button type="button" onClick={() => appendAssistant(supportReply('contact'))}
            className="min-h-11 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-600 hover:text-white">
            Thông tin liên hệ
          </button>
        </div>
      )
    }

    if (convoState === 'got-intent') {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {BUDGET_OPTIONS.map((o) => (
            <button key={o.id} type="button" onClick={() => handleBudgetSelect(o.id)}
              className="min-h-11 rounded-full border border-secondary bg-white px-4 py-2 text-xs font-semibold text-secondary transition-all hover:bg-secondary hover:text-white">
              {o.label}
            </button>
          ))}
        </div>
      )
    }

    if (convoState === 'got-budget') {
      return (
        <div className="flex flex-wrap gap-2 pt-1">
          {PREFERENCE_OPTIONS.map((o) => (
            <button key={o.id} type="button" onClick={() => handlePreferenceSelect(o.id)}
              className="min-h-11 rounded-full border border-secondary bg-white px-4 py-2 text-xs font-semibold text-secondary transition-all hover:bg-secondary hover:text-white">
              {o.label}
            </button>
          ))}
        </div>
      )
    }

    if (convoState === 'result') {
      return (
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={reset}
            className="min-h-11 rounded-full border border-secondary bg-white px-4 py-2 text-xs font-semibold text-secondary transition-all hover:bg-secondary hover:text-white">
            🔄 Tìm lại
          </button>
        </div>
      )
    }

    return null
  })()

  /* ─── Render ───────────────────────────────────── */

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => { setIsOpen(true); setShowBadge(false); track('chatbot_open', { trigger: 'button' }) }}
        aria-label="Mở tư vấn chatbot"
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-xl transition-all hover:scale-110 hover:bg-secondary/90 sm:bottom-6 sm:right-6"
      >
        <MessageCircle size={24} />
        {showBadge && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-bounce">1</span>
        )}
      </button>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] sm:hidden" onClick={closeChatbot} />
      <div className="fixed inset-x-3 bottom-3 z-50 flex h-[min(78vh,640px)] max-h-[calc(100dvh-1.5rem)] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(72vh,560px)] sm:w-96 sm:max-h-[560px]">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between bg-secondary px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Tư vấn rượu</p>
            <div className="flex items-center gap-1 text-xs opacity-90">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
              Đang trực tuyến
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={reset} aria-label="Bắt đầu lại" className="rounded p-1 transition-opacity hover:opacity-80">
            <RefreshCw size={16} />
          </button>
          <button type="button" onClick={closeChatbot} aria-label="Đóng chatbot" className="rounded p-1 transition-opacity hover:opacity-80">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={`${msg.role}-${i}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] break-words whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-secondary text-white'
                    : 'rounded-bl-sm bg-white text-foreground shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick option buttons */}
          {quickOptions}

          {/* Recommendation cards */}
          {convoState === 'result' && recommendations.length > 0 && !isTyping && (
            <div className="grid gap-3 pt-2">
              {recommendations.map((product) => (
                <RecommendationCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-shrink-0 gap-2 border-t border-border bg-white px-3 pb-3 pt-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={convoState === 'idle' ? 'Ví dụ: quà Tết 2 triệu hoặc Minh Mạng Tửu' : convoState === 'result' ? 'Gõ sản phẩm khác hoặc "làm lại"' : 'Gõ hoặc chọn nhanh bên dưới'}
          className="flex-1 rounded-xl border border-border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-white transition-colors hover:bg-secondary/90 disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Zalo CTA */}
      <div className="flex-shrink-0 border-t border-border bg-white px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2">
        <button
          type="button"
          onClick={() => openZalo()}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0068FF] py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-[#0057d6]"
        >
          💬 Nhận tư vấn & báo giá qua Zalo
        </button>
      </div>
      </div>
    </>
  )
}
