import toast from 'react-hot-toast'

/**
 * Returns props for a real <a> tag to open a resume.
 * Usage: <a {...getResumeLinkProps(url)}>View Resume</a>
 *
 * A real <a href target="_blank"> is the ONLY approach that works reliably.
 * window.open() and programmatic clicks after async code all trigger
 * chrome-error://chromewebdata/ because Chrome treats them as popups.
 */
export function getResumeLinkProps(resumeUrl) {
  if (!resumeUrl || resumeUrl.includes('/raw/upload/')) return null
  return {
    href: resumeUrl,
    target: '_blank',
    rel: 'noreferrer noopener',
  }
}

/**
 * For old raw URLs that haven't been migrated yet.
 * Shows a toast telling the student to re-upload.
 */
export function handleRawResume() {
  toast.error('Resume needs to be re-uploaded. Please go to Profile and upload your resume again.')
}
