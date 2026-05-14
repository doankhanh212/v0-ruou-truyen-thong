'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, X, Send, Sparkles, Trash2 } from 'lucide-react'

type ChatMessage = {
  id: string
  role: 'user' | 'model'
  text: string
  // Trạng thái hiển thị: text được "type" dần để cảm giác AI đang đánh máy
  typing?: boolean
}

const STORAGE_KEY = 'rtt-chat-history-v1'
const MAX_HISTORY = 12 // Khớp với giới hạn server
const TYPING_SPEED_MS = 12 // ms / ký tự
const WELCOME = 'Xin chào! Mình là trợ lý AI của Rượu Truyền Thống 🍶 — bạn cần tư vấn rượu cho dịp gì hôm nay nhỉ?'

const QUICK_REPLIES = [
  'Mua làm quà biếu',
  'Dược liệu quý',
  'Uống hàng ngày',
  'Có những loại rượu nào?',
]

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

/**
 * Render bot text với markdown đơn giản:
 * - **bold**
 * - link [text](/path) hoặc URL trần
 * - newline → <br>
 */
function renderBotText(text: string) {
  // Tách theo newline trước
  return text.split('\n').map((line, lineIdx) => {
    // Match link [text](url) hoặc URL trần
    const parts: Array<{ type: 'text' | 'link' | 'bold'; content: string; href?: string }> = []
    const regex = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s)]+|\/[a-z0-9\-/]+)/g
    let lastIdx = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        parts.push({ type: 'text', content: line.slice(lastIdx, match.index) })
      }
      if (match[1]) {
        parts.push({ type: 'bold', content: match[1] })
      } else if (match[2] && match[3]) {
        parts.push({ type: 'link', content: match[2], href: match[3] })
      } else if (match[4]) {
        parts.push({ type: 'link', content: match[4], href: match[4] })
      }
      lastIdx = match.index + match[0].length
    }
    if (lastIdx < line.length) {
      parts.push({ type: 'text', content: line.slice(lastIdx) })
    }
    return (
      <span key={lineIdx}>
        {parts.map((p, i) => {
          if (p.type === 'bold') return <strong key={i}>{p.content}</strong>
          if (p.type === 'link' && p.href) {
            const isInternal = p.href.startsWith('/')
            if (isInternal) {
              return (
                <Link key={i} href={p.href} className="font-semibold text-[#8B1A1A] underline hover:no-underline">
                  {p.content}
                </Link>
              )
            }
            return (
              <a
                key={i}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#8B1A1A] underline hover:no-underline"
              >
                {p.content}
              </a>
            )
          }
          return <span key={i}>{p.content}</span>
        })}
        {lineIdx < text.split('\n').length - 1 && <br />}
      </span>
    )
  })
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimers = useRef<ReturnType<typeof setInterval>[]>([])

  // Check chatbot availability — ẩn hoàn toàn widget nếu admin chưa cấu hình
  useEffect(() => {
    let cancelled = false
    fetch('/api/chatbot/status')
      .then((r) => (r.ok ? r.json() : { available: false }))
      .then((data) => {
        if (!cancelled) setAvailable(Boolean(data.available))
      })
      .catch(() => {
        if (!cancelled) setAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Load history từ sessionStorage (mỗi tab độc lập) — chỉ khi widget khả dụng
  useEffect(() => {
    if (available !== true) return
    setHydrated(true)
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ChatMessage[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Bỏ trạng thái typing — coi như đã type xong khi load lại
          setMessages(parsed.map((m) => ({ ...m, typing: false })))
          return
        }
      }
    } catch {
      // ignore
    }
    // First run: hiện lời chào (đánh máy dần)
    streamWelcome()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available])

  // Persist
  useEffect(() => {
    if (!hydrated) return
    try {
      // Chỉ lưu các message đã hoàn thành (không lưu typing intermediate)
      const stable = messages.map((m) => ({ ...m, typing: false }))
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stable.slice(-MAX_HISTORY * 2)))
    } catch {
      // sessionStorage quota / private mode → ignore
    }
  }, [messages, hydrated])

  // Auto-scroll
  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, sending, open])

  // Cleanup typing timers on unmount
  useEffect(() => {
    return () => {
      typingTimers.current.forEach((t) => clearInterval(t))
    }
  }, [])

  function streamWelcome() {
    streamBotMessage(WELCOME)
  }

  /**
   * Thêm message bot vào state nhưng "đánh máy" từng ký tự để tạo cảm giác AI đang reply.
   */
  function streamBotMessage(fullText: string) {
    const id = genId()
    setMessages((prev) => [...prev, { id, role: 'model', text: '', typing: true }])

    let i = 0
    const timer = setInterval(() => {
      i += 1
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === id)
        if (idx === -1) return prev
        const next = [...prev]
        next[idx] = { ...next[idx], text: fullText.slice(0, i) }
        return next
      })
      if (i >= fullText.length) {
        clearInterval(timer)
        typingTimers.current = typingTimers.current.filter((t) => t !== timer)
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === id)
          if (idx === -1) return prev
          const next = [...prev]
          next[idx] = { ...next[idx], typing: false }
          return next
        })
      }
    }, TYPING_SPEED_MS)
    typingTimers.current.push(timer)
  }

  async function send(text: string) {
    const message = text.trim()
    if (!message || sending) return
    setError(null)
    const userMsg: ChatMessage = { id: genId(), role: 'user', text: message }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    const historyForApi = messages
      .filter((m) => !m.typing)
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, text: m.text }))

    // 45s overall budget — covers the worst case of fallback through every
    // OpenRouter model. Server already caps each model at 15s.
    const aborter = new AbortController()
    const abortTimer = setTimeout(() => aborter.abort(), 45_000)

    try {
      const res = await fetch('/api/chatbot/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: historyForApi }),
        signal: aborter.signal,
      })

      if (res.status === 503) {
        setAvailable(false)
        return
      }

      // Lỗi (4xx/5xx khác) — body là JSON, không phải stream
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data?.error || 'Hệ thống AI tạm bận. Vui lòng thử lại.'
        streamBotMessage(`⚠️ ${msg}`)
        return
      }

      // Streaming response: text/plain với UTF-8 chunks
      if (!res.body) {
        streamBotMessage('⚠️ Không nhận được phản hồi từ server.')
        return
      }

      // Tạo bot message mới rỗng — append delta vào trong khi đọc stream
      const botId = genId()
      setMessages((prev) => [...prev, { id: botId, role: 'model', text: '', typing: true }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          if (!chunk) continue
          accumulated += chunk
          // Update text trong state tức thời cho user thấy AI "đánh máy"
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === botId)
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = { ...next[idx], text: accumulated }
            return next
          })
        }
      } finally {
        reader.releaseLock()
      }

      // Stream xong — bỏ trạng thái typing
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === botId)
        if (idx === -1) return prev
        const next = [...prev]
        if (!next[idx].text.trim()) {
          next[idx] = { ...next[idx], text: 'Mình chưa nghe rõ ý bạn — bạn nói lại giúp mình nhé?', typing: false }
        } else {
          next[idx] = { ...next[idx], typing: false }
        }
        return next
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        streamBotMessage('⚠️ Trợ lý phản hồi hơi lâu — bạn thử lại sau ít phút nhé, hoặc Chat Zalo để được tư vấn ngay.')
      } else {
        streamBotMessage('⚠️ Không kết nối được tới máy chủ. Vui lòng thử lại.')
      }
    } finally {
      clearTimeout(abortTimer)
      setSending(false)
    }
  }

  function handleClear() {
    if (!confirm('Xoá lịch sử hội thoại?')) return
    setMessages([])
    setError(null)
    typingTimers.current.forEach((t) => clearInterval(t))
    typingTimers.current = []
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    streamWelcome()
  }

  // Ẩn widget hoàn toàn nếu admin chưa cấu hình hoặc đã tắt — không lộ lỗi cho khách
  if (available !== true) return null

  return (
    <>
      {/* Launcher (góc trái dưới — tránh đụng FloatingButtons bên phải) */}
      <button
        type="button"
        aria-label={open ? 'Đóng tư vấn AI' : 'Mở tư vấn AI'}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#8B1A1A] to-[#6b1111] text-white shadow-xl transition-transform hover:scale-110 sm:bottom-24 sm:left-5 sm:h-14 sm:w-14"
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
        {!open && (
          <span className="absolute right-0 top-0 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </span>
        )}
      </button>

      {/* Chat panel — full screen below sm để không bị che bởi FloatingButtons, từ sm trở lên hiện cạnh */}
      <div
        className={`fixed inset-x-3 bottom-36 z-40 origin-bottom-left rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-200 sm:inset-x-auto sm:bottom-44 sm:left-5 sm:w-[22rem] ${
          open ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-95 opacity-0'
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-[#6b1111] to-[#8B1A1A] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Sparkles size={16} />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#8B1A1A] bg-green-400" />
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-bold leading-tight">
                Trợ lý AI <span className="rounded-full bg-amber-300/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-900">AI</span>
              </p>
              <p className="text-[11px] text-white/80">Tư vấn 24/7 — phản hồi tức thì</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClear}
              aria-label="Xoá hội thoại"
              title="Xoá hội thoại"
              className="rounded-full p-1.5 hover:bg-white/15"
            >
              <Trash2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng"
              className="rounded-full p-1.5 hover:bg-white/15"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="max-h-[440px] min-h-[320px] overflow-y-auto bg-gradient-to-b from-amber-50/30 to-white px-3 py-3">
          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="mb-2 flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#8B1A1A] px-3 py-2 text-sm text-white shadow-sm">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="mb-2 flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-800 shadow-sm">
                  {renderBotText(m.text)}
                  {m.typing && (
                    <span className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 animate-pulse bg-[#8B1A1A]" />
                  )}
                </div>
              </div>
            )
          )}

          {sending && messages[messages.length - 1]?.role === 'user' && (
            <div className="mb-2 flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-3 py-2.5 shadow-sm">
                <Dot delay={0} />
                <Dot delay={150} />
                <Dot delay={300} />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
          )}
        </div>

        {/* Quick replies — chỉ hiện khi chưa có message user */}
        {messages.filter((m) => m.role === 'user').length === 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-gray-100 bg-white px-3 py-2">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                type="button"
                disabled={sending}
                onClick={() => send(qr)}
                className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2 rounded-b-2xl border-t border-gray-100 bg-white px-3 py-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder="Nhắn cho AI..."
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:border-[#8B1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1A1A]/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Gửi"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B1A1A] text-white transition-opacity disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </>
  )
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
      style={{ animationDelay: `${delay}ms` }}
    />
  )
}
