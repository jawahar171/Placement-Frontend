import { useEffect, useState } from 'react'
import { BriefcaseIcon, MapPinIcon, CurrencyRupeeIcon, ClockIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import api from '../../utils/axios'
import { LoadingSpinner, EmptyState, Modal } from '../../components/common/UI'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

function JobCard({ job, onApply }) {
  const [checking, setChecking] = useState(false)
  const [eligibility, setEligibility] = useState(null)

  const checkAndApply = async () => {
    setChecking(true)
    try {
      const { data } = await api.get(`/jobs/${job._id}/eligibility`)
      setEligibility(data)
      if (data.eligible) onApply(job)
      else toast.error(`Not eligible: ${data.issues[0]}`)
    } catch { toast.error('Error checking eligibility') }
    finally { setChecking(false) }
  }

  const deadline = dayjs(job.applicationDeadline)
  const daysLeft  = deadline.diff(dayjs(), 'day')
  const isExpired = daysLeft < 0

  return (
    <div className="card hover:shadow-card-hover transition-all duration-200 flex flex-col">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
          {job.company?.companyProfile?.logoUrl
            ? <img src={job.company.companyProfile.logoUrl} alt="" className="w-full h-full object-cover" />
            : <BriefcaseIcon className="w-6 h-6 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.company?.companyProfile?.companyName}</p>
        </div>
        <span className={`badge flex-shrink-0 ${job.type === 'full-time' ? 'badge-blue' : job.type === 'internship' ? 'badge-purple' : 'badge-amber'}`}>
          {job.type}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
        {job.location && <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{job.location}</span>}
        {job.package && <span className="flex items-center gap-1"><CurrencyRupeeIcon className="w-3.5 h-3.5" />{job.package} LPA</span>}
        {job.stipend && <span className="flex items-center gap-1"><CurrencyRupeeIcon className="w-3.5 h-3.5" />₹{job.stipend}/mo</span>}
        {job.eligibility?.minCGPA > 0 && <span>CGPA ≥ {job.eligibility.minCGPA}</span>}
      </div>

      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 4).map(s => (
            <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs">{s}</span>
          ))}
          {job.skills.length > 4 && <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-lg text-xs">+{job.skills.length - 4}</span>}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
        <span className={`flex items-center gap-1 text-xs ${isExpired ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
          <ClockIcon className="w-3.5 h-3.5" />
          {isExpired ? 'Expired' : `${daysLeft} days left`}
        </span>
        <button
          onClick={checkAndApply}
          disabled={isExpired || checking}
          className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40"
        >
          {checking ? 'Checking...' : 'Apply Now'}
        </button>
      </div>
    </div>
  )
}

function ApplyModal({ job, onClose }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [submitting, setSubmitting]   = useState(false)

  const handleApply = async () => {
    setSubmitting(true)
    try {
      await api.post(`/applications/job/${job._id}`, { coverLetter })
      toast.success('Application submitted!')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={!!job} onClose={onClose} title={`Apply for ${job?.title}`}>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-gray-700">{job?.company?.companyProfile?.companyName}</p>
          <p className="text-sm text-gray-500">{job?.type} · {job?.location}</p>
        </div>
        <div>
          <label className="label">Cover Letter <span className="text-gray-400">(optional)</span></label>
          <textarea
            rows={5}
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            placeholder="Briefly explain why you're a good fit for this role..."
            className="input resize-none"
          />
        </div>
        <p className="text-xs text-gray-400">Your saved resume will be attached to this application.</p>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleApply} disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function StudentJobs() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [type, setType]       = useState('')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const [applyJob, setApplyJob] = useState(null)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ search, page, limit: 12 })
      if (type) params.append('type', type)
      const { data } = await api.get(`/jobs?${params}`)
      setJobs(data.jobs)
      setTotal(data.total)
    } catch { toast.error('Failed to load jobs') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [search, type, page])

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Job Listings</h1>
          <p className="text-gray-500 text-sm mt-1">{total} opportunities available</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search jobs..."
            className="input flex-1 sm:w-56"
          />
          <select value={type} onChange={e => { setType(e.target.value); setPage(1) }} className="input w-36">
            <option value="">All types</option>
            <option value="full-time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner className="h-64" /> : (
        <>
          {jobs.length === 0 ? (
            <EmptyState icon={BriefcaseIcon} title="No jobs found" description="Try different search terms or check back later" />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => <JobCard key={job._id} job={job} onApply={setApplyJob} />)}
            </div>
          )}

          {total > 12 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5">← Prev</button>
              <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 12)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)} className="btn-secondary text-sm py-1.5">Next →</button>
            </div>
          )}
        </>
      )}

      <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
    </div>
  )
}
