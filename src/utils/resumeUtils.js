export function getResumeUrl(url) {
  if (!url) return null
  // Already has fl_attachment — don't double-add
  if (url.includes('fl_attachment')) return url
  // Insert fl_attachment after /upload/
  return url.replace('/upload/', '/upload/fl_attachment/')
}

/**
 * Opens resume in a new tab using window.open with the corrected URL.
 * Uses noopener,noreferrer for security.
 */
export function openResume(url) {
  const fixedUrl = getResumeUrl(url)
  if (!fixedUrl) return
  window.open(fixedUrl, '_blank', 'noopener,noreferrer')
}