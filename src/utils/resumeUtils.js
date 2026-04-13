import api from './axios'

/**
 * Opens a resume PDF in a new tab.
 *
 * Problem: Cloudinary raw/upload URLs cannot be opened by Chrome (cross-origin
 * frame security) and Google Docs Viewer shows "No preview available" because
 * the raw URL is not publicly accessible.
 *
 * Solution: Re-upload the file from raw → auto type via backend on first view.
 * Cloudinary auto-type produces an /image/upload/ URL that Chrome opens natively.
 * The new URL is saved to DB — subsequent opens are instant (no migration needed).
 *
 * @param {string} resumeUrl  - stored resume URL
 * @param {string} [studentId] - pass when admin/company viewing another student
 */
export async function openResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  // Already auto/image type — open directly, no migration needed
  if (!resumeUrl.includes('/raw/upload/')) {
    window.open(resumeUrl, '_blank', 'noopener,noreferrer')
    return
  }

  // Raw URL — open blank tab synchronously (inside user gesture, never popup-blocked)
  const tab = window.open('about:blank', '_blank')

  try {
    // Trigger one-time migration: re-uploads as resource_type:auto on Cloudinary
    const endpoint = studentId
      ? `/students/${studentId}/resume/migrate`
      : `/students/resume/migrate`

    const { data } = await api.post(endpoint)
    const finalUrl = data.resumeUrl || resumeUrl

    if (tab) tab.location.href = finalUrl
    else window.open(finalUrl, '_blank', 'noopener,noreferrer')
  } catch (err) {
    console.error('Resume migration failed:', err.message)
    // Fallback to direct URL
    if (tab) tab.location.href = resumeUrl
    else window.open(resumeUrl, '_blank', 'noopener,noreferrer')
  }
}
