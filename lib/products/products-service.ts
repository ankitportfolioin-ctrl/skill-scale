import { supabase } from '@/lib/supabase'
import { type Product } from '@/lib/cms/content'
import { supabaseRowToProduct, productToSupabaseRow } from '@/lib/supabase/products-service'

export const PRODUCTS_COLLECTION = 'products'
export function generateSlug(title: string): string {
  return title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || 'product'
}
export function sanitizeProductData(product: Product) { return productToSupabaseRow(product) }
export async function saveProductToSupabase(product: Product): Promise<Product> {
  const row = productToSupabaseRow(product)
  const { data, error } = await supabase.from('products').upsert(row, { onConflict: 'id' }).select('*').single()
  if (error) throw error
  return supabaseRowToProduct(data)
}
export async function deleteProductFromSupabase(productId: string) {
  if (!productId) return
  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) throw error
}
export async function fetchProductsFromSupabase(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('price', { ascending: false })
  if (error) {
    console.warn('Supabase fetch products notice:', error.message)
    return []
  }
  if (!data) return []
  return data.map(supabaseRowToProduct)
}
export function subscribeToProducts(onUpdate: (products: Product[]) => void): () => void {
  let active = true
  fetchProductsFromSupabase().then((products) => active && onUpdate(products))
  const channelName = `products-realtime-${Math.random().toString(36).substring(2, 15)}`
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProductsFromSupabase().then((p) => active && onUpdate(p)))
    .subscribe()
  return () => { active = false; void supabase.removeChannel(channel) }
}
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const clean = generateSlug(slug)
  const { data } = await supabase.from('products').select('*').or(`slug.eq.${clean},id.eq.${slug}`).maybeSingle()
  if (data) return supabaseRowToProduct(data)
  return null
}
export function subscribeToProductBySlug(slug: string, onUpdate: (product: Product | null) => void): () => void {
  fetchProductBySlug(slug).then(onUpdate)
  const channelName = `product-${slug}-${Math.random().toString(36).substring(2, 15)}`
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProductBySlug(slug).then(onUpdate))
    .subscribe()
  return () => { void supabase.removeChannel(channel) }
}
