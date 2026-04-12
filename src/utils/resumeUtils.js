import api from './axios'


export async function openResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  // Open blank tab synchronously inside the user-click handler.
  // Must NOT use noopener here — noopener makes window.open return null,
  // which causes "Cannot read properties of null (reading 'location')".
  const tab = window.open('', '_blank')

  // Safety check — if browser still blocked it, fall through to direct open
  if (!tab) {
    // Last resort: create a hidden <a> and click it programmatically
    const a = document.createElement('a')
    a.href = resumeUrl
    a.target = '_blank'
    a.rel = 'noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return
  }

  try {
    const endpoint = studentId
      ? `/students/${studentId}/resume/signed-url`
      : `/students/resume/signed-url`

    const { data } = await api.get(endpoint)

    if (data?.url) {
      tab.location.href = data.url
    } else {
      tab.location.href = resumeUrl
    }
  } catch (err) {
    console.error('Failed to get signed resume URL:', err)
    tab.location.href = resumeUrl
  }
}