import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface SellableProduct {
  id: string
  slug: string
  title: string
  creator: string
  /** Price in rupees. products.price is already INR, so there is no currency conversion anywhere. */
  priceInr: number
  image: string
  format: string
}

/**
 * Looks up published products by id from the `products` table, the single source of truth for
 * what is for sale and at what price. Prices are always read here on the server; a price sent
 * by the browser is never trusted.
 */
export async function getSellableProducts(
  db: SupabaseClient,
  ids: string[],
): Promise<Map<string, SellableProduct>> {
  const found = new Map<string, SellableProduct>()
  const unique = Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.length > 0)))
  if (unique.length === 0) return found

  const { data, error } = await db
    .from('products')
    .select('id, slug, title, creator, price, image, format')
    .in('id', unique)
    .eq('published', true)

  if (error) {
    console.error('[catalog] Could not load products:', error.message)
    return found
  }

  for (const row of data ?? []) {
    const priceInr = Number(row.price)
    if (!Number.isFinite(priceInr) || priceInr < 0) continue
    found.set(row.id, {
      id: row.id,
      slug: row.slug,
      title: row.title,
      creator: row.creator || 'SkillScale',
      priceInr,
      image: row.image || '',
      format: row.format || '',
    })
  }
  return found
}
