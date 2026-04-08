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
  const cp = user?.companyProfile

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (user) {
      reset({
        name:          user.name,
        companyName:   cp?.companyName,
        industry:      cp?.industry,
        website:       cp?.website,
        description:   cp?.description,
        hrName:        cp?.hrName,
        hrPhone:       cp?.hrPhone,
        address:       cp?.address,
        employeeCount: cp?.employeeCount,
        foundedYear:   cp?.foundedYear,
        linkedin:      cp?.socialLinks?.linkedin,
        twitter:       cp?.socialLinks?.twitter,
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
        socialLinks: { linkedin: data.linkedin, twitter: data.twitter }
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
              <label className="label">Company Name</label>
              <input {...register('companyName')} className="input" />
            </div>
            <div>
              <label className="label">Industry</label>
              <select {...register('industry')} className="input">
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Website</label>
              <input {...register('website')} placeholder="https://yourcompany.com" className="input" />
            </div>
            <div>
              <label className="label">Founded Year</label>
              <input {...register('foundedYear')} type="number" placeholder="2010" className="input" />
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
              <input {...register('hrPhone')} placeholder="+91 XXXXX XXXXX" className="input" />
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
              <input {...register('linkedin')} placeholder="linkedin.com/company/yourco" className="input" />
            </div>
            <div>
              <label className="label">Twitter / X</label>
              <input {...register('twitter')} placeholder="twitter.com/yourco" className="input" />
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
