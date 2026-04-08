import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { StatusBadge, LoadingSpinner, EmptyState, Modal } from '../../components/common/UI'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

export default function CompanyJobs() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [editJob, setEditJob] = useState(null)
  const [saving, setSaving]   = useState(false)

  const fetchJobs = () => {
    api.get('/jobs/company').then(r => { setJobs(r.data); setLoading(false) })
  }

  useEffect(() => { fetchJobs() }, [])

  const handleStatusChange = async (jobId, status) => {
    try {
      await api.patch(`/jobs/${jobId}`, { status })
      toast.success(`Job ${status}`)
      fetchJobs()
    } catch { toast.error('Failed to update status') }
  }

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job? All applications will be affected.')) return
    try {
      await api.delete(`/jobs/${jobId}`)
      toast.success('Job deleted')
      fetchJobs()
    } catch { toast.error('Failed to delete') }
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch(`/jobs/${editJob._id}`, editJob)
      toast.success('Job updated')
      setEditJob(null)
      fetchJobs()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">My Job Listings</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} listings</p>
        </div>
        <Link to="/company/post-job" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Post Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={BriefcaseIcon}
          title="No jobs posted yet"
          description="Post your first job to start receiving applications"
          action={<Link to="/company/post-job" className="btn-primary">Post a Job</Link>}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job._id} className="card hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900 text-base">{job.title}</h3>
                    <StatusBadge status={job.status} />
                    <span className={`badge ${job.type === 'full-time' ? 'badge-blue' : 'badge-purple'}`}>{job.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    {job.package    && <span>💰 {job.package} LPA</span>}
                    {job.stipend    && <span>💰 ₹{job.stipend}/mo</span>}
                    {job.location   && <span>📍 {job.location}</span>}
                    <span>👥 {job.applicationCount || 0} applications</span>
                    <span>🎯 {job.offerCount || 0} offers</span>
                    <span className={`${dayjs(job.applicationDeadline).isBefore(dayjs()) ? 'text-red-500' : 'text-gray-400'}`}>
                      Deadline: {dayjs(job.applicationDeadline).format('DD MMM YYYY')}
                    </span>
                  </div>
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.slice(0, 5).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setEditJob({ ...job })} className="btn-ghost p-2 rounded-lg">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  {job.status === 'active' ? (
                    <button onClick={() => handleStatusChange(job._id, 'closed')} className="btn-secondary text-sm py-1.5 px-3">Close</button>
                  ) : (
                    <button onClick={() => handleStatusChange(job._id, 'active')} className="btn-primary text-sm py-1.5 px-3">Reopen</button>
                  )}
                  <button onClick={() => handleDelete(job._id)} className="btn-ghost p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Edit Modal */}
      <Modal open={!!editJob} onClose={() => setEditJob(null)} title="Quick Edit Job">
        {editJob && (
          <form onSubmit={handleEditSave} className="space-y-4">
            <div>
              <label className="label">Job Title</label>
              <input value={editJob.title} onChange={e => setEditJob(p => ({ ...p, title: e.target.value }))} className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Package (LPA)</label>
                <input type="number" value={editJob.package || ''} onChange={e => setEditJob(p => ({ ...p, package: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Openings</label>
                <input type="number" value={editJob.openings || 1} onChange={e => setEditJob(p => ({ ...p, openings: e.target.value }))} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input type="date" value={editJob.applicationDeadline?.slice(0, 10) || ''} onChange={e => setEditJob(p => ({ ...p, applicationDeadline: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={editJob.status} onChange={e => setEditJob(p => ({ ...p, status: e.target.value }))} className="input">
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditJob(null)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
