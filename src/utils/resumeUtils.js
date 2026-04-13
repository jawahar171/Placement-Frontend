import api from './axios'
import toast from 'react-hot-toast'

/**
 * Opens a student resume in a new tab.
 *
 * For new uploads (resource_type:auto → /image/upload/ URL): opens directly.
 * For old uploads (resource_type:raw → /raw/upload/ URL): fetches the file
 * as a blob in the browser, re-uploads it through our backend as auto type,
 * saves the new URL, then opens it. This works because the browser CAN fetch
 * the raw Cloudinary URL directly (it's publicly accessible) — the issue was
 * only with OPENING it in a tab (chrome-error frame restriction).
 */
export async function openResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  // Already auto/image type — open directly
  if (!resumeUrl.includes('/raw/upload/')) {
    window.open(resumeUrl, '_blank', 'noopener,noreferrer')
    return
  }

  const toastId = toast.loading('Preparing resume...')

  try {
    // Step 1: fetch the file as a blob FROM the browser
    // The browser CAN access this URL directly — the issue is only with OPENING it in a tab
    const response = await fetch(resumeUrl)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)

    const blob = await response.blob()

    // Step 2: re-upload through our backend as FormData
    // This hits the existing /resume endpoint which uses resource_type:'auto'
    const formData = new FormData()
    const filename = resumeUrl.split('/').pop() || 'resume.pdf'
    formData.append('resume', blob, filename)

    // Use correct endpoint based on who is viewing
    let uploadRes
    if (studentId) {
      // Admin/company: upload on behalf of the student
      uploadRes = await api.post(`/students/${studentId}/resume/upload-migrate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      // Student viewing own resume
      uploadRes = await api.post('/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    const newUrl = uploadRes.data?.resumeUrl || uploadRes.data?.student?.resumeUrl
    toast.dismiss(toastId)

    if (newUrl) {
      window.open(newUrl, '_blank', 'noopener,noreferrer')
    } else {
      throw new Error('No URL returned')
    }
  } catch (err) {
    toast.dismiss(toastId)
    console.error('openResume error:', err.message)
    // Show clear message instead of opening a broken tab
    toast.error('Could not open resume. Please ask the student to re-upload their resume.')
  }
}