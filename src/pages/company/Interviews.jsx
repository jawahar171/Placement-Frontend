import { useEffect, useState } from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState, Modal, Avatar } from '../../components/common/UI'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

function ScheduleModal({ open, onClose, onScheduled }) {
  const [apps, setApps]     = useState([])
  const [form, setForm]     = useState({
    applicationId: '', scheduledAt: '', format: 'virtual',
    round: 1, roundName: 'Technical Round', duration: 60, venue: '', agenda: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      api.get('/applications/company?status=shortlisted').then(r => setApps(r.data.applications))
    }
  }, [open])

  const handleSubmit = async () => {
    if (!form.applicationId || !form.scheduledAt) { 
      toast.error('Select candidate and schedule time')
      return 
    }

    // Validate that the scheduled date is in the future
    const scheduledDate = new Date(form.scheduledAt)
    const now = new Date()
    if (scheduledDate < now) {
      toast.error('Cannot schedule interview in the past')
      return
    }

    setLoading(true)
    try {
      // Convert datetime-local format to ISO string
      const scheduledAtISO = new Date(form.scheduledAt).toISOString()
      
      const payload = {
        ...form,
        scheduledAt: scheduledAtISO,
        round: parseInt(form.round),
        duration: parseInt(form.duration)
      }

      await api.post('/interviews/schedule', payload)
      toast.success('Interview scheduled!')
      onScheduled()
      onClose()
      setForm({ 
        applicationId: '', scheduledAt: '', format: 'virtual', 
        round: 1, roundName: 'Technical Round', duration: 60, venue: '', agenda: '' 
      })
    } catch (err) { 
      console.error('Schedule error:', err)
      toast.error(err.response?.data?.message || 'Failed to schedule') 
    }
    finally { setLoading(false) }
  }

  const roundNames = ['Technical Round', 'HR Round', 'Aptitude Test', 'Group Discussion', 'Managerial Round', 'Final Round']

  // Get minimum datetime (now + 1 hour)
  const getMinDateTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return now.toISOString().slice(0, 16)
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule Interview" size="lg">
      <div className="space-y-4">
        <div>
          <label className="label">Select Shortlisted Candidate <span className="text-red-400">*</span></label>
          <select value={form.applicationId} onChange={e => setForm(p => ({ ...p, applicationId: e.target.value }))} className="input">
            <option value="">Choose candidate...</option>
            {apps.map(app => (
              <option key={app._id} value={app._id}>
                {app.student?.name} — {app.job?.title}
              </option>
            ))}
          </select>
          {apps.length === 0 && <p className="text-xs text-amber-600 mt-1">No shortlisted applications found. Shortlist candidates first.</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date & Time <span className="text-red-400">*</span></label>
            <input 
              type="datetime-local" 
              value={form.scheduledAt} 
              onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} 
              min={getMinDateTime()}
              className="input" 
            />
            <p className="text-xs text-gray-500 mt-1">Select future date & time</p>
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <input type="number" min="15" max="240" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Round Number</label>
            <input type="number" min="1" max="10" value={form.round} onChange={e => setForm(p => ({ ...p, round: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Round Name</label>
            <select value={form.roundName} onChange={e => setForm(p => ({ ...p, roundName: e.target.value }))} className="input">
              {roundNames.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Format</label>
            <select value={form.format} onChange={e => setForm(p => ({ ...p, format: e.target.value }))} className="input">
              <option value="virtual">Virtual (Video Call)</option>
              <option value="in-person">In-Person</option>
              <option value="phone">Phone</option>
            </select>
          </div>
          {form.format === 'in-person' && (
            <div>
              <label className="label">Venue</label>
              <input value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="Conference Room A" className="input" />
            </div>
          )}
        </div>

        <div>
          <label className="label">Agenda / Notes</label>
          <textarea rows={2} value={form.agenda} onChange={e => setForm(p => ({ ...p, agenda: e.target.value }))} placeholder="Topics to cover, preparation tips..." className="input resize-none" />
        </div>

        {form.format === 'virtual' && (
          <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            🎥 A video meeting room will be automatically created via Daily.co
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function FeedbackModal({ interview, onClose, onSaved }) {
  const [feedback, setFeedback] = useState({
    technicalRating: 3, communicationRating: 3, problemSolvingRating: 3,
    overallRating: 3, strengths: '', improvements: '', comments: '', result: 'pending'
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch(`/interviews/${interview._id}/feedback`, { feedback })
      toast.success('Feedback submitted')
      onSaved()
      onClose()
    } catch { toast.error('Failed to save feedback') }
    finally { setSaving(false) }
  }

  const RatingRow = ({ label, field }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button" onClick={() => setFeedback(p => ({ ...p, [field]: n }))}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${feedback[field] >= n ? 'bg-gold-500 text-ink-900' : 'bg-gray-100 text-gray-400'}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Modal open={!!interview} onClose={onClose} title="Submit Interview Feedback" size="lg">
      <div className="space-y-5">
        <div className="space-y-3">
          <RatingRow label="Technical Skills" field="technicalRating" />
          <RatingRow label="Communication"    field="communicationRating" />
          <RatingRow label="Problem Solving"  field="problemSolvingRating" />
          <RatingRow label="Overall Rating"   field="overallRating" />
        </div>
        <div>
          <label className="label">Strengths</label>
          <textarea rows={2} value={feedback.strengths} onChange={e => setFeedback(p => ({ ...p, strengths: e.target.value }))} placeholder="What impressed you about this candidate..." className="input resize-none" />
        </div>
        <div>
          <label className="label">Areas for Improvement</label>
          <textarea rows={2} value={feedback.improvements} onChange={e => setFeedback(p => ({ ...p, improvements: e.target.value }))} placeholder="What could be better..." className="input resize-none" />
        </div>
        <div>
          <label className="label">Result</label>
          <div className="flex gap-2">
            {[{v:'pass',label:'Pass',cls:'bg-green-500 text-white'},{v:'fail',label:'Fail',cls:'bg-red-500 text-white'},{v:'hold',label:'Hold',cls:'bg-amber-500 text-white'}].map(r => (
              <button key={r.v} type="button" onClick={() => setFeedback(p => ({ ...p, result: r.v }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${feedback.result === r.v ? r.cls : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Submit Feedback'}</button>
        </div>
      </div>
    </Modal>
  )
}

export default function CompanyInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [feedbackFor, setFeedbackFor]   = useState(null)
  const [filter, setFilter] = useState('upcoming')

  const fetchInterviews = () => {
    api.get('/interviews/my').then(r => { setInterviews(r.data); setLoading(false) })
  }

  useEffect(() => { fetchInterviews() }, [])

  const filtered = interviews.filter(iv => {
    const isPast = dayjs(iv.scheduledAt).isBefore(dayjs())
    if (filter === 'upcoming') return !isPast && iv.status !== 'cancelled'
    if (filter === 'past')     return isPast || iv.status === 'completed'
    return true
  })

  const handleCancel = async (id) => {
    const reason = prompt('Reason for cancellation (optional):')
    try {
      await api.patch(`/interviews/${id}/cancel`, { reason })
      toast.success('Interview cancelled')
      fetchInterviews()
    } catch { toast.error('Failed') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Interviews</h1>
          <p className="text-gray-500 text-sm mt-1">{interviews.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1">
            {['upcoming','past'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-ink-800 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={() => setScheduleOpen(true)} className="btn-primary">+ Schedule Interview</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarIcon} title={`No ${filter} interviews`} description="Schedule interviews with shortlisted candidates" action={<button onClick={() => setScheduleOpen(true)} className="btn-primary">Schedule Now</button>} />
      ) : (
        <div className="space-y-4">
          {filtered.map(iv => (
            <div key={iv._id} className="card">
              <div className="flex items-start gap-4">
                <Avatar name={iv.student?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{iv.student?.name}</h3>
                      <p className="text-sm text-gray-500">{iv.job?.title} · {iv.roundName}</p>
                    </div>
                    <StatusBadge status={iv.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span>📅 {dayjs(iv.scheduledAt).format('DD MMM YYYY, h:mm A')}</span>
                    <span>⏱ {iv.duration} min</span>
                    <span className="capitalize">📡 {iv.format}</span>
                    <span>Round {iv.round}</span>
                  </div>
                  {iv.meetingUrl && iv.status === 'scheduled' && (
                    <a href={iv.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-sm text-blue-600 hover:underline">
                      🔗 Join Meeting Room
                    </a>
                  )}
                  {iv.feedback?.result && iv.feedback.result !== 'pending' && (
                    <div className={`mt-3 px-3 py-2 rounded-lg text-sm inline-flex items-center gap-2 ${iv.feedback.result === 'pass' ? 'bg-green-50 text-green-700' : iv.feedback.result === 'fail' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      Result: <strong className="capitalize">{iv.feedback.result}</strong>
                      {iv.feedback.overallRating && <span>· ⭐ {iv.feedback.overallRating}/5</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                {iv.status === 'scheduled' && (
                  <>
                    <button onClick={() => setFeedbackFor(iv)} className="btn-primary text-sm py-1.5">Submit Feedback</button>
                    <button onClick={() => handleCancel(iv._id)} className="btn-ghost text-sm py-1.5 text-red-500 hover:bg-red-50">Cancel</button>
                  </>
                )}
                {iv.status === 'completed' && !iv.feedback?.result && (
                  <button onClick={() => setFeedbackFor(iv)} className="btn-secondary text-sm py-1.5">Add Feedback</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} onScheduled={fetchInterviews} />
      <FeedbackModal interview={feedbackFor} onClose={() => setFeedbackFor(null)} onSaved={fetchInterviews} />
    </div>
  )
}
