import { useEffect, useState } from 'react'
import {
  ChatBubbleLeftRightIcon, ChevronRightIcon, FunnelIcon,
  ClockIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon,
  UserIcon, BuildingOffice2Icon
} from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { Modal, LoadingSpinner, EmptyState, Avatar } from '../../components/common/UI'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const CATEGORIES = [
  { value: 'application', label: 'Application' },
  { value: 'interview',   label: 'Interview' },
  { value: 'job',         label: 'Job Listing' },
  { value: 'profile',     label: 'Profile / Resume' },
  { value: 'offer',       label: 'Offer Letter' },
  { value: 'drive',       label: 'Placement Drive' },
  { value: 'technical',   label: 'Technical' },
  { value: 'other',       label: 'Other' },
]
const PRIORITIES = [
  { value: 'low',    label: 'Low',    cls: 'badge-gray' },
  { value: 'medium', label: 'Medium', cls: 'badge-amber' },
  { value: 'high',   label: 'High',   cls: 'badge-red' },
]
const STATUS_META = {
  open:        { label: 'Open',        icon: ClockIcon,       cls: 'text-blue-600  bg-blue-50' },
  in_progress: { label: 'In Progress', icon: ArrowPathIcon,   cls: 'text-amber-600 bg-amber-50' },
  resolved:    { label: 'Resolved',    icon: CheckCircleIcon, cls: 'text-green-600 bg-green-50' },
  closed:      { label: 'Closed',      icon: XCircleIcon,     cls: 'text-gray-500  bg-gray-100' },
}
const STATUS_OPTIONS = ['open','in_progress','resolved','closed']

// ── Admin Thread Modal ───────────────────────────────────────────────────────
function AdminThreadModal({ queryId, onClose, onUpdate }) {
  const [data, setData]       = useState(null)
  const [reply, setReply]     = useState('')
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)

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
      setReply(''); load(); onUpdate()
      toast.success('Reply sent')
    } catch { toast.error('Failed') }
    finally { setSending(false) }
  }

  const changeStatus = async (status) => {
    setUpdating(true)
    try {
      await api.patch(`/queries/${queryId}/status`, { status })
      load(); onUpdate()
      toast.success(`Status updated to ${status.replace('_',' ')}`)
    } catch { toast.error('Failed') }
    finally { setUpdating(false) }
  }

  if (!data) return (
    <Modal open={!!queryId} onClose={onClose} title="Loading…" size="lg">
      <LoadingSpinner />
    </Modal>
  )

  const meta     = STATUS_META[data.status]
  const catLabel = CATEGORIES.find(c => c.value === data.category)?.label || data.category
  const priMeta  = PRIORITIES.find(p => p.value === data.priority)

  return (
    <Modal open={!!queryId} onClose={onClose} title={data.ticketId} size="lg">
      <div className="space-y-4">

        {/* Ticket header */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
          <Avatar name={data.raisedBy?.name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-gray-900">{data.raisedBy?.name}</span>
              {data.raisedBy?.role === 'student'
                ? <><UserIcon className="w-3.5 h-3.5 text-blue-500" /><span className="text-xs text-blue-600">{data.raisedBy?.department} · {data.raisedBy?.rollNumber}</span></>
                : <><BuildingOffice2Icon className="w-3.5 h-3.5 text-purple-500" /><span className="text-xs text-purple-600">{data.raisedBy?.companyName}</span></>
              }
            </div>
            <p className="text-sm font-medium text-gray-800">{data.subject}</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className="badge-blue badge">{catLabel}</span>
              <span className={`badge ${priMeta?.cls}`}>{data.priority} priority</span>
              <span className="text-xs text-gray-400">{dayjs(data.createdAt).fromNow()}</span>
            </div>
          </div>
        </div>

        {/* Status changer */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-600">Status:</span>
          {STATUS_OPTIONS.map(s => {
            const sm = STATUS_META[s]
            return (
              <button key={s} disabled={updating || data.status === s}
                onClick={() => changeStatus(s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  data.status === s
                    ? `${sm.cls} border-transparent`
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                <sm.icon className="w-3.5 h-3.5" />
                {sm.label}
              </button>
            )
          })}
        </div>

        {/* Thread */}
        <div className="space-y-3 max-h-64 overflow-y-auto border border-gray-100 rounded-xl p-3 bg-gray-50">
          {/* Original message */}
          <div className="flex gap-3">
            <Avatar name={data.raisedBy?.name} size="sm" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">{data.raisedBy?.name}</span>
                <span className="text-xs text-gray-400">{dayjs(data.createdAt).fromNow()}</span>
              </div>
              <div className="bg-white rounded-xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                {data.message}
              </div>
            </div>
          </div>

          {data.replies?.map((rep, i) => {
            const isAdmin = rep.role === 'admin'
            return (
              <div key={i} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isAdmin ? 'bg-gold-500 text-ink-900' : 'bg-gray-200 text-gray-700'
                }`}>
                  {rep.author?.name?.[0]?.toUpperCase()}
                </div>
                <div className={`flex-1 ${isAdmin ? 'flex flex-col items-end' : ''}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-medium text-gray-900">{rep.author?.name}</span>
                    {isAdmin && <span className="badge-amber badge">Admin</span>}
                    <span className="text-xs text-gray-400">{dayjs(rep.createdAt).fromNow()}</span>
                  </div>
                  <div className={`px-4 py-3 rounded-xl text-sm whitespace-pre-wrap leading-relaxed max-w-[90%] ${
                    isAdmin
                      ? 'bg-ink-800 text-white rounded-tr-sm'
                      : 'bg-white text-gray-700 rounded-tl-sm border border-gray-100'
                  }`}>
                    {rep.message}
                  </div>
                </div>
              </div>
            )
          })}

          {data.replies?.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">No replies yet — be the first to respond</p>
          )}
        </div>

        {/* Admin reply box */}
        <div>
          <label className="label">Reply as Admin</label>
          <textarea
            rows={3}
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Type your response to the user…"
            className="input resize-none mb-3"
          />
          <button onClick={sendReply} disabled={sending || !reply.trim()} className="btn-primary w-full">
            {sending ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Admin Main Page ──────────────────────────────────────────────────────────
export default function AdminQueries() {
  const [queries, setQueries]   = useState([])
  const [stats, setStats]       = useState({})
  const [loading, setLoading]   = useState(true)
  const [viewId, setViewId]     = useState(null)
  const [filters, setFilters]   = useState({ status: '', category: '', priority: '' })

  const load = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status)   params.append('status',   filters.status)
      if (filters.category) params.append('category', filters.category)
      if (filters.priority) params.append('priority', filters.priority)
      const [qRes, sRes] = await Promise.all([
        api.get(`/queries?${params}`),
        api.get('/queries/stats'),
      ])
      setQueries(qRes.data.queries || [])
      setStats(sRes.data)
    } catch { toast.error('Failed to load queries') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [filters])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Query Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and respond to all support tickets</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total',       value: stats.total,      cls: 'text-gray-700 bg-gray-50' },
          { label: 'Open',        value: stats.open,       cls: 'text-blue-600  bg-blue-50' },
          { label: 'In Progress', value: stats.inProgress, cls: 'text-amber-600 bg-amber-50' },
          { label: 'Resolved',    value: stats.resolved,   cls: 'text-green-600 bg-green-50' },
          { label: 'Closed',      value: stats.closed,     cls: 'text-gray-500  bg-gray-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 flex flex-col items-center ${s.cls}`}>
            <p className="text-2xl font-bold">{s.value ?? '—'}</p>
            <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <FunnelIcon className="w-4 h-4 text-gray-400" />
        <select value={filters.status} onChange={e => setFilters(p => ({...p, status: e.target.value}))}
          className="input !w-auto !py-1.5 text-sm">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
        <select value={filters.category} onChange={e => setFilters(p => ({...p, category: e.target.value}))}
          className="input !w-auto !py-1.5 text-sm">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters(p => ({...p, priority: e.target.value}))}
          className="input !w-auto !py-1.5 text-sm">
          <option value="">All priorities</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        {(filters.status || filters.category || filters.priority) && (
          <button onClick={() => setFilters({ status:'', category:'', priority:'' })}
            className="text-sm text-gray-500 hover:text-gray-700 underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : queries.length === 0 ? (
        <EmptyState icon={ChatBubbleLeftRightIcon} title="No queries found" description="No support tickets match your filters" />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Ticket</th>
                <th className="table-th">Raised By</th>
                <th className="table-th">Category</th>
                <th className="table-th">Priority</th>
                <th className="table-th">Status</th>
                <th className="table-th">Replies</th>
                <th className="table-th">Time</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody>
              {queries.map(q => {
                const meta    = STATUS_META[q.status]
                const catLbl  = CATEGORIES.find(c => c.value === q.category)?.label || q.category
                const priMeta = PRIORITIES.find(p => p.value === q.priority)
                return (
                  <tr key={q._id} className="table-row cursor-pointer" onClick={() => setViewId(q._id)}>
                    <td className="table-td">
                      <div>
                        <p className="text-xs font-mono text-gray-400">{q.ticketId}</p>
                        <p className="font-medium text-gray-900 text-sm max-w-[180px] truncate">{q.subject}</p>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <Avatar name={q.raisedBy?.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{q.raisedBy?.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{q.raisedBy?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td"><span className="badge-blue badge">{catLbl}</span></td>
                    <td className="table-td"><span className={`badge ${priMeta?.cls}`}>{q.priority}</span></td>
                    <td className="table-td">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${meta.cls}`}>
                        <meta.icon className="w-3 h-3" />{meta.label}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                        {q.replies?.length || 0}
                      </span>
                    </td>
                    <td className="table-td text-xs text-gray-400">{dayjs(q.createdAt).fromNow()}</td>
                    <td className="table-td">
                      <ChevronRightIcon className="w-4 h-4 text-gray-300" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminThreadModal queryId={viewId} onClose={() => setViewId(null)} onUpdate={load} />
    </div>
  )
}
