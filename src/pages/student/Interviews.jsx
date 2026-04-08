import { useEffect, useRef, useState } from 'react'
import { CalendarIcon, VideoCameraIcon, MapPinIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState, Modal } from '../../components/common/UI'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'

export default function StudentInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('upcoming')
  const [activeInterview, setActiveInterview] = useState(null)
  const videoRef = useRef(null)
  const callFrameRef = useRef(null)

  useEffect(() => {
    api.get('/interviews/my').then(r => {
      setInterviews(r.data)
      setLoading(false)
    })
  }, [])

  const filtered = interviews.filter(iv => {
    const isPast = dayjs(iv.scheduledAt).isBefore(dayjs())
    if (filter === 'upcoming') return !isPast && iv.status !== 'cancelled'
    if (filter === 'past')     return isPast || iv.status === 'completed'
    if (filter === 'cancelled') return iv.status === 'cancelled'
    return true
  })

  const joinCall = async (interview) => {
    setActiveInterview(interview)
    // Load Daily.co dynamically
    setTimeout(async () => {
      try {
        const DailyIframe = (await import('@daily-co/daily-js')).default
        if (callFrameRef.current) {
          callFrameRef.current.destroy()
          callFrameRef.current = null
        }
        const frame = DailyIframe.createFrame(videoRef.current, {
          iframeStyle: {
            width: '100%', height: '100%',
            border: 'none', borderRadius: '12px'
          },
          showLeaveButton: true,
          showFullscreenButton: true,
        })
        frame.join({ url: interview.meetingUrl })
        callFrameRef.current = frame
        frame.on('left-meeting', () => {
          setActiveInterview(null)
          frame.destroy()
        })
      } catch (err) {
        toast.error('Failed to join video call. Check your browser permissions.')
        console.error(err)
      }
    }, 300)
  }

  const leaveCall = () => {
    if (callFrameRef.current) {
      callFrameRef.current.destroy()
      callFrameRef.current = null
    }
    setActiveInterview(null)
  }

  return (
    <div>
      {/* Video call overlay */}
      {activeInterview && (
        <div className="fixed inset-0 z-50 bg-ink-900 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <h2 className="text-white font-semibold">{activeInterview.roundName}</h2>
              <p className="text-gray-400 text-sm">{activeInterview.job?.title}</p>
            </div>
            <button onClick={leaveCall} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
              Leave Call
            </button>
          </div>
          <div ref={videoRef} className="flex-1" />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">My Interviews</h1>
        <div className="flex bg-white rounded-xl border border-gray-200 p-1">
          {['upcoming','past','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-ink-800 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={CalendarIcon} title={`No ${filter} interviews`} description="Interviews will appear here when scheduled by companies" />
      ) : (
        <div className="space-y-4">
          {filtered.map(iv => {
            const isPast   = dayjs(iv.scheduledAt).isBefore(dayjs())
            const isToday  = dayjs(iv.scheduledAt).isSame(dayjs(), 'day')
            const canJoin  = iv.format === 'virtual' && iv.status === 'scheduled' && iv.meetingUrl && !isPast

            return (
              <div key={iv._id} className={`card ${isToday ? 'ring-2 ring-gold-400 ring-offset-1' : ''}`}>
                {isToday && (
                  <div className="flex items-center gap-2 text-xs font-medium text-gold-600 mb-3 pb-3 border-b border-gold-100">
                    <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                    Scheduled for today
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iv.format === 'virtual' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                    {iv.format === 'virtual'
                      ? <VideoCameraIcon className="w-6 h-6 text-blue-600" />
                      : <MapPinIcon className="w-6 h-6 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{iv.roundName}</h3>
                        <p className="text-sm text-gray-500">{iv.job?.title} · {iv.company?.companyProfile?.companyName}</p>
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
                    {iv.venue && <p className="text-sm text-gray-500 mt-1">📍 {iv.venue}</p>}
                    {iv.agenda && <p className="text-sm text-gray-500 mt-1 italic">"{iv.agenda}"</p>}

                    {iv.feedback?.result && iv.feedback.result !== 'pending' && (
                      <div className={`mt-3 px-3 py-2 rounded-lg text-sm ${iv.feedback.result === 'pass' ? 'bg-green-50 text-green-700' : iv.feedback.result === 'fail' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                        Result: <strong className="capitalize">{iv.feedback.result}</strong>
                        {iv.feedback.overallRating && ` · Rating: ${iv.feedback.overallRating}/5`}
                      </div>
                    )}
                  </div>
                </div>

                {canJoin && (
                  <div className="mt-4 pt-3 border-t border-gray-50">
                    <button onClick={() => joinCall(iv)} className="btn-primary flex items-center gap-2">
                      <VideoCameraIcon className="w-4 h-4" /> Join Interview
                    </button>
                    {iv.meetingUrl && (
                      <a href={iv.meetingUrl} target="_blank" rel="noreferrer" className="ml-3 text-sm text-blue-600 hover:underline">
                        Open in browser
                      </a>
                    )}
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
