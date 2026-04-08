import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseIcon, DocumentTextIcon, CalendarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatCard, StatusBadge, LoadingSpinner, EmptyState } from '../../components/common/UI'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export default function StudentDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/students/dashboard').then(r => {
      setData(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner className="h-96" />

  const { stats, recentApplications, upcomingInterviews, profile } = data || {}
  const sp = profile?.studentProfile

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-ink-900 to-ink-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative">
          <p className="text-gold-400 text-sm font-medium mb-1">Welcome back</p>
          <h2 className="font-display text-2xl font-semibold">{profile?.name}</h2>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-300">
            {sp?.department && <span>🎓 {sp.department}</span>}
            {sp?.batch && <span>📅 {sp.batch}</span>}
            {sp?.cgpa && <span>⭐ CGPA: {sp.cgpa}</span>}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sp?.placementStatus === 'placed' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
              {sp?.placementStatus?.replace(/_/g, ' ') || 'Not placed'}
            </span>
          </div>
          {!sp?.resumeUrl && (
            <Link to="/student/profile" className="inline-flex items-center gap-2 mt-4 bg-gold-500 text-ink-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gold-400 transition-colors">
              ⚠ Upload resume to start applying
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Applications" value={stats?.totalApplications}  icon={DocumentTextIcon} color="blue" />
        <StatCard label="Shortlisted"  value={stats?.shortlisted}         icon={TrophyIcon}        color="green" />
        <StatCard label="Interviews"   value={stats?.interviews}          icon={CalendarIcon}      color="amber" />
        <StatCard label="Offers"        value={stats?.offers}             icon={BriefcaseIcon}     color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Upcoming Interviews</h3>
            <Link to="/student/interviews" className="text-xs text-gold-600 hover:text-gold-700 font-medium">View all →</Link>
          </div>
          {upcomingInterviews?.length ? (
            <div className="space-y-3">
              {upcomingInterviews.map(iv => (
                <div key={iv._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{iv.job?.title}</p>
                    <p className="text-xs text-gray-500">{iv.company?.companyProfile?.companyName} · {iv.roundName}</p>
                    <p className="text-xs text-amber-600 mt-0.5 font-medium">{dayjs(iv.scheduledAt).format('DD MMM, h:mm A')}</p>
                  </div>
                  <span className={`badge ${iv.format === 'virtual' ? 'badge-blue' : 'badge-amber'} flex-shrink-0`}>
                    {iv.format}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarIcon} title="No upcoming interviews" description="Keep applying to get interview calls" />
          )}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Applications</h3>
            <Link to="/student/applications" className="text-xs text-gold-600 hover:text-gold-700 font-medium">View all →</Link>
          </div>
          {recentApplications?.length ? (
            <div className="space-y-3">
              {recentApplications.map(app => (
                <div key={app._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{app.job?.title}</p>
                    <p className="text-xs text-gray-500">{dayjs(app.createdAt).fromNow()}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={DocumentTextIcon} title="No applications yet" description="Browse jobs and start applying" action={<Link to="/student/jobs" className="btn-primary text-sm">Browse Jobs</Link>} />
          )}
        </div>
      </div>
    </div>
  )
}
