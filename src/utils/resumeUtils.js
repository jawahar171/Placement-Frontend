import api from './axios'
import toast from 'react-hot-toast'

/**
 * Downloads a resume:
 * 1. Calls backend /resume/view which ensures the Cloudinary asset is public
 *    and returns the URL as JSON
 * 2. Fetches the URL with proper auth/credentials
 * 3. Triggers browser download from a local blob URL
 */
export async function downloadResume(resumeUrl, studentId = null) {
  if (!resumeUrl) {
    toast.error('No resume available')
    return
  }

  const toastId = toast.loading('Downloading resume...')
  try {
    // Step 1: Get the public URL from backend (also sets access_mode:public if needed)
    const endpoint = studentId
      ? `/students/${studentId}/resume/view`
      : `/students/resume/view`

    const { data } = await api.get(endpoint)
    const publicUrl = data.url || resumeUrl

    // Step 2: Fetch as blob with proper headers and credentials
    // Using axios instead of fetch to ensure proper auth headers and CORS handling
    const response = await api.get(publicUrl, {
      responseType: 'blob',
      // Override baseURL to use the full Cloudinary URL
      baseURL: '',
      // Don't add auth headers for Cloudinary URLs (they're public)
      transformRequest: [(data, headers) => {
        delete headers.Authorization
        return data
      }]
    })

    const blob = response.data

    // Step 3: Download from local blob URL
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    
    // Extract filename from URL or use default
    let filename = 'resume.pdf'
    try {
      const urlParts = publicUrl.split('/')
      const lastPart = urlParts[urlParts.length - 1]
      if (lastPart && lastPart.includes('.')) {
        filename = lastPart.split('?')[0] // Remove query params
      }
    } catch (e) {
      console.log('Could not extract filename, using default')
    }
    
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)

    toast.dismiss(toastId)
    toast.success('Resume downloaded!')
  } catch (err) {
    toast.dismiss(toastId)
    console.error('downloadResume error:', err)
    
    // Fallback: Try opening in new tab if download fails
    if (resumeUrl) {
      toast.error('Direct download failed. Opening in new tab...')
      window.open(resumeUrl, '_blank')
    } else {
      toast.error('Download failed. Please try again.')
    }
  }
}