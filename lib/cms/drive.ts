/**
 * Google Drive URL Transformation Utilities
 * Converts sharing and view links into direct display URLs and direct download URLs.
 */

export function extractGoogleDriveFileId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()

  // Match /file/d/{FILE_ID} or /d/{FILE_ID}
  const matchPath = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (matchPath && matchPath[1]) return matchPath[1]

  // Match ?id={FILE_ID} or &id={FILE_ID}
  const matchParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (matchParam && matchParam[1]) return matchParam[1]

  // If raw Google Drive ID was pasted directly (typically 25 to 45 alphanumeric characters with - or _)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed
  }

  return null
}

export function isGoogleDriveUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com') || trimmed.includes('googleusercontent.com')) {
    return true
  }
  // Check if it's a standalone Drive File ID
  return /^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)
}

/**
 * Converts a Google Drive share link into a direct high-resolution image preview URL.
 * Automatically handles standard web image URLs, relative paths, and Google Drive links.
 * Uses Google's lh3 CDN endpoint with high-res parameter (=s1600) for instant, direct image delivery.
 */
export function formatGoogleDriveImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  // If already relative, data URL, or standard direct image without Google Drive
  if (trimmed.startsWith('/') || trimmed.startsWith('data:')) {
    return trimmed
  }

  // If already in lh3.googleusercontent.com/d/ format, ensure it has high resolution sizing
  if (trimmed.includes('lh3.googleusercontent.com/d/')) {
    if (!trimmed.includes('=')) {
      return `${trimmed}=s1600`
    }
    return trimmed
  }

  // If it's a Google Drive link or ID, extract file ID and convert to direct CDN display URL
  const fileId = extractGoogleDriveFileId(trimmed)
  if (fileId) {
    // Google high-speed media CDN for direct image streaming (bypasses viewer pages and anti-virus warnings)
    return `https://lh3.googleusercontent.com/d/${fileId}=s1600`
  }

  return trimmed
}

/**
 * Converts a Google Drive share link into an export/download URL suitable for e-book delivery.
 */
export function formatGoogleDriveDownloadUrl(url?: string): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  const fileId = extractGoogleDriveFileId(trimmed)
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`
  }

  return trimmed
}
