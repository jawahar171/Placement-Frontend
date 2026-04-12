import { useEffect, useState } from 'react'
import { DocumentTextIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState, Modal, Avatar } from '../../components/common/UI'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const STATUS_ACTIONS = {
  submitted:           [{ label: 'Mark Reviewed', next: 'reviewed', cls: 'btn-secondary' }, { label: 'Shortlist', next: 'shortlisted', cls: 'btn-primary' }, { label: 'Reject', next: 'rejected', cls: 'btn-danger' }],
  reviewed:            [{ label: 'Shortlist', next: 'shortlisted', cls: 'btn-primary' }, { label: 'Reject', next: 'rejected', cls: 'btn-danger' }],
  shortlisted:         [{ label: 'Schedule Interview', next: 'interview_scheduled', cls: 'btn-primary' }, { label: 'Reject', next: 'rejected', cls: 'btn-danger' }],
  interview_completed: [{ label: 'Make Offer', next: 'offered', cls: 'btn-primary' }, { label: 'Reject', next: 'rejected', cls: 'btn-danger' }],
}

export default function CompanyApplications() {
  const [apps, setApps]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [statusFilter, setFilter] = useState('')
  const [search, setSearch]       = useState('')
  const [detail, setDetail]       = useState(null)
  const [offerModal, setOfferModal] = useState(null)
  const [offerData, setOfferData]   = useState({ offeredPackage: '', offeredRole: '', offerDeadline: '', feedback: '' })

  const fetchApps = () => {
    const params = new URLSearchParams()
    if (statusFilter) params.append('status', statusFilter)
    if (search) params.append('search', search)
    api.get(`/applications/company?${params}`).then(r => { setApps(r.data.applications); setLoading(false) })
  }

  useEffect(() => { fetchApps() }, [statusFilter, search])

  const updateStatus = async (appId, status, extra = {}) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status, ...extra })
      toast.success(`Status updated to ${status.replace(/_/g, ' ')}`)
      fetchApps()
      setDetail(null)
      setOfferModal(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const toggleStar = async (appId) => {
    try {
      await api.patch(`/applications/${appId}/star`)
      fetchApps()
    } catch { toast.error('Failed') }
  }

  const handleOffer = async () => {
    if (!offerData.offeredPackage || !offerData.offerDeadline) {
      toast.error('Package and deadline are required')
      return
    }
    await updateStatus(offerModal._id, 'offered', {
      offeredPackage: parseFloat(offerData.offeredPackage),
      offeredRole:    offerData.offeredRole,
      offerDeadline:  offerData.offerDeadline,
      feedback:       offerData.feedback,
    })
  }

  const statuses = ['submitted','reviewed','shortlisted','interview_scheduled','interview_completed','offered','offer_accepted','rejected']

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="page-title">Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{apps.length} total</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates..." className="input flex-1 sm:w-48" />
          <select value={statusFilter} onChange={e => setFilter(e.target.value)} className="input w-40">
            <option value="">All statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
        </div>
      </div>

      {apps.length === 0 ? (
        <EmptyState icon={DocumentTextIcon} title="No applications" description="Applications will appear here as students apply to your jobs" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Candidate</th>
                  <th className="table-th">Position</th>
                  <th className="table-th">CGPA</th>
                  <th className="table-th">Applied</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apps.map(app => (
                  <tr key={app._id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <Avatar name={app.student?.name} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900 text-sm">{app.student?.name}</p>
                            <button onClick={() => toggleStar(app._id)} className="text-gray-300 hover:text-amber-400 transition-colors">
                              {app.isStarred ? <StarSolid className="w-4 h-4 text-amber-400" /> : <StarOutline className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-400">{app.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <p className="text-sm font-medium text-gray-700">{app.job?.title}</p>
                      <p className="text-xs text-gray-400 capitalize">{app.job?.type}</p>
                    </td>
                    <td className="table-td">
                      <span className={`font-mono text-sm font-medium ${app.student?.cgpa >= 8 ? 'text-green-600' : app.student?.cgpa >= 6 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {app.student?.cgpa || '—'}
                      </span>
                    </td>
                    <td className="table-td text-gray-400 text-xs">{dayjs(app.createdAt).format('DD MMM YYYY')}</td>
                    <td className="table-td"><StatusBadge status={app.status} /></td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetail(app)} className="btn-ghost text-xs py-1 px-2">View</button>
                        {app.student?.resumeUrl && (
                          <button onClick={() => window.open(app.student?.resumeUrl, '_blank', 'noopener,noreferrer')}
                            className="btn-ghost text-xs py-1 px-2 text-blue-500">Resume</button>
                        )}
                        {STATUS_ACTIONS[app.status]?.map(action => (
                          <button
                            key={action.next}
                            onClick={() => action.next === 'offered' ? setOfferModal(app) : updateStatus(app._id, action.next)}
                            className={`text-xs py-1 px-2 rounded-lg font-medium transition-colors ${action.cls === 'btn-primary' ? 'bg-gold-500 hover:bg-gold-600 text-ink-900' : action.cls === 'btn-danger' ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Application Details" size="lg">
        {detail && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Avatar name={detail.student?.name} size="lg" />
              <div>
                <h3 className="font-semibold text-gray-900">{detail.student?.name}</h3>
                <p className="text-sm text-gray-500">{detail.student?.email}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span>{detail.student?.department}</span>
                  <span>CGPA: <strong>{detail.student?.cgpa}</strong></span>
                  <span>Batch: {detail.student?.batch}</span>
                </div>
              </div>
            </div>

            {detail.student?.skills?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.student?.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {detail.coverLetter && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">{detail.coverLetter}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Timeline</p>
              <div className="space-y-2">
                {detail.timeline?.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gold-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium capitalize">{t.status?.replace(/_/g, ' ')}</p>
                      {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
                      <p className="text-xs text-gray-300">{dayjs(t.updatedAt).format('DD MMM YYYY, h:mm A')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 flex-wrap">
              {detail.student?.resumeUrl && (
                <button onClick={() => window.open(detail.student?.resumeUrl, '_blank', 'noopener,noreferrer')} className="btn-secondary text-sm">View Resume</button>
              )}
              {STATUS_ACTIONS[detail.status]?.map(action => (
                <button key={action.next}
                  onClick={() => action.next === 'offered' ? (setOfferModal(detail), setDetail(null)) : updateStatus(detail._id, action.next)}
                  className={`text-sm py-2 px-4 rounded-xl font-medium transition-colors ${action.cls === 'btn-primary' ? 'bg-gold-500 hover:bg-gold-600 text-ink-900' : action.cls === 'btn-danger' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Offer Modal */}
      <Modal open={!!offerModal} onClose={() => setOfferModal(null)} title="Send Offer Letter">
        <div className="space-y-4">
          <div className="p-3 bg-green-50 rounded-xl">
            <p className="text-sm font-medium text-green-800">Sending offer to: {offerModal?.student?.name}</p>
            <p className="text-xs text-green-600">For: {offerModal?.job?.title}</p>
          </div>
          <div>
            <label className="label">Offered Role</label>
            <input value={offerData.offeredRole} onChange={e => setOfferData(p => ({ ...p, offeredRole: e.target.value }))} placeholder="e.g. Software Engineer" className="input" />
          </div>
          <div>
            <label className="label">Package (LPA) <span className="text-red-400">*</span></label>
            <input type="number" step="0.5" value={offerData.offeredPackage} onChange={e => setOfferData(p => ({ ...p, offeredPackage: e.target.value }))} placeholder="6.5" className="input" />
          </div>
          <div>
            <label className="label">Acceptance Deadline <span className="text-red-400">*</span></label>
            <input type="date" value={offerData.offerDeadline} onChange={e => setOfferData(p => ({ ...p, offerDeadline: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Message to Candidate</label>
            <textarea rows={3} value={offerData.feedback} onChange={e => setOfferData(p => ({ ...p, feedback: e.target.value }))} placeholder="Congratulations! We are pleased to offer..." className="input resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setOfferModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleOffer} className="btn-primary flex-1">Send Offer 🎉</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
