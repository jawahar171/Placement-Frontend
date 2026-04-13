export function openResume(resumeUrl) {
  if (!resumeUrl) return
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(resumeUrl)}`
  window.open(viewerUrl, '_blank', 'noopener,noreferrer')
}
