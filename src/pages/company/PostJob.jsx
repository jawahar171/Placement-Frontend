import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../utils/axios'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['CSE','ECE','EEE','MECH','CIVIL','IT','AIDS','AIML','CSD','MBA']
const BATCHES     = ['2021-2025','2022-2026','2023-2027','2024-2028']

export default function CompanyPostJob() {
  const navigate  = useNavigate()
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills]   = useState([])
  const [selectedDepts, setSelectedDepts] = useState([])
  const [selectedBatches, setSelectedBatches] = useState([])
  const [processSteps, setProcessSteps] = useState(['Resume Screening'])
  const [stepInput, setStepInput] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'full-time', status: 'active', openings: 1 }
  })
  const jobType = watch('type')

  const addSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const s = skillInput.trim()
      if (s && !skills.includes(s)) setSkills(prev => [...prev, s])
      setSkillInput('')
    }
  }
  const removeSkill = (s) => setSkills(prev => prev.filter(x => x !== s))

  const toggleDept = (d) => setSelectedDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  const toggleBatch = (b) => setSelectedBatches(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])

  const addStep = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const s = stepInput.trim()
      if (s && !processSteps.includes(s)) setProcessSteps(prev => [...prev, s])
      setStepInput('')
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/jobs', {
        ...data,
        skills,
        eligibility: {
          minCGPA: parseFloat(data.minCGPA) || 0,
          maxBacklogs: parseInt(data.maxBacklogs) || 0,
          allowedDepartments: selectedDepts,
          allowedBatches: selectedBatches,
          tenthMin: parseFloat(data.tenthMin) || 0,
          twelfthMin: parseFloat(data.twelfthMin) || 0,
        },
        selectionProcess: processSteps,
        package: data.package ? parseFloat(data.package) : undefined,
        stipend: data.stipend ? parseFloat(data.stipend) : undefined,
        openings: parseInt(data.openings) || 1,
      })
      toast.success('Job posted successfully!')
      navigate('/company/jobs')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="page-title">Post a New Job</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to attract the right candidates</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h3 className="section-title">Basic Information</h3>

          <div>
            <label className="label">Job Title <span className="text-red-400">*</span></label>
            <input {...register('title', { required: 'Title is required' })} placeholder="e.g. Software Engineer" className="input" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Job Type <span className="text-red-400">*</span></label>
              <select {...register('type', { required: true })} className="input">
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="label">Number of Openings</label>
              <input {...register('openings')} type="number" min="1" className="input" />
            </div>
            <div>
              <label className="label">Location</label>
              <input {...register('location')} placeholder="Chennai / Remote" className="input" />
            </div>
            <div>
              <label className="label">Remote?</label>
              <select {...register('isRemote')} className="input">
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {jobType !== 'internship' && (
              <div>
                <label className="label">Package (LPA)</label>
                <input {...register('package')} type="number" step="0.5" min="0" placeholder="6.5" className="input" />
              </div>
            )}
            {jobType === 'internship' && (
              <div>
                <label className="label">Stipend (₹/month)</label>
                <input {...register('stipend')} type="number" min="0" placeholder="20000" className="input" />
              </div>
            )}
            <div>
              <label className="label">Bond Period (months)</label>
              <input {...register('bond')} type="number" min="0" placeholder="0 = no bond" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Application Deadline <span className="text-red-400">*</span></label>
            <input {...register('applicationDeadline', { required: 'Deadline is required' })} type="date" className="input" />
            {errors.applicationDeadline && <p className="text-red-500 text-xs mt-1">{errors.applicationDeadline.message}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="card space-y-4">
          <h3 className="section-title">Job Description</h3>
          <div>
            <label className="label">Description <span className="text-red-400">*</span></label>
            <textarea {...register('description', { required: 'Description is required' })} rows={5} placeholder="Describe the role, responsibilities, and what the candidate will work on..." className="input resize-none" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
        </div>

        {/* Skills */}
        <div className="card space-y-4">
          <h3 className="section-title">Required Skills</h3>
          <div>
            <label className="label">Add Skills <span className="text-gray-400 font-normal">(press Enter or comma)</span></label>
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="e.g. React, Node.js, SQL..."
              className="input"
            />
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-ink-100 text-ink-700 rounded-full text-sm font-medium">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Eligibility */}
        <div className="card space-y-4">
          <h3 className="section-title">Eligibility Criteria</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Minimum CGPA</label>
              <input {...register('minCGPA')} type="number" step="0.1" min="0" max="10" placeholder="7.0" className="input" />
            </div>
            <div>
              <label className="label">Max Active Backlogs</label>
              <input {...register('maxBacklogs')} type="number" min="0" placeholder="0" className="input" />
            </div>
            <div>
              <label className="label">Min 10th %</label>
              <input {...register('tenthMin')} type="number" step="0.1" placeholder="60" className="input" />
            </div>
            <div>
              <label className="label">Min 12th %</label>
              <input {...register('twelfthMin')} type="number" step="0.1" placeholder="60" className="input" />
            </div>
          </div>

          <div>
            <label className="label">Allowed Departments <span className="text-gray-400 font-normal">(leave empty for all)</span></label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DEPARTMENTS.map(d => (
                <button
                  key={d} type="button"
                  onClick={() => toggleDept(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${selectedDepts.includes(d) ? 'bg-ink-800 text-gold-400 border-ink-700' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Allowed Batches <span className="text-gray-400 font-normal">(leave empty for all)</span></label>
            <div className="flex flex-wrap gap-2 mt-2">
              {BATCHES.map(b => (
                <button
                  key={b} type="button"
                  onClick={() => toggleBatch(b)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${selectedBatches.includes(b) ? 'bg-ink-800 text-gold-400 border-ink-700' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selection Process */}
        <div className="card space-y-4">
          <h3 className="section-title">Selection Process</h3>
          <div>
            <label className="label">Add Steps <span className="text-gray-400 font-normal">(press Enter)</span></label>
            <input
              value={stepInput}
              onChange={e => setStepInput(e.target.value)}
              onKeyDown={addStep}
              placeholder="e.g. Aptitude Test, Group Discussion..."
              className="input"
            />
          </div>
          <div className="space-y-2">
            {processSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl">
                <span className="w-6 h-6 bg-ink-800 text-gold-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-700">{step}</span>
                {processSteps.length > 1 && (
                  <button type="button" onClick={() => setProcessSteps(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">×</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pb-4">
          <button type="button" onClick={() => navigate('/company/jobs')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  )
}
