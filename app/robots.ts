import type { MetadataRoute } from 'next'

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://new-project-canvas.vercel.app').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/download/'] }],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
