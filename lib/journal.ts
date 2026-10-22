import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_DEFAULT_URL, SUPABASE_DEFAULT_ANON_KEY } from '@/lib/supabase'

export interface JournalArticle {
  id: string
  slug: string
  title: string
  excerpt: string | null
  category: string | null
  author: string | null
  date: string | null
  read_time: string | null
  cover_image: string | null
  content: unknown
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_DEFAULT_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

const COLUMNS = 'id, slug, title, excerpt, category, author, date, read_time, cover_image, content'

export async function listArticles(): Promise<JournalArticle[]> {
  const { data, error } = await db()
    .from('journal_articles')
    .select(COLUMNS)
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) console.warn('[journal] list failed:', error.message)
  return (data as JournalArticle[]) ?? []
}

export async function getArticle(slug: string): Promise<JournalArticle | null> {
  const { data, error } = await db()
    .from('journal_articles')
    .select(COLUMNS)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()
  if (error) console.warn('[journal] get failed:', error.message)
  return (data as JournalArticle) ?? null
}

/** Article body is stored as JSON: a string, or a list of strings / {heading|text|body} blocks. */
export function articleParagraphs(content: unknown): { heading?: boolean; text: string }[] {
  if (typeof content === 'string') return content.split(/\n{2,}/).map((text) => ({ text }))
  if (!Array.isArray(content)) return []
  const out: { heading?: boolean; text: string }[] = []
  for (const block of content) {
    if (typeof block === 'string') out.push({ text: block })
    else if (block && typeof block === 'object') {
      const b = block as Record<string, unknown>
      if (typeof b.heading === 'string') out.push({ heading: true, text: b.heading })
      const body = b.text ?? b.body ?? b.paragraph
      if (typeof body === 'string') out.push({ text: body })
    }
  }
  return out
}
