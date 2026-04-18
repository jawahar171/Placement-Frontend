import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

// ─────────────────────────────────────────────────────────────────────────────
// ICONS (inline SVG — no extra imports)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE  (rule-based, zero API calls, zero cost, instant)
// Each entry has: patterns[] (keywords/phrases), response (or responseFn(role))
// ─────────────────────────────────────────────────────────────────────────────
const KB = [
  // ── Login / Auth ──────────────────────────────────────────────────────────
  {
    patterns: ['login', 'sign in', 'log in', 'password', 'forgot', 'reset password', 'cant login', "can't login"],
    response: `To log in, go to the login page and enter your registered email and password.\n\nIf you forgot your password, contact your placement cell administrator to reset it — there's no self-service reset yet.`,
  },
  {
    patterns: ['register', 'sign up', 'create account', 'new account'],
    response: `New accounts are created by your placement cell admin. Contact them with your details (name, email, roll number, department) to get access.\n\nIf you're a company HR, reach out to the college placement office to set up a company account.`,
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  {
    patterns: ['profile', 'update profile', 'edit profile', 'my profile'],
    response: `Go to **My Profile** in the sidebar. You can update:\n• Personal info (name, phone, LinkedIn)\n• Academic details (CGPA, branch, batch)\n• Skills\n• Resume (upload via the resume section)\n\nSave changes using the Update button at the bottom.`,
  },
  {
    patterns: ['resume', 'upload resume', 'cv', 'upload cv'],
    response: `To upload your resume:\n1. Go to **My Profile** in the sidebar\n2. Scroll to the Resume section\n3. Click **Upload Resume** and select your PDF\n4. Your resume is stored securely and shared with companies when you apply\n\nMake sure your resume is a PDF under 5MB.`,
  },
  {
    patterns: ['cgpa', 'gpa', 'eligibility', 'eligible', 'criteria', 'cutoff'],
    response: `Each job listing has its own eligibility criteria set by the company — minimum CGPA, allowed departments, batch year, etc.\n\nWhen you open a job, it shows whether you meet the criteria. If you're not eligible, the Apply button will be disabled with a reason shown.`,
  },

  // ── Jobs ──────────────────────────────────────────────────────────────────
  {
    patterns: ['apply', 'apply for job', 'how to apply', 'job apply'],
    response: `To apply for a job:\n1. Go to **Job Listings** in the sidebar\n2. Browse open positions\n3. Click on a job to see full details and eligibility\n4. If eligible, click **Apply Now**\n5. Add a cover letter (optional) and submit\n\nYou'll get a notification once the company reviews your application.`,
  },
  {
    patterns: ['job listing', 'browse jobs', 'find jobs', 'available jobs', 'open jobs', 'job openings'],
    response: `All active job openings are in **Job Listings** (sidebar). You can filter by:\n• Job type (full-time, internship, contract)\n• Package range\n• Department eligibility\n\nClick any card to see full details including role, responsibilities, and required skills.`,
  },
  {
    patterns: ['post job', 'add job', 'create job', 'new job listing'],
    response: `To post a job (Company role):\n1. Go to **Post a Job** in the sidebar\n2. Fill in: Job title, description, type, package, location\n3. Set eligibility: minimum CGPA, departments, batch year\n4. Add required skills\n5. Click **Post Job**\n\nThe listing goes live immediately and students matching your criteria can apply.`,
  },
  {
    patterns: ['close job', 'delete job', 'remove job', 'edit job'],
    response: `To manage your job listings:\n• Go to **My Listings** in the sidebar\n• Click on any listing to edit details or change its status\n• You can set it to **Active**, **Closed**, or **Draft**\n• Closed jobs no longer accept new applications`,
  },

  // ── Applications ──────────────────────────────────────────────────────────
  {
    patterns: ['application status', 'check application', 'track application', 'my application'],
    response: `Check your application status in **My Applications** (sidebar).\n\nStatus flow: Submitted → Reviewed → Shortlisted → Interview Scheduled → Interview Completed → Offered / Rejected\n\nYou'll receive notifications and emails at each stage automatically.`,
  },
  {
    patterns: ['shortlist', 'shortlisted', 'reject application', 'review application'],
    response: `To manage applications (Company role):\n1. Go to **Applications** in the sidebar\n2. Filter by job or status\n3. Click an application to see the student's profile and resume\n4. Use the buttons to: **Shortlist**, **Reject**, or mark as **Reviewed**\n\nShortlisted candidates become eligible for interview scheduling.`,
  },
  {
    patterns: ['withdraw', 'cancel application', 'remove application'],
    response: `To withdraw an application, go to **My Applications**, find the application, and click **Withdraw**.\n\nNote: You can only withdraw if the status is still **Submitted** or **Reviewed** — not after you've been shortlisted.`,
  },
  {
    patterns: ['offer', 'offer letter', 'offer accepted', 'offer rejected', 'accept offer'],
    response: `When a company sends you an offer:\n1. You'll receive an email and portal notification\n2. Go to **My Applications** to view the offer details\n3. Click **Accept** or **Decline** before the deadline shown\n\nAccepted offers update your placement status automatically.`,
  },

  // ── Interviews ────────────────────────────────────────────────────────────
  {
    patterns: ['schedule interview', 'set interview', 'book interview', 'interview schedule'],
    response: `To schedule an interview (Company role):\n1. Go to **Interviews** → click **+ Schedule Interview**\n2. Select a shortlisted candidate\n3. Set date & time (shown in IST)\n4. Choose format: **Virtual** (paste a Google Meet/Zoom link) or **In-Person** (add venue)\n5. Click **Schedule Interview**\n\nThe student is automatically notified by email and portal notification.`,
  },
  {
    patterns: ['join interview', 'start interview', 'video call', 'google meet', 'zoom', 'virtual interview'],
    response: `To join a virtual interview (Student role):\n1. Go to **Interviews** in the sidebar\n2. Find today's interview — it will be highlighted\n3. The **Join via Google Meet / Zoom** button activates 15 minutes before the scheduled time\n4. Click it — it opens your meeting in a new tab\n\nMake sure your camera and mic are ready beforehand!`,
  },
  {
    patterns: ['interview status', 'my interview', 'upcoming interview', 'interview list'],
    response: `View all your interviews in the **Interviews** section (sidebar).\n\nTabs:\n• **Upcoming** — future scheduled interviews\n• **Past** — completed or missed\n• **Cancelled** — cancelled interviews\n\nToday's interviews are highlighted with a gold border and a live indicator.`,
  },
  {
    patterns: ['feedback', 'submit feedback', 'interview feedback', 'interview result'],
    response: `To submit interview feedback (Company role):\n1. Go to **Interviews**\n2. Find the completed interview\n3. Click **Submit Feedback**\n4. Rate: Technical, Communication, Problem Solving, Overall (1–5)\n5. Add Strengths, Areas for Improvement\n6. Set Result: **Pass / Fail / Hold**\n\nPassing moves the application to Interview Completed; Failing marks it Rejected.`,
  },
  {
    patterns: ['cancel interview', 'reschedule interview'],
    response: `To cancel an interview (Company role):\n• Go to **Interviews** → find the interview → click **Cancel**\n• Optionally add a cancellation reason\n\nThe student is notified by email automatically.\n\nTo reschedule, cancel the current one and create a new interview for the same candidate.`,
  },

  // ── Placement Drives ──────────────────────────────────────────────────────
  {
    patterns: ['placement drive', 'campus drive', 'drive', 'register drive', 'drive registration'],
    response: `Placement Drives are organised recruitment events with multiple companies.\n\nAs a **Student**:\n• Go to **Placement Drives** to see all upcoming drives\n• Click **Register** to participate (eligibility is checked automatically)\n\nAs an **Admin**:\n• Go to **Placement Drives** → **+ Create Drive** to set up a new drive with schedule, companies, and eligibility rules.`,
  },
  {
    patterns: ['create drive', 'add drive', 'new drive'],
    response: `To create a placement drive (Admin role):\n1. Go to **Placement Drives** → **+ Create Drive**\n2. Enter title, description, start/end dates\n3. Set eligibility (departments, CGPA, batch)\n4. Add participating companies\n5. Publish the drive\n\nAll eligible students are notified automatically.`,
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    patterns: ['manage student', 'student list', 'student management', 'bulk update'],
    response: `As Admin, go to **Students** to:\n• View all registered students with filters (department, batch, status)\n• Edit student profiles\n• Bulk update placement status\n• Export student data as CSV\n• Search by name, roll number, or email`,
  },
  {
    patterns: ['manage company', 'company list', 'company management', 'add company'],
    response: `As Admin, go to **Companies** to:\n• View all registered company accounts\n• Approve or deactivate companies\n• See each company's job listings and hiring activity\n\nNew company accounts are created during registration — contact the placement office.`,
  },
  {
    patterns: ['report', 'analytics', 'statistics', 'dashboard stats', 'placement rate', 'export'],
    response: `The **Reports** section (Admin) shows:\n• Placement rate donut chart\n• Monthly offer trends line chart\n• Department-wise placements bar chart\n• Package distribution\n• Top hiring companies\n\nClick **Export CSV** to download a full student placement data spreadsheet.`,
  },
  {
    patterns: ['notification', 'alerts', 'email notification', 'not receiving email'],
    response: `Notifications are sent:\n• In-portal (bell icon) — real-time via Socket.io\n• Email — via Gmail SMTP for key events (application updates, interview scheduled, offers)\n\nIf you're not receiving emails, check your spam folder. Contact your admin if the issue persists — the email configuration may need to be verified.`,
  },

  // ── Technical / General ───────────────────────────────────────────────────
  {
    patterns: ['error', 'bug', 'not working', 'issue', 'problem', 'broken'],
    response: `Sorry you're facing an issue! A few things to try:\n1. **Refresh the page** — some glitches resolve on reload\n2. **Clear browser cache** (Ctrl+Shift+R)\n3. **Log out and log back in** — refreshes your session\n4. **Check your internet connection**\n\nIf the problem persists, note what you were doing and contact your placement cell administrator.`,
  },
  {
    patterns: ['help', 'how to use', 'guide', 'tutorial', 'what can i do', 'features'],
    response: null, // handled dynamically below based on role
    dynamic: true,
  },
  {
    patterns: ['contact', 'admin contact', 'reach admin', 'placement office', 'support'],
    response: `For issues that need human help, contact your **Placement Cell Office** directly.\n\nYou can also reach out via:\n• The college placement office email\n• In-person at the placement office\n\nThis chat assistant can answer common portal questions instantly!`,
  },
  {
    patterns: ['thank', 'thanks', 'thank you', 'helpful', 'great', 'awesome'],
    response: `You're welcome! 😊 Feel free to ask anything else about the placement portal. Good luck with your placements! 🎓`,
  },
  {
    patterns: ['hi', 'hello', 'hey', 'hii', 'helo', 'good morning', 'good evening', 'good afternoon'],
    response: null,
    dynamic: true,
    greet: true,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SMART MATCHER  — tokenises input, scores each KB entry
// ─────────────────────────────────────────────────────────────────────────────
const tokenise = (str) =>
  str.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean)

const score = (input, patterns) => {
  const tokens = tokenise(input)
  const inputLow = input.toLowerCase()
  let s = 0
  for (const p of patterns) {
    if (inputLow.includes(p)) s += 10          // exact phrase match
    else if (tokens.some(t => p.includes(t) || t.includes(p))) s += 4  // partial
  }
  return s
}

const getRoleHelp = (role) => {
  if (role === 'student') return `As a **Student** you can:\n• 🔍 Browse and apply for jobs\n• 📋 Track your application status\n• 📅 View and join your scheduled interviews\n• 🏫 Register for placement drives\n• 📄 Upload your resume and manage your profile\n\nWhat would you like help with?`
  if (role === 'company') return `As a **Company** you can:\n• 💼 Post job listings with eligibility criteria\n• 👥 Review and shortlist applications\n• 📅 Schedule virtual or in-person interviews\n• ✍️ Submit interview feedback and ratings\n• 📨 Send offer letters to selected candidates\n\nWhat would you like help with?`
  if (role === 'admin')   return `As an **Admin** you can:\n• 🎓 Manage all student and company accounts\n• 🚀 Create and manage placement drives\n• 📅 View the all-interviews calendar\n• 📊 Access analytics and reports\n• 📥 Export placement data as CSV\n\nWhat would you like help with?`
  return `Ask me anything about applying for jobs, tracking applications, joining interviews, or using the portal features!`
}

const getGreet = (name, role) =>
  `Hi ${name}! 👋 How can I help you today?\n\n${getRoleHelp(role)}`

const getReply = (input, role, name) => {
  if (!input.trim()) return null

  // Score every KB entry
  let best = null, bestScore = 0
  for (const entry of KB) {
    const s = score(input, entry.patterns)
    if (s > bestScore) { bestScore = s; best = entry }
  }

  // Threshold: if nothing matched well, return a fallback
  if (!best || bestScore < 3) {
    return `I'm not sure about that specific question. Try asking about:\n• Applying for jobs\n• Interview process\n• Application status\n• Placement drives\n• Profile & resume\n\nOr describe your issue and I'll do my best to help!`
  }

  // Dynamic responses
  if (best.dynamic) {
    if (best.greet) return getGreet(name, role)
    return getRoleHelp(role)
  }

  return best.response
}

// ─────────────────────────────────────────────────────────────────────────────
// QUICK SUGGESTIONS by role
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTIONS = {
  student: ['How do I apply for a job?', 'Check my interview status', 'How to upload resume?', 'What is a placement drive?'],
  company: ['How to post a job?', 'How to schedule an interview?', 'How to submit feedback?', 'How to shortlist candidates?'],
  admin:   ['How to create a drive?', 'Manage student accounts', 'How to export reports?', 'View all interviews'],
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-gold-400"
          style={{ animation: `qcbBounce 1.1s ease-in-out ${i * 0.18}s infinite` }} />
      ))}
    </div>
  )
}

// Render plain text with **bold** support
function MsgText({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i} className={line === '' ? 'h-1' : ''}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-ink-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <IconSparkle />
        </div>
      )}
      <div className={`max-w-[84%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-ink-800 text-white rounded-tr-sm'
          : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
      }`}>
        {isUser ? msg.content : <MsgText text={msg.content} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function QueryChatBox() {
  const { user } = useAuth()
  const role = user?.role || 'student'
  const firstName = user?.name?.split(' ')[0] || 'there'

  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [typing, setTyping]       = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [unread, setUnread]       = useState(0)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // First open — show welcome message
  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true)
      setUnread(0)
      const welcome = {
        role: 'assistant',
        content: `Hi ${firstName}! 👋 I'm your placement portal assistant.\n\nAsk me anything about ${
          role === 'student' ? 'jobs, applications, interviews, or drives'
          : role === 'company' ? 'posting jobs, reviewing applications, or interviews'
          : 'managing students, companies, drives, or reports'
        }.`,
        id: 'welcome'
      }
      setMessages([welcome])
    }
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || typing) return
    setInput('')

    const userMsg = { role: 'user', content: trimmed, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)

    // Simulate a natural typing delay (300–700ms based on reply length)
    const reply = getReply(trimmed, role, firstName)
    const delay = Math.min(300 + reply.length * 1.2, 900)

    setTimeout(() => {
      setTyping(false)
      const botMsg = { role: 'assistant', content: reply, id: Date.now() + 1 }
      setMessages(prev => [...prev, botMsg])
      if (!open) setUnread(n => n + 1)
    }, delay)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const chips = SUGGESTIONS[role] || SUGGESTIONS.student
  const showChips = messages.length === 1 && !typing

  return (
    <>
      <style>{`
        @keyframes qcbBounce {
          0%,60%,100% { transform:translateY(0);   opacity:.4; }
          30%          { transform:translateY(-5px); opacity:1;  }
        }
        @keyframes qcbPop {
          from { opacity:0; transform:scale(.88) translateY(14px); }
          to   { opacity:1; transform:scale(1)   translateY(0);    }
        }
        @keyframes qcbSlide {
          from { opacity:0; transform:translateY(5px); }
          to   { opacity:1; transform:translateY(0);   }
        }
        .qcb-pop   { animation: qcbPop   .26s cubic-bezier(.34,1.56,.64,1) forwards; }
        .qcb-slide { animation: qcbSlide .18s ease forwards; }
        .qcb-msgs::-webkit-scrollbar { width:4px; }
        .qcb-msgs::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:9999px; }
      `}</style>

      {/* ── FAB button ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open support chat"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center
                   text-gold-400 shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(145deg,#1a1a2e,#0f0e17)',
          boxShadow: '0 8px 28px rgba(15,14,23,.4), 0 0 0 3px rgba(226,168,0,.18)',
        }}
      >
        <span className={`transition-transform duration-200 ${open ? 'scale-90' : 'scale-100'}`}>
          {open ? <IconClose /> : <IconChat />}
        </span>
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full
                           bg-gold-500 text-ink-900 text-xs font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
        {/* First-time pulse ring */}
        {!hasOpened && !open && (
          <span className="absolute inset-0 rounded-full bg-gold-400 opacity-25 animate-ping" />
        )}
      </button>

      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="qcb-pop fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: '360px', maxWidth: 'calc(100vw - 2rem)', height: '520px',
            background: '#f8f7f4',
            boxShadow: '0 24px 60px rgba(15,14,23,.22), 0 4px 16px rgba(15,14,23,.1)',
            border: '1px solid rgba(226,168,0,.14)',
          }}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3.5"
            style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#0f0e17 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(226,168,0,.15)' }}>
                <IconSparkle />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight tracking-wide">
                  Placement Assistant
                </p>
                <p className="text-xs leading-tight flex items-center gap-1.5"
                  style={{ color: 'rgba(226,168,0,.75)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  Always available · Instant answers
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                         text-white/40 hover:text-white hover:bg-white/10 transition-colors">
              <IconClose />
            </button>
          </div>

          {/* Messages */}
          <div className="qcb-msgs flex-1 overflow-y-auto px-4 py-4 space-y-3">

            {messages.map(msg => (
              <div key={msg.id} className="qcb-slide">
                <Bubble msg={msg} />
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="qcb-slide flex gap-2">
                <div className="w-6 h-6 rounded-full bg-ink-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <IconSparkle />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Quick-action chips */}
            {showChips && (
              <div className="qcb-slide pt-1">
                <p className="text-xs text-gray-400 font-medium mb-2 pl-8">Common questions</p>
                <div className="pl-8 flex flex-col gap-1.5">
                  {chips.map((chip, i) => (
                    <button key={i} onClick={() => sendMessage(chip)}
                      className="w-full text-left text-xs px-3.5 py-2 rounded-xl
                                 bg-white border border-gray-200 text-gray-600
                                 hover:border-gold-400 hover:text-ink-800 hover:bg-gold-50
                                 transition-all duration-150 shadow-sm">
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 px-3 py-3 border-t border-gray-200/60 bg-white">
            <div className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200
                            focus-within:border-gold-400 focus-within:ring-2
                            focus-within:ring-gold-400/20 transition-all duration-200 px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask anything about the portal…"
                rows={1}
                disabled={typing}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400
                           focus:outline-none resize-none leading-relaxed disabled:opacity-50"
                style={{ maxHeight: '80px', overflowY: 'auto' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                className="flex-shrink-0 w-7 h-7 rounded-lg bg-ink-800 text-gold-400
                           flex items-center justify-center transition-all duration-150
                           hover:bg-ink-700 active:scale-90
                           disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <IconSend />
              </button>
            </div>
            <p className="text-center text-xs text-gray-300 mt-2 select-none">
              Placement Cell · Portal Help
            </p>
          </div>
        </div>
      )}
    </>
  )
}
