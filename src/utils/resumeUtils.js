import api from './axios'
import toast from 'react-hot-toast'

/**
 * Downloads resume via backend proxy.
 * Uses axios (which sends Authorization: Bearer token header automatically).
 * Backend fetches from Cloudinary using Admin API credentials and streams bytes back.
 *
 * @param {string} resumeUrl   - stored resume URL (to verify resume exists)
 * @param {string} [studentId] - pass when admin/company viewing another student's resume
 */
export async function downloadResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  const toastId = toast.loading('Downloading resume...')
  try {
    // Use axios with responseType: 'blob' — Authorization header sent automatically
    const endpoint = studentId
      ? `/students/${studentId}/resume/view`
      : `/students/resume/view`

    const response = await api.get(endpoint, { responseType: 'blob' })

    const url = URL.createObjectURL(response.data)
    const a   = document.createElement('a')
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