// Student Profile Page
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../../components/common/UI'

export function StudentProfile() {
  const { user, refreshUser } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const sp = user?.studentProfile

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: user?.name,
      phone: sp?.phone,
      address: sp?.address,
      cgpa: sp?.cgpa,
      tenthPercentage: sp?.tenthPercentage,
      twelfthPercentage: sp?.twelfthPercentage,
      linkedIn: sp?.linkedIn,
      github: sp?.github,
      portfolio: sp?.portfolio,
      skills: sp?.skills?.join(', '),
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: sp?.phone,
        address: sp?.address,
        cgpa: sp?.cgpa,
        tenthPercentage: sp?.tenthPercentage,
        twelfthPercentage: sp?.twelfthPercentage,
        linkedIn: sp?.linkedIn,
        github: sp?.github,
        portfolio: sp?.portfolio,
        skills: sp?.skills?.join(', '),
      })
    }
  }, [user])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await api.patch('/students/profile', {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      })
      await refreshUser()
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }
    setUploading(true)
    const formData = new FormData()
    formData.append('resume', file)
    try {
      await api.post('/students/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      await refreshUser()
      toast.success('Resume uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  if (!user) return <LoadingSpinner />

  return (
    <div className="max-w-3xl">
      <h1 className="page-title mb-6">My Profile</h1>

      {/* Resume Section */}
      <div className="card mb-6">
        <h3 className="section-title mb-4">Resume</h3>
        <div className="flex items-center gap-4">
          {sp?.resumeUrl ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Resume uploaded</p>
                <a href={sp.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View resume</a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-amber-600 flex-1">⚠ No resume uploaded. Upload to start applying!</p>
          )}
          <label className="btn-primary cursor-pointer text-sm py-2">
            {uploading ? 'Uploading...' : sp?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <h3 className="section-title">Personal Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input {...register('name')} className="input" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input {...register('phone')} placeholder="+91 XXXXX XXXXX" className="input" />
          </div>
          <div>
            <label className="label">CGPA</label>
            <input {...register('cgpa')} type="number" step="0.01" min="0" max="10" placeholder="8.5" className="input" />
          </div>
          <div>
            <label className="label">10th %</label>
            <input {...register('tenthPercentage')} type="number" step="0.1" placeholder="90.5" className="input" />
          </div>
          <div>
            <label className="label">12th %</label>
            <input {...register('twelfthPercentage')} type="number" step="0.1" placeholder="88.0" className="input" />
          </div>
          <div>
            <label className="label">LinkedIn</label>
            <input {...register('linkedIn')} placeholder="linkedin.com/in/yourname" className="input" />
          </div>
          <div>
            <label className="label">GitHub</label>
            <input {...register('github')} placeholder="github.com/yourname" className="input" />
          </div>
          <div>
            <label className="label">Portfolio</label>
            <input {...register('portfolio')} placeholder="yourwebsite.com" className="input" />
          </div>
        </div>

        <div>
          <label className="label">Skills <span className="text-gray-400 font-normal">(comma separated)</span></label>
          <input {...register('skills')} placeholder="React, Node.js, Python, SQL..." className="input" />
        </div>

        <div>
          <label className="label">Address</label>
          <textarea {...register('address')} rows={2} placeholder="Your address..." className="input resize-none" />
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <p className="text-sm text-gray-400">Roll No: {sp?.rollNumber} · {sp?.department} · {sp?.batch}</p>
        </div>
      </form>
    </div>
  )
}

export default StudentProfile
