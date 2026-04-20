import { useEffect, useState } from 'react'
import {
  ChatBubbleLeftRightIcon, PlusIcon, ChevronRightIcon,
  ClockIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon
} from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { Modal, LoadingSpinner, EmptyState, StatusBadge } from '../../components/common/UI'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'application', label: 'Application Issue' },
  { value: 'interview',   label: 'Interview Issue' },
  { value: 'job',         label: 'Job Listing' },
  { value: 'profile',     label: 'Profile / Resume' },
  { value: 'offer',       label: 'Offer Letter' },
  { value: 'drive',       label: 'Placement Drive' },
  { value: 'technical',   label: 'Technical Issue' },
  { value: 'other',       label: 'Other' },
]
const PRIORITIES = [
  { value: 'low',    label: 'Low',    cls: 'badge-gray' },
  { value: 'medium', label: 'Medium', cls: 'badge-amber' },
  { value: 'high',   label: 'High',   cls: 'badge-red' },
]
const STATUS_META = {
  open:        { label: 'Open',        icon: ClockIcon,        cls: 'text-blue-600 bg-blue-50' },
  in_progress: { label: 'In Progress', icon: ArrowPathIcon,    cls: 'text-amber-600 bg-amber-50' },
  resolved:    { label: 'Resolved',    icon: CheckCircleIcon,  cls: 'text-green-600 bg-green-50' },
  closed:      { label: 'Closed',      icon: XCircleIcon,      cls: 'text-gray-500 bg-gray-100' },
}

// ── Raise Query Modal ────────────────────────────────────────────────────────
function RaiseModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ category: '', priority: 'medium', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.category || !form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields'); return
    }
    setLoading(true)
    try {
      await api.post('/queries', form)
      toast.success('Query submitted! We will respond shortly.')
      onCreated()
      onClose()
      setForm({ category: '', priority: 'medium', subject: '', message: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit query')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Raise a New Query" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category <span className="text-red-400">*</span></label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input">
              <option value="">Select category…</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="input">
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Subject <span className="text-red-400">*</span></label>
          <input
            value={form.subject}
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            placeholder="Brief summary of your issue…"
            maxLength={120}
            className="input"
          />
          <p className="text-xs text-gray-400 mt-1">{form.subject.length}/120</p>
        </div>
        <div>
          <label className="label">Describe your issue <span className="text-red-400">*</span></label>
          <textarea
            rows={5}
            value={form.message}
            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
            placeholder="Explain your issue in detail. Include any error messages, steps you took, or screenshots description…"
            className="input resize-none"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Submitting…' : 'Submit Query'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Thread View Modal ────────────────────────────────────────────────────────
function ThreadModal({ queryId, onClose, onUpdate }) {
  const [data, setData]     = useState(null)
  const [reply, setReply]   = useState('')
  const [sending, setSending] = useState(false)

  const load = async () => {
    try { const r = await api.get(`/queries/${queryId}`); setData(r.data) }
    catch { toast.error('Failed to load query') }
  }
  useEffect(() => { if (queryId) load() }, [queryId])

  const sendReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      await api.post(`/queries/${queryId}/reply`, { message: reply })
      setReply('')
      load()
      onUpdate()
    } catch { toast.error('Failed to send reply') }
    finally { setSending(false) }
  }

  if (!data) return (
    <Modal open={!!queryId} onClose={onClose} title="Loading…" size="lg">
      <LoadingSpinner />
    </Modal>
  )

  const meta = STATUS_META[data.status]
  const catLabel = CATEGORIES.find(c => c.value === data.category)?.label || data.category

  return (
    <Modal open={!!queryId} onClose={onClose} title={data.ticketId} size="lg">
      <div className="space-y-4">
        {/* Header info */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900 text-base">{data.subject}</h3>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="badge-blue badge">{catLabel}</span>
              <span className={`badge ${PRIORITIES.find(p => p.value === data.priority)?.cls}`}>
                {data.priority} priority
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${meta.cls}`}>
                <meta.icon className="w-3 h-3" /> {meta.label}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 whitespace-nowrap">{dayjs(data.createdAt).fromNow()}</p>
        </div>

        {/* Thread messages */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {/* Original message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center text-gold-400 text-xs font-bold flex-shrink-0">
              {data.raisedBy?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{data.raisedBy?.name}</span>
                <span className="badge-blue badge capitalize">{data.raisedBy?.role}</span>
                <span className="text-xs text-gray-400">{dayjs(data.createdAt).fromNow()}</span>
              </div>
              <div className="bg-gray-50 rounded-xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {data.message}
              </div>
            </div>
          </div>

          {/* Replies */}
          {data.replies?.map((rep, i) => {
            const isAdmin = rep.role === 'admin'
            return (
              <div key={i} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isAdmin ? 'bg-gold-500 text-ink-900' : 'bg-gray-200 text-gray-600'
                }`}>
                  {rep.author?.name?.[0]?.toUpperCase()}
                </div>
                <div className={`flex-1 ${isAdmin ? 'items-end flex flex-col' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-medium text-gray-900">{rep.author?.name}</span>
                    {isAdmin && <span className="badge-amber badge">Admin</span>}
                    <span className="text-xs text-gray-400">{dayjs(rep.createdAt).fromNow()}</span>
                  </div>
                  <div className={`px-4 py-3 rounded-xl text-sm whitespace-pre-wrap leading-relaxed max-w-[90%] ${
                    isAdmin
                      ? 'bg-ink-800 text-white rounded-tr-sm'
                      : 'bg-gray-50 text-gray-700 rounded-tl-sm'
                  }`}>
                    {rep.message}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Reply box — only if not closed/resolved */}
        {!['resolved', 'closed'].includes(data.status) && (
          <div className="pt-2 border-t border-gray-100">
            <label className="label">Add a reply</label>
            <textarea
              rows={3}
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Type your reply…"
              className="input resize-none mb-3"
            />
            <button onClick={sendReply} disabled={sending || !reply.trim()} className="btn-primary w-full">
              {sending ? 'Sending…' : 'Send Reply'}
            </button>
          </div>
        )}

        {['resolved', 'closed'].includes(data.status) && (
          <div className="pt-2 border-t border-gray-100 text-center text-sm text-gray-400">
            This query is {data.status}. No further replies can be added.
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function QueryPortal() {
  const [queries, setQueries]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [raiseOpen, setRaiseOpen] = useState(false)
  const [viewId, setViewId]     = useState(null)
  const [filter, setFilter]     = useState('all')

  const load = async () => {
    try {
      const { data } = await api.get('/queries')
      setQueries(data.queries || [])
    } catch { toast.error('Failed to load queries') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = filter === 'all'
    ? queries
    : queries.filter(q => q.status === filter)

  const stats = {
    total:      queries.length,
    open:       queries.filter(q => q.status === 'open').length,
    inProgress: queries.filter(q => q.status === 'in_progress').length,
    resolved:   queries.filter(q => ['resolved','closed'].includes(q.status)).length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Support Queries</h1>
          <p className="text-sm text-gray-500 mt-1">Raise and track your support tickets</p>
        </div>
        <button onClick={() => setRaiseOpen(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Raise a Query
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total',       value: stats.total,      color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Open',        value: stats.open,       color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-amber-600',bg: 'bg-amber-50' },
          { label: 'Resolved',    value: stats.resolved,   color: 'text-green-600',bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`card flex flex-col items-center py-4 ${s.bg} border-0 shadow-none`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-5 w-fit">
        {['all','open','in_progress','resolved','closed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-ink-800 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState
          icon={ChatBubbleLeftRightIcon}
          title="No queries found"
          description="Raise a query if you need help with anything in the portal"
          action={<button onClick={() => setRaiseOpen(true)} className="btn-primary">Raise a Query</button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(q => {
            const meta = STATUS_META[q.status]
            const catLabel = CATEGORIES.find(c => c.value === q.category)?.label || q.category
            const priMeta = PRIORITIES.find(p => p.value === q.priority)
            return (
              <div key={q._id}
                onClick={() => setViewId(q._id)}
                className="card cursor-pointer hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{q.ticketId}</span>
                      <span className="badge-blue badge">{catLabel}</span>
                      <span className={`badge ${priMeta?.cls}`}>{q.priority}</span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.cls}`}>
                        <meta.icon className="w-3 h-3" />{meta.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{q.subject}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{q.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Raised {dayjs(q.createdAt).fromNow()}</span>
                      {q.replies?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                          {q.replies.length} {q.replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RaiseModal open={raiseOpen} onClose={() => setRaiseOpen(false)} onCreated={load} />
      <ThreadModal queryId={viewId} onClose={() => setViewId(null)} onUpdate={load} />
    </div>
  )
}
