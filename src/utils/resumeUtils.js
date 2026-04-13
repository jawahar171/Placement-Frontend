import toast from 'react-hot-toast'

/**
 * Downloads resume by fetching as blob and creating a local object URL.
 * This bypasses ALL cross-origin restrictions — the browser downloads
 * from a local blob URL, never touching Cloudinary directly.
 */
export async function downloadResume(resumeUrl) {
  if (!resumeUrl) return
  const toastId = toast.loading('Downloading resume...')
  try {
    const res = await fetch(resumeUrl)
    if (!res.ok) throw new Error('Failed to fetch')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.dismiss(toastId)
    toast.success('Resume downloaded!')
  } catch {
    toast.dismiss(toastId)
    toast.error('Download failed. Please try again.')
  }
}
