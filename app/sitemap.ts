import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { listArticles } from '@/lib/journal'

const SITE = (process.env.NEXT_PUBLIC_APP_URL || 'https://new-project-canvas.vercel.app').replace(/\/$/, '')

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ['', '/ebooks', '/about', '/blog', '/privacy', '/terms', '/refunds'].map((path) => ({
    url: `${SITE}${path}`,
  }))

  let books: MetadataRoute.Sitemap = []
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (url && key) {
    const db = createClient(url, key, { auth: { persistSession: false } })
    const { data } = await db.from('products').select('slug').eq('published', true)
    books = (data ?? []).map((row: { slug: string }) => ({ url: `${SITE}/ebooks/${row.slug}` }))
  }

  let posts: MetadataRoute.Sitemap = []
  try {
    posts = (await listArticles()).map((a) => ({ url: `${SITE}/blog/${a.slug}` }))
  } catch {
    posts = []
  }

  return [...staticPages, ...books, ...posts]
}
