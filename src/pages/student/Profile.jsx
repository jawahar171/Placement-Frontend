// Student Profile Page
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/axios'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '../../components/common/UI'
import { downloadResume } from '../../utils/resumeUtils'

export function StudentProfile() {
  const { user, refreshUser } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  // Fields are flat on user object

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      address: user?.address,
      cgpa: user?.cgpa,
      tenthPercentage: user?.tenthPercentage,
      twelfthPercentage: user?.twelfthPercentage,
      linkedIn: user?.linkedin,
      github: user?.github,
      portfolio: user?.portfolio,
      skills: user?.skills?.join(', '),
    }
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user?.phone,
        address: user?.address,
        cgpa: user?.cgpa,
        tenthPercentage: user?.tenthPercentage,
        twelfthPercentage: user?.twelfthPercentage,
        linkedIn: user?.linkedin,
        github: user?.github,
        portfolio: user?.portfolio,
        skills: user?.skills?.join(', '),
      })
    }
  }, [user])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await api.patch('/students/profile', {
        ...data,
        linkedin: data.linkedIn,   // form field is linkedIn, model field is linkedin
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
          {user?.resumeUrl ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Resume uploaded</p>
                <button onClick={() => downloadResume(user?.resumeUrl)} className="text-xs text-blue-600 hover:underline">Download Resume</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-amber-600 flex-1">⚠ No resume uploaded. Upload to start applying!</p>
          )}
          <label className="btn-primary cursor-pointer text-sm py-2">
            {uploading ? 'Uploading...' : user?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <h3 className="section-title">Personal Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name <span className="text-red-400">*</span></label>
            <input {...register('name', { required: 'Name is required' })} className="input" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input {...register('phone', {
              pattern: { value: /^[+\d\s\-()]{7,15}$/, message: 'Enter a valid phone number' }
            })} placeholder="+91 XXXXX XXXXX" className="input" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="label">CGPA</label>
            <input {...register('cgpa', {
              min: { value: 0, message: 'Min 0' },
              max: { value: 10, message: 'Max 10' }
            })} type="number" step="0.01" min="0" max="10" placeholder="8.5" className="input" />
            {errors.cgpa && <p className="text-red-500 text-xs mt-1">{errors.cgpa.message}</p>}
          </div>
          <div>
            <label className="label">10th %</label>
            <input {...register('tenthPercentage', {
              min: { value: 0, message: 'Min 0' },
              max: { value: 100, message: 'Max 100' }
            })} type="number" step="0.1" placeholder="90.5" className="input" />
            {errors.tenthPercentage && <p className="text-red-500 text-xs mt-1">{errors.tenthPercentage.message}</p>}
          </div>
          <div>
            <label className="label">12th %</label>
            <input {...register('twelfthPercentage', {
              min: { value: 0, message: 'Min 0' },
              max: { value: 100, message: 'Max 100' }
            })} type="number" step="0.1" placeholder="88.0" className="input" />
            {errors.twelfthPercentage && <p className="text-red-500 text-xs mt-1">{errors.twelfthPercentage.message}</p>}
          </div>
          <div>
            <label className="label">LinkedIn</label>
            <input {...register('linkedIn', {
              pattern: { value: /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/, message: 'Enter a valid LinkedIn URL' }
            })} placeholder="linkedin.com/in/yourname" className="input" />
            {errors.linkedIn && <p className="text-red-500 text-xs mt-1">{errors.linkedIn.message}</p>}
          </div>
          <div>
            <label className="label">GitHub</label>
            <input {...register('github', {
              pattern: { value: /^(https?:\/\/)?(www\.)?github\.com\/.+/, message: 'Enter a valid GitHub URL' }
            })} placeholder="github.com/yourname" className="input" />
            {errors.github && <p className="text-red-500 text-xs mt-1">{errors.github.message}</p>}
          </div>
          <div>
            <label className="label">Portfolio</label>
            <input {...register('portfolio', {
              pattern: { value: /^(https?:\/\/).+/, message: 'URL must start with http:// or https://' }
            })} placeholder="https://yourwebsite.com" className="input" />
            {errors.portfolio && <p className="text-red-500 text-xs mt-1">{errors.portfolio.message}</p>}
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
          <p className="text-sm text-gray-400">Roll No: {user?.rollNumber} · {user?.department} · {user?.batch}</p>
        </div>
      </form>
    </div>
  )
}

export default StudentProfile
