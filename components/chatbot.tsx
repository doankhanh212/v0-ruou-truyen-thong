'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { MessageCircle, X, RefreshCw, Send } from 'lucide-react'
import { openZalo } from '@/utils/zalo'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'chatbot_ai_session'

const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content:
      'Xin chào 👋 Tôi là chuyên gia tư vấn rượu truyền thống. Bạn đang tìm rượu để uống hay biếu tặng ạ?',
  },
]

const QUICK_CHIPS = [
  'Mua để uống',
  'Mua biếu tặng',
  'Tư vấn cho nam',
  'Xem bảng giá',
]

function loadSession(): Message[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Message[]
  } catch {
    return null
  }
}

function saveSession(messages: Message[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // ignore storage errors
  }
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [showBadge, setShowBadge] = useState(false)
  const [showChips, setShowChips] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = loadSession()
    if (saved?.length) {
      setMessages(saved)
      setShowChips(false)
    }
  }, [])

  // Auto-open after 7 seconds if not previously dismissed
  useEffect(() => {
    try {
      if (localStorage.getItem('chatbot_dismissed')) return
    } catch {
      return
    }
    const badgeTimer = setTimeout(() => setShowBadge(true), 4000)
    const openTimer = setTimeout(() => {
      setIsOpen(true)
      setShowBadge(false)
    }, 7000)
    return () => {
      clearTimeout(badgeTimer)
      clearTimeout(openTimer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    try {
      localStorage.setItem('chatbot_dismissed', '1')
    } catch {
      // ignore
    }
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isStreaming])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isStreaming) {
      inputRef.current?.focus()
    }
  }, [isOpen, isStreaming])

  // ────────── Send message to AI ──────────
  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    setShowChips(false)
    const userMsg: Message = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)

    // Prepare assistant placeholder
    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages([...updatedMessages, assistantMsg])

    try {
      abortRef.current = new AbortController()
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error('API error')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages([
          ...updatedMessages,
          { role: 'assistant', content: accumulated },
        ])
      }

      const finalMessages = [
        ...updatedMessages,
        { role: 'assistant' as const, content: accumulated },
      ]
      setMessages(finalMessages)
      saveSession(finalMessages)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      // Fallback message on error
      const fallback: Message = {
        role: 'assistant',
        content:
          'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Bạn có thể liên hệ trực tiếp qua Zalo để được tư vấn ngay nhé! 💬',
      }
      const finalMessages = [...updatedMessages, fallback]
      setMessages(finalMessages)
      saveSession(finalMessages)
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleChip = (chip: string) => {
    sendMessage(chip)
  }

  const handleReset = () => {
    abortRef.current?.abort()
    setMessages(INITIAL_MESSAGES)
    setShowChips(true)
    setIsStreaming(false)
    setInput('')
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  // ── Closed state: floating toggle button ──
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          setShowBadge(false)
        }}
        aria-label="Mở tư vấn chatbot"
        className="fixed bottom-6 right-6 w-14 h-14 bg-secondary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-secondary/90 hover:scale-110 transition-all z-40"
      >
        <MessageCircle size={24} />
        {showBadge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
            1
          </span>
        )}
      </button>
    )
  }

  // ── Open state: chat window ──
  return (
    <div className="fixed bottom-6 right-6 w-[340px] sm:w-96 h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-secondary text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">Tư vấn AI</p>
            <div className="flex items-center gap-1 text-xs opacity-90">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
              &nbsp;Đang trực tuyến
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            aria-label="Bắt đầu lại"
            title="Bắt đầu lại"
            className="hover:opacity-80 transition-opacity p-1 rounded"
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng chatbot"
            className="hover:opacity-80 transition-opacity p-1 rounded"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-secondary text-white rounded-br-sm'
                  : 'bg-white text-foreground shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming &&
          messages[messages.length - 1]?.role === 'assistant' &&
          messages[messages.length - 1]?.content === '' && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1 items-center">
                  <span
                    className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-secondary/60 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

        {/* Quick chips — only on initial state */}
        {showChips && messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChip(chip)}
                className="bg-white border border-secondary text-secondary text-xs px-3 py-1.5 rounded-full hover:bg-secondary hover:text-white transition-all font-medium"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 border-t border-border p-3 bg-white flex gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:opacity-50 bg-gray-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="w-10 h-10 bg-secondary text-white rounded-xl flex items-center justify-center hover:bg-secondary/90 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Zalo CTA */}
      <div className="flex-shrink-0 border-t border-border px-3 py-2 bg-white">
        <button
          type="button"
          onClick={() => openZalo()}
          className="w-full bg-[#0068FF] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#0057d6] transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
        >
          💬 Nhận tư vấn & báo giá qua Zalo
        </button>
      </div>
    </div>
  )
}
