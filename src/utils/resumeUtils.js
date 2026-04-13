import api from './axios'
import toast from 'react-hot-toast'

function openUrl(url) {
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.rel = 'noreferrer'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export async function openResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  // Already auto/image type — open directly with anchor click
  if (!resumeUrl.includes('/raw/upload/')) {
    openUrl(resumeUrl)
    return
  }

  const toastId = toast.loading('Preparing resume...')

  try {
    const response = await fetch(resumeUrl)
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)
    const blob = await response.blob()

    const formData = new FormData()
    const filename = resumeUrl.split('/').pop() || 'resume.pdf'
    formData.append('resume', blob, filename)

    let uploadRes
    if (studentId) {
      uploadRes = await api.post(`/students/${studentId}/resume/upload-migrate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      uploadRes = await api.post('/students/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    const newUrl = uploadRes.data?.resumeUrl || uploadRes.data?.student?.resumeUrl
    toast.dismiss(toastId)

    if (newUrl) {
      openUrl(newUrl)
    } else {
      throw new Error('No URL returned')
    }
  } catch (err) {
    toast.dismiss(toastId)
    console.error('openResume error:', err.message)
    toast.error('Could not open resume. Please re-upload your resume.')
  }
}