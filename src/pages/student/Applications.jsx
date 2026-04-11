import { useEffect, useState } from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState, Modal } from '../../components/common/UI'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

export default function StudentApplications() {
  const [apps, setApps]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [statusFilter, setFilter] = useState('')
  const [detail, setDetail]     = useState(null)

  const fetchApps = async () => {
    setLoading(true)
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const { data } = await api.get(`/applications/my${params}`)
      setApps(data.applications)
    } catch { toast.error('Failed to load applications') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchApps() }, [statusFilter])

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return
    try {
      await api.patch(`/applications/${id}/withdraw`)
      toast.success('Application withdrawn')
      fetchApps()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleAcceptOffer = async (id) => {
    if (!confirm('Accept this offer? This action cannot be undone.')) return
    try {
      await api.patch(`/applications/${id}/accept-offer`)
      toast.success('🎉 Offer accepted! Congratulations!')
      fetchApps()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const statuses = ['submitted','reviewed','shortlisted','interview_scheduled','offered','rejected']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{apps.length} total applications</p>
        </div>
        <select value={statusFilter} onChange={e => setFilter(e.target.value)} className="input w-44">
          <option value="">All statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : apps.length === 0 ? (
        <EmptyState icon={DocumentTextIcon} title="No applications yet" description="Browse jobs and apply to get started" />
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app._id} className="card hover:shadow-card-hover transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {app.company?.logoUrl
                    ? <img src={app.company?.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                    : <DocumentTextIcon className="w-6 h-6 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.job?.title}</h3>
                      <p className="text-sm text-gray-500">{app.company?.companyName || app.company?.name}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                    <span>Applied {dayjs(app.createdAt).format('DD MMM YYYY')}</span>
                    {app.job?.type && <span className="capitalize">{app.job.type}</span>}
                    {app.job?.package && <span>₹{app.job.package} LPA</span>}
                    {app.offeredPackage && <span className="text-green-600 font-medium">Offered: ₹{app.offeredPackage} LPA</span>}
                  </div>
                  {app.companyFeedback && (
                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      💬 {app.companyFeedback}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                <button onClick={() => setDetail(app)} className="btn-ghost text-sm py-1.5">View Details</button>
                {app.status === 'offered' && (
                  <button onClick={() => handleAcceptOffer(app._id)} className="btn-primary text-sm py-1.5 px-4">Accept Offer 🎉</button>
                )}
                {['submitted','reviewed'].includes(app.status) && (
                  <button onClick={() => handleWithdraw(app._id)} className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors ml-auto">Withdraw</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Application Details" size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-400">Position</p><p className="font-medium">{detail.job?.title}</p></div>
              <div><p className="text-gray-400">Company</p><p className="font-medium">{detail.company?.companyName || detail.company?.name}</p></div>
              <div><p className="text-gray-400">Type</p><p className="font-medium capitalize">{detail.job?.type}</p></div>
              <div><p className="text-gray-400">Status</p><StatusBadge status={detail.status} /></div>
            </div>

            {detail.coverLetter && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{detail.coverLetter}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Application Timeline</p>
              <div className="space-y-2">
                {detail.timeline?.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700 capitalize">{t.status?.replace(/_/g, ' ')}</p>
                      {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
                      <p className="text-xs text-gray-300">{dayjs(t.updatedAt).format('DD MMM YYYY, h:mm A')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
