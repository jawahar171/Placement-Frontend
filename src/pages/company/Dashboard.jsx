// Company Dashboard
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseIcon, DocumentTextIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatCard, StatusBadge, LoadingSpinner, Avatar } from '../../components/common/UI'
import dayjs from 'dayjs'

export default function CompanyDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/companies/dashboard').then(r => { setData(r.data); setLoading(false) })
  }, [])

  if (loading) return <LoadingSpinner className="h-96" />
  const { stats, recentApplications, upcomingInterviews } = data || {}

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-ink-900 to-ink-700 rounded-2xl p-6 text-white">
        <p className="text-gold-400 text-sm font-medium mb-1">Company Portal</p>
        <h2 className="font-display text-2xl font-semibold">Recruitment Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your job postings, review applications, and schedule interviews.</p>
        <Link to="/company/post-job" className="inline-flex items-center gap-2 mt-4 bg-gold-500 text-ink-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gold-400 transition-colors">
          + Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Jobs"    value={stats?.activeJobs}         icon={BriefcaseIcon}    color="blue" />
        <StatCard label="Applications"   value={stats?.totalApplications}  icon={DocumentTextIcon} color="gold" />
        <StatCard label="Shortlisted"    value={stats?.shortlisted}        icon={UserGroupIcon}    color="green" />
        <StatCard label="Offers Made"    value={stats?.offers}             icon={CalendarIcon}     color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Applications</h3>
            <Link to="/company/applications" className="text-xs text-gold-600 font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentApplications?.slice(0, 5).map(app => (
              <div key={app._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Avatar name={app.student?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{app.student?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{app.job?.title}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Upcoming Interviews</h3>
            <Link to="/company/interviews" className="text-xs text-gold-600 font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {upcomingInterviews?.slice(0, 5).map(iv => (
              <div key={iv._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Avatar name={iv.student?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{iv.student?.name}</p>
                  <p className="text-xs text-gray-400">{iv.roundName} · {dayjs(iv.scheduledAt).format('DD MMM, h:mm A')}</p>
                </div>
                <span className={`badge ${iv.format === 'virtual' ? 'badge-blue' : 'badge-amber'}`}>{iv.format}</span>
              </div>
            ))}
            {!upcomingInterviews?.length && <p className="text-sm text-gray-400 text-center py-4">No upcoming interviews</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
