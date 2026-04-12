const BASE_URL = import.meta.env.VITE_API_URL
  || 'https://placement-backend-wd6x.onrender.com/api'

export function openResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  const token = localStorage.getItem('token')
  if (!token) return

  const params = new URLSearchParams({ token })
  if (studentId) params.set('studentId', studentId)

  const href = `${BASE_URL}/students/resume/view?${params.toString()}`

  // Defer DOM work to next frame — keeps click handler under 50ms
  requestAnimationFrame(() => {
    const a = document.createElement('a')
    a.href = href
    a.target = '_blank'
    a.rel = 'noreferrer'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => document.body.removeChild(a), 100)
  })
}