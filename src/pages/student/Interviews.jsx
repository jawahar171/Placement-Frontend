import { useEffect, useState } from 'react'
import { CalendarIcon, VideoCameraIcon, MapPinIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState } from '../../components/common/UI'
import dayjs from 'dayjs'

// Detect meeting provider from URL for labelling
const getMeetingProvider = (url) => {
  if (!url) return { label: 'Meeting', icon: '🔗', btnColor: 'bg-blue-600 hover:bg-blue-700' }
  if (url.includes('meet.google.com'))
    return { label: 'Google Meet', icon: '🟢', btnColor: 'bg-green-600 hover:bg-green-700' }
  if (url.includes('zoom.us'))
    return { label: 'Zoom',        icon: '🔵', btnColor: 'bg-blue-600 hover:bg-blue-700' }
  if (url.includes('teams.microsoft'))
    return { label: 'MS Teams',    icon: '🟣', btnColor: 'bg-purple-600 hover:bg-purple-700' }
  return { label: 'Meeting Link', icon: '🔗', btnColor: 'bg-blue-600 hover:bg-blue-700' }
}

export default function StudentInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('upcoming')

  useEffect(() => {
    api.get('/interviews/my').then(r => {
      setInterviews(r.data)
      setLoading(false)
    })
  }, [])

  const filtered = interviews.filter(iv => {
    const isPast = dayjs(iv.scheduledAt).isBefore(dayjs())
    if (filter === 'upcoming')  return !isPast && iv.status !== 'cancelled'
    if (filter === 'past')      return isPast  || iv.status === 'completed'
    if (filter === 'cancelled') return iv.status === 'cancelled'
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">My Interviews</h1>
        <div className="flex bg-white rounded-xl border border-gray-200 p-1">
          {['upcoming', 'past', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-ink-800 text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title={`No ${filter} interviews`}
          description="Interviews will appear here when scheduled by companies"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(iv => {
            const isPast  = dayjs(iv.scheduledAt).isBefore(dayjs())
            const isToday = dayjs(iv.scheduledAt).isSame(dayjs(), 'day')

            // A student can join if: virtual format, has a meeting link, not cancelled
            // We allow joining on the day and slightly past (in case interview runs over)
            const isWithin24h = dayjs(iv.scheduledAt).isAfter(dayjs().subtract(24, 'hour'))
            const canJoin = (
              iv.format === 'virtual' &&
              iv.meetingUrl &&
              iv.status !== 'cancelled' &&
              isWithin24h
            )

            const provider = getMeetingProvider(iv.meetingUrl)

            return (
              <div
                key={iv._id}
                className={`card ${isToday ? 'ring-2 ring-gold-400 ring-offset-1' : ''}`}
              >
                {isToday && (
                  <div className="flex items-center gap-2 text-xs font-medium text-gold-600 mb-3 pb-3 border-b border-gold-100">
                    <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                    Scheduled for today
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    iv.format === 'virtual' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    {iv.format === 'virtual'
                      ? <VideoCameraIcon className="w-6 h-6 text-blue-600" />
                      : <MapPinIcon className="w-6 h-6 text-amber-600" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{iv.roundName}</h3>
                        <p className="text-sm text-gray-500">
                          {iv.job?.title} · {iv.company?.companyName || iv.company?.name}
                        </p>
                      </div>
                      <StatusBadge status={iv.status} />
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        {dayjs(iv.scheduledAt).format('DD MMM YYYY, h:mm A')}
                      </span>
                      <span>Round {iv.round}</span>
                      <span>{iv.duration} min</span>
                      <span className="capitalize">{iv.format}</span>
                    </div>

                    {iv.venue && (
                      <p className="text-sm text-gray-500 mt-1">📍 {iv.venue}</p>
                    )}
                    {iv.agenda && (
                      <p className="text-sm text-gray-500 mt-1 italic">"{iv.agenda}"</p>
                    )}

                    {iv.feedback?.result && iv.feedback.result !== 'pending' && (
                      <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${
                        iv.feedback.result === 'pass' ? 'bg-green-50 text-green-700'
                        : iv.feedback.result === 'fail' ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                      }`}>
                        Result: <strong className="capitalize">{iv.feedback.result}</strong>
                        {iv.feedback.overallRating && ` · Rating: ${iv.feedback.overallRating}/5`}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Join Meeting button (opens Google Meet / Zoom in new tab) ── */}
                {canJoin && (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-3">
                    <a
                      href={iv.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors ${provider.btnColor}`}
                    >
                      <VideoCameraIcon className="w-4 h-4" />
                      Join via {provider.label}
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 opacity-70" />
                    </a>
                    <p className="text-xs text-gray-400">
                      Opens in a new tab · Be ready 5 min early
                    </p>
                  </div>
                )}

                {/* ── Show meeting link info for future scheduled interviews ── */}
                {!canJoin && iv.format === 'virtual' && iv.meetingUrl && iv.status === 'scheduled' && !isPast && (
                  <div className="mt-4 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <VideoCameraIcon className="w-3.5 h-3.5" />
                      {provider.icon} {provider.label} link will be active on interview day
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
