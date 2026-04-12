import api from './axios'


export async function openResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  // STEP 1 — open blank tab NOW, synchronously, before any await
  // This keeps it within the user gesture so it is never popup-blocked
  const tab = window.open('', '_blank', 'noopener,noreferrer')

  try {
    const endpoint = studentId
      ? `/students/${studentId}/resume/signed-url`
      : `/students/resume/signed-url`

    const { data } = await api.get(endpoint)

    if (data?.url) {
      // STEP 2 — navigate the already-open tab to the signed URL
      tab.location.href = data.url
    } else {
      tab.close()
    }
  } catch (err) {
    console.error('Failed to get signed resume URL:', err)
    // Fallback: navigate to the direct URL (works for new resource_type:auto uploads)
    tab.location.href = resumeUrl
  }
}