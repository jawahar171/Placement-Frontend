import api from './axios'

/**
 * Opens a student's resume in a new tab via a backend-generated signed Cloudinary URL.
 *
 * Why: Cloudinary 'raw' resource URLs require a signed URL to open publicly.
 * Directly opening the stored URL causes 401 Unauthorized.
 * The backend generates a fresh signed URL on demand using the Cloudinary SDK,
 * which works for both old (raw) and new (auto) uploads.
 *
 * @param {string} resumeUrl  - The stored resumeUrl (used to detect if resume exists)
 * @param {string} [studentId] - If viewing another student's resume (admin/company view)
 */
export async function openResume(resumeUrl, studentId = null) {
  if (!resumeUrl) return

  try {
    const endpoint = studentId
      ? `/students/${studentId}/resume/signed-url`
      : `/students/resume/signed-url`

    const { data } = await api.get(endpoint)

    if (data?.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer')
    }
  } catch (err) {
    console.error('Failed to get signed resume URL:', err)
    // Fallback: try opening directly (works for new auto-type uploads)
    window.open(resumeUrl, '_blank', 'noopener,noreferrer')
  }
}