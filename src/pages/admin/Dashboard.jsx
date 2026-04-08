import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AcademicCapIcon, BuildingOffice2Icon, BriefcaseIcon,
  CalendarDaysIcon, ClockIcon, CheckCircleIcon
} from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatCard, StatusBadge, LoadingSpinner, Avatar } from '../../components/common/UI'
import dayjs from 'dayjs'

export default function AdminDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => { setData(r.data); setLoading(false) })
  }, [])

  if (loading) return <LoadingSpinner className="h-96" />

  const { stats, recentDrives, todayInterviews } = data || {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-ink-900 to-ink-700 rounded-2xl p-6 text-white">
        <p className="text-gold-400 text-sm font-medium mb-1">Admin Control Panel</p>
        <h2 className="font-display text-2xl font-semibold">Placement Overview</h2>
        <p className="text-gray-400 text-sm mt-1">Manage the entire placement process from one place.</p>
        <div className="flex gap-3 mt-4">
          <Link to="/admin/drives"   className="bg-gold-500 text-ink-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gold-400 transition-colors">+ New Drive</Link>
          <Link to="/admin/reports"  className="bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">View Reports</Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students"    value={stats?.totalStudents}    icon={AcademicCapIcon}    color="blue" />
        <StatCard label="Placed Students"   value={stats?.placedStudents}   icon={CheckCircleIcon}    color="green"
          trend={`${stats?.placementRate}% placement rate`} />
        <StatCard label="Partner Companies" value={stats?.totalCompanies}   icon={BuildingOffice2Icon} color="purple" />
        <StatCard label="Active Jobs"       value={stats?.activeJobs}       icon={BriefcaseIcon}      color="gold" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-amber-600">{stats?.pendingApplications}</p>
          <p className="text-sm text-gray-500 mt-1">Pending Applications</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{stats?.scheduledInterviews}</p>
          <p className="text-sm text-gray-500 mt-1">Scheduled Interviews</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">{stats?.placementRate}%</p>
          <p className="text-sm text-gray-500 mt-1">Placement Rate</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Interviews */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Today's Interviews</h3>
            <Link to="/admin/interviews" className="text-xs text-gold-600 font-medium">View all →</Link>
          </div>
          {todayInterviews?.length ? (
            <div className="space-y-3">
              {todayInterviews.map(iv => (
                <div key={iv._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{iv.student?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{iv.job?.title} · {iv.company?.companyProfile?.companyName}</p>
                    <p className="text-xs text-amber-600">{dayjs(iv.scheduledAt).format('h:mm A')} · {iv.roundName}</p>
                  </div>
                  <span className={`badge ${iv.format === 'virtual' ? 'badge-blue' : 'badge-amber'} flex-shrink-0`}>{iv.format}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <div className="text-center">
                <ClockIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No interviews scheduled today</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Drives */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Placement Drives</h3>
            <Link to="/admin/drives" className="text-xs text-gold-600 font-medium">Manage →</Link>
          </div>
          {recentDrives?.length ? (
            <div className="space-y-3">
              {recentDrives.map(drive => (
                <div key={drive._id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{drive.title}</p>
                    <StatusBadge status={drive.status} />
                  </div>
                  <p className="text-xs text-gray-400">
                    {dayjs(drive.startDate).format('DD MMM')} – {dayjs(drive.endDate).format('DD MMM YYYY')} ·{' '}
                    {drive.companies?.length || 0} companies · {drive.stats?.totalRegistered || 0} students
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No drives created yet</div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Manage Students',  to: '/admin/students',  icon: AcademicCapIcon,    color: 'blue' },
          { label: 'Manage Companies', to: '/admin/companies', icon: BuildingOffice2Icon, color: 'purple' },
          { label: 'Create Drive',     to: '/admin/drives',    icon: CalendarDaysIcon,   color: 'amber' },
          { label: 'View Reports',     to: '/admin/reports',   icon: BriefcaseIcon,      color: 'green' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="card hover:shadow-card-hover transition-all text-center group">
            <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center
              ${item.color === 'blue'   ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' :
                item.color === 'purple' ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-200' :
                item.color === 'amber'  ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-200' :
                                          'bg-green-100 text-green-600 group-hover:bg-green-200'} transition-colors`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
