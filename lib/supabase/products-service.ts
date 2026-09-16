import { supabase } from '@/lib/supabase'
import { type Product } from '@/lib/cms/content'
import { generateSlug } from '@/lib/products/products-service'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'

export interface SupabaseDiagnostics {
  connected: boolean
  url: string
  tableExists: boolean
  productCount: number
  buckets: string[]
  error: string | null
  lastChecked: string
}

/**
 * Convert a frontend Product entity into a Postgres-compatible Supabase row.
 */
export function productToSupabaseRow(product: Product): Record<string, any> {
  const cleanSlug = product.slug?.trim()
    ? generateSlug(product.slug)
    : generateSlug(product.title)

  return {
    id: product.id,
    slug: cleanSlug,
    title: product.title || 'Untitled Product',
    creator: product.creator || 'SkillScale Studio',
    category: product.category || 'Guides',
    short_description: product.shortDescription || '',
    description: product.description || '',
    price: typeof product.price === 'number' ? product.price : 0,
    compare_at_price: typeof product.compareAtPrice === 'number' ? product.compareAtPrice : null,
    rating: typeof product.rating === 'number' ? product.rating : 5,
    reviews: typeof product.reviews === 'number' ? product.reviews : 0,
    sales: typeof product.sales === 'number' ? product.sales : 0,
    inventory: typeof product.inventory === 'number' ? product.inventory : null,
    format: product.format || 'Digital download',
    image: formatGoogleDriveImageUrl(product.image) || '/products/design-system.png',
    image_alt: product.imageAlt || product.title,
    badge: product.badge || '',
    portrait: Boolean(product.portrait),
    featured: Boolean(product.featured),
    published: product.published !== false,
    license: product.license || 'Personal use',
    requirements: product.requirements || 'PDF reader',
    features: Array.isArray(product.features) ? product.features : [],
    updated_at: new Date().toISOString(),
  }
}

/**
 * Convert a Supabase Postgres row back into the frontend Product interface.
 * Handles both snake_case and camelCase column definitions.
 */
export function supabaseRowToProduct(row: Record<string, any>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug || generateSlug(row.title || 'product')),
    title: String(row.title || 'Untitled Product'),
    creator: String(row.creator || 'SkillScale Studio'),
    category: String(row.category || 'Guides'),
    shortDescription: String(row.short_description || row.shortDescription || ''),
    description: String(row.description || ''),
    price: Number(row.price ?? 0),
    compareAtPrice: row.compare_at_price != null ? Number(row.compare_at_price) : (row.compareAtPrice != null ? Number(row.compareAtPrice) : null),
    rating: Number(row.rating ?? 5),
    reviews: Number(row.reviews ?? 0),
    sales: Number(row.sales ?? 0),
    inventory: row.inventory != null ? Number(row.inventory) : null,
    format: String(row.format || 'Digital download'),
    image: formatGoogleDriveImageUrl(String(row.image || '/products/design-system.png')),
    imageAlt: String(row.image_alt || row.imageAlt || row.title || ''),
    badge: String(row.badge || ''),
    portrait: Boolean(row.portrait),
    featured: Boolean(row.featured),
    published: row.published !== false,
    license: String(row.license || 'Personal use'),
    requirements: String(row.requirements || 'None'),
    features: Array.isArray(row.features)
      ? row.features.map(String)
      : typeof row.features === 'string'
      ? row.features.split('\n').filter(Boolean)
      : [],
  }
}

/**
 * Diagnostic test to verify Supabase connection and check if products table exists.
 */
export async function testSupabaseStatus(): Promise<SupabaseDiagnostics> {
  const timestamp = new Date().toLocaleTimeString()
  try {
    // 1. Test products table
    const { count, error: tableError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })

    let tableExists = true
    let productCount = 0
    let errorMessage: string | null = null

    if (tableError) {
      if (tableError.code === 'PGRST205' || tableError.message?.includes('not find the table')) {
        tableExists = false
        errorMessage = "Table 'public.products' is not created yet in Supabase."
      } else {
        errorMessage = tableError.message
      }
    } else {
      productCount = count ?? 0
    }

    // 2. Test storage buckets
    let buckets: string[] = []
    try {
      const { data: bucketList } = await supabase.storage.listBuckets()
      if (bucketList) {
        buckets = bucketList.map((b) => b.name)
      }
    } catch {
      // Storage listing is optional
    }

    return {
      connected: true,
      url: 'https://wxtzacrsjkypfsejnifc.supabase.co',
      tableExists,
      productCount,
      buckets,
      error: errorMessage,
      lastChecked: timestamp,
    }
  } catch (err: any) {
    return {
      connected: false,
      url: 'https://wxtzacrsjkypfsejnifc.supabase.co',
      tableExists: false,
      productCount: 0,
      buckets: [],
      error: err?.message || 'Connection failed',
      lastChecked: timestamp,
    }
  }
}

/**
 * Fetch all e-books and guides stored in Supabase.
 */
export async function fetchProductsFromSupabase(): Promise<{
  success: boolean
  products: Product[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('price', { ascending: false })

    if (error) {
      return { success: false, products: [], error: error.message }
    }

    if (!data || data.length === 0) {
      return { success: true, products: [] }
    }

    const products = data.map((row) => supabaseRowToProduct(row))
    return { success: true, products }
  } catch (err: any) {
    return { success: false, products: [], error: err?.message || 'Supabase fetch failed' }
  }
}

/**
 * Fetch a single product from Supabase by its unique slug.
 */
export async function fetchProductBySlugFromSupabase(slug: string): Promise<Product | null> {
  try {
    const cleanSlug = generateSlug(slug)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', cleanSlug)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return supabaseRowToProduct(data)
  } catch {
    return null
  }
}

/**
 * Save / Upsert an individual product or guide into the Supabase products table.
 */
export async function saveProductToSupabase(product: Product): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const row = productToSupabaseRow(product)
    const { error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'id' })

    if (error) {
      console.error('Supabase upsert product error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Failed saving product to Supabase:', err)
    return { success: false, error: err?.message || 'Failed saving product to Supabase' }
  }
}

/**
 * Delete a product document from the Supabase products table.
 */
export async function deleteProductFromSupabase(productId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed deleting product from Supabase' }
  }
}

/**
 * Upload an e-book file (PDF, EPUB, zip archive, or cover image) to Supabase Storage.
 */
export async function uploadEbookFileToSupabase(
  file: File,
  bucket = 'ebooks',
  folder = 'files'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split('.').pop() || 'pdf'
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      return { success: false, error: error.message }
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return { success: true, url: publicUrlData.publicUrl }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Upload to Supabase Storage failed' }
  }
}

/**
 * SQL Schema migration statement for Supabase SQL Editor.
 */
export function getSupabaseSetupSQL(): string {
  return `-- ==============================================================================
-- 1. Create the 'products' table for E-books and Guides
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  creator TEXT DEFAULT 'SkillScale Studio',
  category TEXT DEFAULT 'Guides',
  short_description TEXT DEFAULT '',
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  compare_at_price NUMERIC(10,2),
  rating NUMERIC(3,2) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  inventory INTEGER,
  format TEXT DEFAULT 'Digital download',
  image TEXT DEFAULT '/products/design-system.png',
  image_alt TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  portrait BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  license TEXT DEFAULT 'Personal use',
  requirements TEXT DEFAULT 'None',
  features JSONB DEFAULT '[]'::jsonb,
  file_url TEXT,
  file_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. Enable Row Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all published e-books & guides
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  USING (true);

-- Allow inserting, updating, and deleting products
DROP POLICY IF EXISTS "Allow product modifications" ON public.products;
CREATE POLICY "Allow product modifications"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 3. Create Storage Bucket for E-books & Guides files
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to downloadable files in 'ebooks' bucket
DROP POLICY IF EXISTS "Public access to ebooks bucket" ON storage.objects;
CREATE POLICY "Public access to ebooks bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ebooks');

-- Allow uploading files to 'ebooks' bucket
DROP POLICY IF EXISTS "Allow file uploads to ebooks bucket" ON storage.objects;
CREATE POLICY "Allow file uploads to ebooks bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ebooks');
`
}
