import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await login(data.email, data.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(`/${user.role}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-900 via-ink-800 to-ink-700 flex items-center justify-center p-4 sm:p-6">

      <div className="w-full max-w-md animate-in">

        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gold-500 rounded-2xl mb-3 sm:mb-4 shadow-lg">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-ink-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">Placement Portal</h1>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">Career Development & Placement Office</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-5 sm:mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label text-gray-300 text-sm">Email address</label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                autoComplete="email"
                placeholder="you@college.edu"
                className="input bg-white/10 border-white/20 text-white placeholder-gray-500 focus:ring-gold-400 w-full text-sm sm:text-base"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label text-gray-300 text-sm">Password</label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="input bg-white/10 border-white/20 text-white placeholder-gray-500 focus:ring-gold-400 w-full text-sm sm:text-base"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-gray-400 mt-5 sm:mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium">Register here</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-gray-400 font-medium mb-2">Demo credentials:</p>
            <div className="space-y-1 text-xs text-gray-500 font-mono">
              <p>Student: student@demo.com / password123</p>
              <p>Company: company@demo.com / password123</p>
              <p>Admin:&nbsp;&nbsp; admin@demo.com &nbsp;/ password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
