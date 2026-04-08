import { useEffect, useState } from 'react'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState, Avatar } from '../../components/common/UI'
import dayjs from 'dayjs'

export default function AdminInterviews() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('')
  const [search, setSearch]         = useState('')

  useEffect(() => {
    const params = filter ? `?status=${filter}` : ''
    api.get(`/interviews/all${params}`).then(r => { setInterviews(r.data.interviews); setLoading(false) })
  }, [filter])

  const filtered = search
    ? interviews.filter(iv =>
        iv.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        iv.company?.companyProfile?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
        iv.job?.title?.toLowerCase().includes(search.toLowerCase())
      )
    : interviews

  const groupedByDate = filtered.reduce((acc, iv) => {
    const date = dayjs(iv.scheduledAt).format('YYYY-MM-DD')
    if (!acc[date]) acc[date] = []
    acc[date].push(iv)
    return acc
  }, {})

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">All Interviews</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} interviews</p>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input w-48" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input w-36">
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CalendarDaysIcon} title="No interviews found" description="Interviews scheduled by companies appear here" />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, ivs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-500">
                  {dayjs(date).isSame(dayjs(), 'day') ? '🔴 Today' : dayjs(date).isSame(dayjs().add(1, 'day'), 'day') ? '🟡 Tomorrow' : dayjs(date).format('dddd, DD MMMM YYYY')}
                </h3>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">{ivs.length} interviews</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="table-th">Time</th>
                        <th className="table-th">Candidate</th>
                        <th className="table-th">Company</th>
                        <th className="table-th">Position</th>
                        <th className="table-th">Round</th>
                        <th className="table-th">Format</th>
                        <th className="table-th">Status</th>
                        <th className="table-th">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ivs.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)).map(iv => (
                        <tr key={iv._id} className="table-row">
                          <td className="table-td font-mono text-sm text-gray-600">{dayjs(iv.scheduledAt).format('h:mm A')}</td>
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <Avatar name={iv.student?.name} size="sm" />
                              <div>
                                <p className="font-medium text-sm text-gray-900">{iv.student?.name}</p>
                                <p className="text-xs text-gray-400">{iv.student?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="table-td">
                            <p className="text-sm text-gray-700">{iv.company?.companyProfile?.companyName || iv.company?.name}</p>
                          </td>
                          <td className="table-td">
                            <p className="text-sm text-gray-700">{iv.job?.title}</p>
                          </td>
                          <td className="table-td">
                            <p className="text-sm text-gray-600">R{iv.round}: {iv.roundName}</p>
                          </td>
                          <td className="table-td">
                            <span className={`badge ${iv.format === 'virtual' ? 'badge-blue' : 'badge-amber'}`}>{iv.format}</span>
                          </td>
                          <td className="table-td"><StatusBadge status={iv.status} /></td>
                          <td className="table-td">
                            {iv.feedback?.result && iv.feedback.result !== 'pending' ? (
                              <span className={`badge ${iv.feedback.result === 'pass' ? 'badge-green' : iv.feedback.result === 'fail' ? 'badge-red' : 'badge-amber'}`}>
                                {iv.feedback.result}
                              </span>
                            ) : <span className="text-gray-300 text-sm">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
