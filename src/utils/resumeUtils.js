/**
 * Opens a resume using multiple fallback strategies:
 * 1. Direct window.open of the Cloudinary URL (works in most cases)
 * 2. Google Docs Viewer fallback if direct fails
 */
export function openResume(resumeUrl) {
  if (!resumeUrl) return

  // Strategy: try direct open first, fall back to Google Docs Viewer
  // Use a hidden form POST to avoid popup blocker and frame context issues
  const form = document.createElement('form')
  form.method = 'GET'
  form.action = `https://docs.google.com/viewer`
  form.target = '_blank'

  const urlInput = document.createElement('input')
  urlInput.type = 'hidden'
  urlInput.name = 'url'
  urlInput.value = resumeUrl

  const embeddedInput = document.createElement('input')
  embeddedInput.type = 'hidden'
  embeddedInput.name = 'embedded'
  embeddedInput.value = 'false'

  form.appendChild(urlInput)
  form.appendChild(embeddedInput)
  document.body.appendChild(form)
  form.submit()
  setTimeout(() => document.body.removeChild(form), 100)
}