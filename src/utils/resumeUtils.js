import toast from 'react-hot-toast'

/**
 * Returns props for a real <a> tag to open/download a resume.
 *
 * Uses download attribute to force file download instead of browser open.
 * This bypasses ALL chrome-error://chromewebdata/ issues caused by Chrome's
 * PDF viewer failing to handle Cloudinary URLs in certain contexts.
 */
export function getResumeLinkProps(resumeUrl) {
  if (!resumeUrl || resumeUrl.includes('/raw/upload/')) return null
  return {
    href: resumeUrl,
    target: '_blank',
    rel: 'noreferrer noopener',
    download: 'resume.pdf',
  }
}

/**
 * For old raw URLs that haven't been migrated yet.
 */
export function handleRawResume() {
  toast.error('Please re-upload your resume from the Profile page to enable viewing.')
}