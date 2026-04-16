import api from './axios'
import toast from 'react-hot-toast'

/**
 * Downloads a resume served directly from our backend.
 *
 * New uploads: file bytes stored in MongoDB, served directly — no Cloudinary.
 * Old uploads: backend returns { fallback:true, url } — user told to re-upload.
 */
export async function downloadResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  const toastId = toast.loading('Downloading resume...')
  try {
    const endpoint = studentId
      ? `/students/${studentId}/resume/view`
      : `/students/resume/view`

    // Use axios with responseType:'blob' — gets file bytes directly from backend
    const response = await api.get(endpoint, { responseType: 'blob' })

    // Check if backend returned JSON fallback instead of bytes
    const contentType = response.headers['content-type'] || ''
    if (contentType.includes('application/json')) {
      // Old upload without buffer — tell user to re-upload
      toast.dismiss(toastId)
      toast.error('Please re-upload your resume from Profile to enable download.')
      return
    }

    // Got file bytes — trigger download
    const blob   = new Blob([response.data], { type: contentType || 'application/pdf' })
    const url    = URL.createObjectURL(blob)
    const a      = document.createElement('a')
    a.href       = url
    a.download   = 'resume.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.dismiss(toastId)
    toast.success('Resume downloaded!')
  } catch (err) {
    toast.dismiss(toastId)
    console.error('downloadResume error:', err.message)
    toast.error('Download failed. Please re-upload your resume from Profile.')
  }
}