import api from './axios'
import toast from 'react-hot-toast'

/**
 * Downloads a resume by fetching it through our backend proxy.
 *
 * The Cloudinary account has strict access control — direct browser fetches
 * return 401 even for /image/upload/ URLs. Our backend uses Cloudinary's
 * Admin API (private_download_url with API credentials) to fetch the file,
 * then streams it back. The browser receives it as a blob and downloads it.
 *
 * @param {string} resumeUrl  - stored resume URL (used to check if resume exists)
 * @param {string} [studentId] - pass when admin/company viewing another student
 */
export async function downloadResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  const toastId = toast.loading('Downloading resume...')
  try {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({ token })
    if (studentId) params.set('studentId', studentId)

    const BASE = import.meta.env.VITE_API_URL
      || 'https://placement-backend-wd6x.onrender.com/api'

    // Fetch through our backend proxy — returns the file bytes directly
    const response = await fetch(
      `${BASE}/students/resume/view?${params.toString()}`
    )

    if (!response.ok) throw new Error(`Server error: ${response.status}`)

    const blob = await response.blob()
    const url  = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href     = url
    a.download = 'resume.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.dismiss(toastId)
    toast.success('Resume downloaded!')
  } catch (err) {
    toast.dismiss(toastId)
    console.error('downloadResume error:', err.message)
    toast.error('Download failed. Please try again.')
  }
}   