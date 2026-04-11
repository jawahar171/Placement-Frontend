import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/axios'
import toast from 'react-hot-toast'

const INDUSTRIES = ['Technology','Finance','Consulting','Healthcare','Manufacturing','E-commerce','Education','Telecom','Automotive','Other']
const EMPLOYEE_COUNTS = ['1-50','51-200','201-500','501-1000','1001-5000','5000+']

export default function CompanyProfile() {
  const { user, refreshUser } = useAuth()
  const [saving, setSaving]   = useState(false)
  // Fields are flat on user object

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (user) {
      reset({
        name:          user.name,
        companyName:   user?.companyName,
        industry:      user?.industry,
        website:       user?.website,
        description:   user?.description,
        hrName:        user?.hrName,
        hrPhone:       user?.hrPhone,
        address:       user?.address,
        employeeCount: user?.employeeCount,
        foundedYear:   user?.foundedYear,
        linkedin:      user?.linkedin,
        twitter:       user?.twitter,
      })
    }
  }, [user])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await api.patch('/companies/profile', {
        name:          data.name,
        companyName:   data.companyName,
        industry:      data.industry,
        website:       data.website,
        description:   data.description,
        hrName:        data.hrName,
        hrPhone:       data.hrPhone,
        address:       data.address,
        employeeCount: data.employeeCount,
        foundedYear:   data.foundedYear,
        linkedin: data.linkedin,
        twitter:  data.twitter,
      })
      await refreshUser()
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="page-title mb-6">Company Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Info */}
        <div className="card space-y-4">
          <h3 className="section-title">Company Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Company Name <span className="text-red-400">*</span></label>
              <input {...register('companyName', { required: 'Company name is required' })} className="input" />
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className="label">Industry <span className="text-red-400">*</span></label>
              <select {...register('industry', { required: 'Industry is required' })} className="input">
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
            </div>
            <div>
              <label className="label">Website</label>
              <input {...register('website', {
                pattern: { value: /^(https?:\/\/).+/, message: 'URL must start with https://' }
              })} placeholder="https://yourcompany.com" className="input" />
              {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
            </div>
            <div>
              <label className="label">Founded Year</label>
              <input {...register('foundedYear', {
                min: { value: 1800, message: 'Enter a valid year' },
                max: { value: new Date().getFullYear(), message: 'Cannot be in the future' }
              })} type="number" placeholder="2010" className="input" />
              {errors.foundedYear && <p className="text-red-500 text-xs mt-1">{errors.foundedYear.message}</p>}
            </div>
            <div>
              <label className="label">Employee Count</label>
              <select {...register('employeeCount')} className="input">
                <option value="">Select range</option>
                {EMPLOYEE_COUNTS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="label">HR Name</label>
              <input {...register('hrName')} className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">HR Phone</label>
              <input {...register('hrPhone', {
                pattern: { value: /^[+\d\s\-()]{7,15}$/, message: 'Enter a valid phone number' }
              })} placeholder="+91 XXXXX XXXXX" className="input" />
              {errors.hrPhone && <p className="text-red-500 text-xs mt-1">{errors.hrPhone.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Company Description</label>
            <textarea {...register('description')} rows={4} placeholder="Tell students about your company, culture, and what makes it a great place to work..." className="input resize-none" />
          </div>
          <div>
            <label className="label">Office Address</label>
            <textarea {...register('address')} rows={2} className="input resize-none" />
          </div>
        </div>

        {/* Social Links */}
        <div className="card space-y-4">
          <h3 className="section-title">Social Links</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">LinkedIn</label>
              <input {...register('linkedin', {
                pattern: { value: /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/, message: 'Enter a valid LinkedIn URL' }
              })} placeholder="linkedin.com/company/yourco" className="input" />
              {errors.linkedin && <p className="text-red-500 text-xs mt-1">{errors.linkedin.message}</p>}
            </div>
            <div>
              <label className="label">Twitter / X</label>
              <input {...register('twitter', {
                pattern: { value: /^(https?:\/\/)?(www\.)?(twitter|x)\.com\/.+/, message: 'Enter a valid Twitter/X URL' }
              })} placeholder="twitter.com/yourco" className="input" />
              {errors.twitter && <p className="text-red-500 text-xs mt-1">{errors.twitter.message}</p>}
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="card space-y-4">
          <h3 className="section-title">Account</h3>
          <div>
            <label className="label">Contact Name</label>
            <input {...register('name')} className="input" />
          </div>
          <p className="text-sm text-gray-400">Email: {user?.email} <span className="text-gray-300">(cannot be changed)</span></p>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
