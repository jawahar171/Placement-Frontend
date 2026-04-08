import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { LoadingSpinner } from '../../components/common/UI'
import toast from 'react-hot-toast'

const COLORS = ['#e2a800','#3b82f6','#10b981','#ef4444','#8b5cf6','#f59e0b','#06b6d4']

const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function StatCard({ label, value, sub, color = 'text-ink-900' }) {
  return (
    <div className="card text-center">
      <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-300 mt-0.5">{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function AdminReports() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    api.get('/reports/stats').then(r => { setStats(r.data); setLoading(false) })
      .catch(() => { toast.error('Failed to load reports'); setLoading(false) })
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/reports/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href    = url
      a.download = `placement-report-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Report exported!')
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  if (loading) return <LoadingSpinner className="h-96" />
  if (!stats)  return <p className="text-center text-gray-500 py-16">No data available</p>

  const { overview, packageStats, deptWise, monthlyOffers, packageDist, topCompanies, appStatusBreakdown } = stats

  const deptChartData = deptWise
    .filter(d => d._id)
    .map(d => ({ name: d._id, total: d.total, placed: d.placed }))
    .sort((a, b) => b.placed - a.placed)

  const monthlyData = monthlyOffers.map(m => ({
    name: `${MONTH_NAMES[m._id.month]} ${m._id.year}`,
    offers: m.count
  }))

  const statusData = appStatusBreakdown
    .filter(s => s._id && s.count > 0)
    .map(s => ({ name: s._id.replace(/_/g, ' '), value: s.count }))

  const pkgBucketLabels = { 0: '<3', 3: '3-5', 5: '5-8', 8: '8-12', 12: '12-20', 20: '20+' }
  const pkgData = packageDist
    .filter(p => p._id !== 'Other')
    .map(p => ({ name: `${pkgBucketLabels[p._id] || p._id} LPA`, count: p.count }))

  const placementDonut = [
    { name: 'Placed',   value: overview.placed },
    { name: 'Unplaced', value: overview.notPlaced },
    { name: 'Opted Out', value: overview.optedOut },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Placement Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Analytics & insights for the current placement season</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2">
          <ArrowDownTrayIcon className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students"    value={overview.totalStudents}   color="text-ink-900" />
        <StatCard label="Students Placed"   value={overview.placed}          color="text-green-600" sub={`${overview.placementRate}% placement rate`} />
        <StatCard label="Offers Made"       value={overview.totalOffers}     color="text-blue-600" />
        <StatCard label="Interviews Held"   value={overview.totalInterviews} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Highest Package"  value={packageStats?.highest ? `${packageStats.highest} LPA` : '—'} color="text-gold-600" />
        <StatCard label="Average Package"  value={packageStats?.average ? `${parseFloat(packageStats.average).toFixed(1)} LPA` : '—'} color="text-ink-900" />
        <StatCard label="Active Companies" value={overview.totalCompanies}   color="text-blue-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Placement Donut */}
        <div className="card">
          <h3 className="section-title mb-4">Placement Status Breakdown</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={placementDonut} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {placementDonut.map((_, i) => <Cell key={i} fill={['#10b981','#94a3b8','#f59e0b'][i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {placementDonut.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: ['#10b981','#94a3b8','#f59e0b'][i] }} />
                  <span className="text-sm text-gray-600">{d.name}</span>
                  <span className="font-semibold text-gray-900 ml-auto">{d.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-2xl font-bold text-gold-600">{overview.placementRate}%</p>
                <p className="text-xs text-gray-400">Placement rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Offers Trend */}
        <div className="card">
          <h3 className="section-title mb-4">Monthly Offer Trend</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="offers" stroke="#e2a800" strokeWidth={2.5} dot={{ fill: '#e2a800', r: 4 }} name="Offers" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No offer data yet</p>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department-wise */}
        <div className="card">
          <h3 className="section-title mb-4">Department-wise Placements</h3>
          {deptChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name" width={40} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total"  fill="#e2e8f0" name="Total"  radius={[0, 4, 4, 0]} />
                <Bar dataKey="placed" fill="#10b981" name="Placed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No placement data yet</p>}
        </div>

        {/* Package Distribution */}
        <div className="card">
          <h3 className="section-title mb-4">Package Distribution</h3>
          {pkgData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={pkgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                  {pkgData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No package data yet</p>}
        </div>
      </div>

      {/* Application Status + Top Companies */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title mb-4">Application Status Breakdown</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-16">No application data yet</p>}
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Top Hiring Companies</h3>
          {topCompanies.length > 0 ? (
            <div className="space-y-3">
              {topCompanies.map((item, i) => (
                <div key={item._id} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.company?.companyProfile?.companyName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-500 rounded-full" style={{ width: `${(item.hires / topCompanies[0].hires) * 100}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 flex-shrink-0">{item.hires} hires</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-16">No hiring data yet</p>}
        </div>
      </div>
    </div>
  )
}
