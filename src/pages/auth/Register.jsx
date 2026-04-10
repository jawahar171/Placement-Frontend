import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('student')
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await authRegister({ ...data, role })
      toast.success('Account created successfully!')
      navigate(`/${user.role}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gold-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-ink-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-semibold text-white">Create Account</h1>
          <p className="text-gray-400 mt-1 text-sm">Join the Placement Portal</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* Role selector */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {['student', 'company'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize ${role === r ? 'bg-gold-500 text-ink-900' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label text-gray-300">Full Name</label>
              <input {...register('name', { required: 'Name is required' })} placeholder="John Doe" className="input bg-white/10 border-white/20 text-white placeholder-gray-500" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label text-gray-300">Email</label>
              <input {...register('email', { required: 'Email is required' })} type="email" placeholder="you@example.com" className="input bg-white/10 border-white/20 text-white placeholder-gray-500" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {role === 'student' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-gray-300">Roll Number</label>
                  <input {...register('rollNumber')} placeholder="21CS001" className="input bg-white/10 border-white/20 text-white placeholder-gray-500" />
                </div>
                <div>
                  <label className="label text-gray-300">Department</label>
                  <select {...register('department')} className="input bg-white/10 border-white/20 text-white">
                    <option value="" className="bg-ink-800">Select dept</option>
                    {['CSE','ECE','EEE','MECH','CIVIL','IT','AIDS','AIML','CSD'].map(d => (
                      <option key={d} value={d} className="bg-ink-800">{d}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label text-gray-300">Batch</label>
                  <input {...register('batch')} placeholder="2021-2025" className="input bg-white/10 border-white/20 text-white placeholder-gray-500" />
                </div>
              </div>
            )}

            {role === 'company' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-gray-300">Company Name</label>
                  <input {...register('companyName')} placeholder="Acme Corp" className="input bg-white/10 border-white/20 text-white placeholder-gray-500" />
                </div>
                <div>
                  <label className="label text-gray-300">Industry</label>
                  <select {...register('industry')} className="input bg-white/10 border-white/20 text-white">
                    <option value="" className="bg-ink-800">Select</option>
                    {['Technology','Finance','Consulting','Healthcare','Manufacturing','E-commerce','Other'].map(i => (
                      <option key={i} value={i} className="bg-ink-800">{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="label text-gray-300">Password</label>
              <input {...register('password', { required: true, minLength: { value: 6, message: 'Min 6 characters' } })} type="password" autoComplete="new-password" placeholder="••••••••" className="input bg-white/10 border-white/20 text-white placeholder-gray-500" />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label text-gray-300">Confirm Password</label>
              <input {...register('confirmPassword', { validate: v => v === password || 'Passwords do not match' })} type="password" autoComplete="new-password" placeholder="••••••••" className="input bg-white/10 border-white/20 text-white placeholder-gray-500" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
