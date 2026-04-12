const BASE_URL = import.meta.env.VITE_API_URL
  || 'https://placement-backend-wd6x.onrender.com/api'

export function openResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  const token = localStorage.getItem('token')
  if (!token) return

  // Build the redirect URL — plain query params, no async needed
  const params = new URLSearchParams({ token })
  if (studentId) params.set('studentId', studentId)

  const redirectUrl = `${BASE_URL}/students/resume/view?${params.toString()}`

  // Plain <a> click — true browser navigation, never blocked
  const a = document.createElement('a')
  a.href = redirectUrl
  a.target = '_blank'
  a.rel = 'noreferrer'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => document.body.removeChild(a), 100)
}