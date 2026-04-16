import api from './axios'
import toast from 'react-hot-toast'

/**
 * Downloads a resume:
 * 1. Calls backend /resume/view which ensures the Cloudinary asset is public
 *    and returns the URL as JSON
 * 2. Fetches the URL as a blob (now publicly accessible)
 * 3. Triggers browser download from a local blob URL
 */
export async function downloadResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  const toastId = toast.loading('Downloading resume...')
  try {
    // Step 1: Get the public URL from backend (also sets access_mode:public if needed)
    const endpoint = studentId
      ? `/students/${studentId}/resume/view`
      : `/students/resume/view`

    const { data } = await api.get(endpoint)
    const publicUrl = data.url || resumeUrl

    // Step 2: Fetch as blob (URL is now public)
    const response = await fetch(publicUrl)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
    const blob = await response.blob()

    // Step 3: Download from local blob URL
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = 'resume.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)

    toast.dismiss(toastId)
    toast.success('Resume downloaded!')
  } catch (err) {
    toast.dismiss(toastId)
    console.error('downloadResume error:', err.message)
    toast.error('Download failed. Please try again.')
  }
}