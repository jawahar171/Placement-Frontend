import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/axios'

// ── Icons (inline SVG to avoid extra imports) ────────────────────────────────
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
)
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
)
const IconSparkle = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z" clipRule="evenodd" />
  </svg>
)

// ── Quick suggestion chips by role ───────────────────────────────────────────
const SUGGESTIONS = {
  student: [
    'How do I apply for a job?',
    'How can I check my interview status?',
    'How to upload my resume?',
    'What is a placement drive?',
  ],
  company: [
    'How do I post a job listing?',
    'How to schedule an interview?',
    'How to submit feedback after interview?',
    'How to view my applications?',
  ],
  admin: [
    'How to create a placement drive?',
    'How to manage student accounts?',
    'How to export placement reports?',
    'How to assign companies to a drive?',
  ],
}

// ── System prompt — context-aware for each role ──────────────────────────────
const buildSystemPrompt = (user) => `
You are a helpful support assistant for a College Placement Management System.
The user is logged in as: ${user?.name || 'a user'} with role: ${user?.role || 'unknown'}.

Portal features:
- STUDENT: Browse jobs, apply with eligibility check, track applications, view/join virtual interviews (Google Meet/Zoom), register for placement drives, upload resume via Cloudinary, manage academic profile.
- COMPANY: Post job listings with eligibility criteria, review/shortlist/reject applications, schedule virtual or in-person interviews, submit interview feedback & ratings, send offer letters.
- ADMIN: Manage students & companies, create placement drives, view all-interviews calendar, analytics dashboard (placement rate, monthly offers, department-wise stats, top hiring companies), export CSV reports.

Be concise, friendly, and specific. If unsure, say so. Do not make up portal URLs or features that don't exist.
Keep answers under 120 words unless a step-by-step is genuinely needed.
`.trim()

// ── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold-400"
          style={{ animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  )
}

// ── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-ink-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <IconSparkle />
        </div>
      )}
      <div className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-ink-800 text-white rounded-tr-sm'
          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function QueryChatBox() {
  const { user } = useAuth()
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [unread, setUnread]       = useState(0)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const historyRef = useRef([])   // tracks full conversation for multi-turn context

  // Welcome message on first open
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true)
      setUnread(0)
      const welcome = {
        role: 'assistant',
        content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your placement portal assistant. Ask me anything about ${
          user?.role === 'student' ? 'applications, interviews, jobs, or drives'
          : user?.role === 'company' ? 'posting jobs, reviewing applications, or scheduling interviews'
          : 'managing students, companies, drives, or reports'
        }.`,
        id: Date.now()
      }
      setMessages([welcome])
      historyRef.current = [{ role: 'assistant', content: welcome.content }]
    }
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || loading) return
    setInput('')

    const userMsg = { role: 'user', content: trimmed, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    historyRef.current = [...historyRef.current, { role: 'user', content: trimmed }]
    setLoading(true)

    try {
      const { data } = await api.post('/chat', {
        messages:     historyRef.current,
        systemPrompt: buildSystemPrompt(user),
      })
      const reply = data.reply || "Sorry, I couldn't get a response. Please try again."

      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply }]
      setMessages(prev => [...prev, { role: 'assistant', content: reply, id: Date.now() }])

      // If chat is closed, increment unread badge
      if (!open) setUnread(n => n + 1)

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        id: Date.now()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const suggestions = SUGGESTIONS[user?.role] || SUGGESTIONS.student

  return (
    <>
      {/* ── Keyframes injected once ── */}
      <style>{`
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: .5; }
          30%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes chatPop {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @keyframes chatSlide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .chat-pop   { animation: chatPop   0.28s cubic-bezier(.34,1.56,.64,1) forwards; }
        .chat-slide { animation: chatSlide 0.22s ease forwards; }
      `}</style>

      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open support chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-ink-800 hover:bg-ink-700
                   text-gold-400 shadow-2xl flex items-center justify-center
                   transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ boxShadow: '0 8px 32px rgba(15,14,23,0.35), 0 0 0 3px rgba(226,168,0,0.15)' }}
      >
        <span className={`transition-all duration-200 ${open ? 'rotate-0 opacity-100' : 'rotate-0'}`}>
          {open ? <IconClose /> : <IconChat />}
        </span>
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 text-ink-900
                           text-xs font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
        {/* Pulse ring when closed */}
        {!open && !hasOpened && (
          <span className="absolute inset-0 rounded-full bg-gold-400 opacity-20 animate-ping" />
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div
          className="chat-pop fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]
                     flex flex-col rounded-2xl overflow-hidden"
          style={{
            height: '520px',
            background: '#ffffff',
            boxShadow: '0 24px 64px rgba(15,14,23,0.22), 0 4px 16px rgba(15,14,23,0.1)',
            border: '1px solid rgba(226,168,0,0.12)',
          }}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3.5"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0e17 100%)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gold-500/20 flex items-center justify-center">
                <IconSparkle />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">Portal Assistant</p>
                <p className="text-xs text-gold-400/80 leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Always here to help
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50
                         hover:text-white hover:bg-white/10 transition-colors">
              <IconClose />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ background: '#fafaf9' }}>

            {messages.map((msg) => (
              <div key={msg.id} className="chat-slide">
                <Bubble msg={msg} />
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chat-slide flex gap-2">
                <div className="w-6 h-6 rounded-full bg-ink-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconSparkle />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Suggestion chips — shown only when no messages from user yet */}
            {messages.length === 1 && !loading && (
              <div className="chat-slide pt-1 space-y-2">
                <p className="text-xs text-gray-400 font-medium pl-1">Quick questions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white
                                 text-gray-600 hover:border-gold-400 hover:text-gold-700
                                 hover:bg-gold-50 transition-all duration-150 text-left">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="flex-shrink-0 px-3 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200
                            focus-within:border-gold-400 focus-within:ring-2 focus-within:ring-gold-400/20
                            transition-all duration-200 px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about the portal…"
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400
                           focus:outline-none resize-none leading-relaxed disabled:opacity-50"
                style={{ maxHeight: '80px', overflowY: 'auto' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-ink-800 text-gold-400
                           flex items-center justify-center transition-all duration-150
                           hover:bg-ink-700 active:scale-90
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <IconSend />
              </button>
            </div>
            <p className="text-center text-xs text-gray-300 mt-2">
              Powered by Claude · Placement Cell
            </p>
          </div>
        </div>
      )}
    </>
  )
}
