import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { DOWNLOAD_FORMATS, type DownloadFormat } from '@/lib/order-access'

/**
 * Which downloadable files actually exist for a book in the private `ebooks` bucket.
 * Files are expected at  private-ebooks/{bookId}/{bookId}.{epub|pdf|mobi|zip}
 *
 * Storage is the source of truth for "can this title be sold": a book with no uploaded file is not
 * for sale, so a customer can never pay for something we cannot deliver.
 */
export async function listBookFiles(db: SupabaseClient, bookId: string): Promise<Map<DownloadFormat, number>> {
  const found = new Map<DownloadFormat, number>()
  const { data, error } = await db.storage.from('ebooks').list(`private-ebooks/${bookId}`)
  if (error) {
    console.warn(`[book-files] Could not list files for "${bookId}":`, error.message)
    return found
  }
  for (const file of data ?? []) {
    for (const format of DOWNLOAD_FORMATS) {
      if (file.name === `${bookId}.${format}`) {
        found.set(format, Number((file.metadata as { size?: number } | null)?.size ?? 0))
      }
    }
  }
  return found
}

export async function isBookDeliverable(db: SupabaseClient, bookId: string): Promise<boolean> {
  return (await listBookFiles(db, bookId)).size > 0
}

/** Preference order when a purchase needs a single "main" file: bundle first, then PDF, EPUB, MOBI. */
const PREFERRED_ORDER: DownloadFormat[] = ['zip', 'pdf', 'epub', 'mobi']

export async function primaryBookFile(
  db: SupabaseClient,
  bookId: string,
): Promise<{ path: string; format: DownloadFormat; formats: DownloadFormat[] } | null> {
  const files = await listBookFiles(db, bookId)
  const format = PREFERRED_ORDER.find((f) => files.has(f))
  if (!format) return null
  return {
    path: `private-ebooks/${bookId}/${bookId}.${format}`,
    format,
    formats: PREFERRED_ORDER.filter((f) => files.has(f)),
  }
}
