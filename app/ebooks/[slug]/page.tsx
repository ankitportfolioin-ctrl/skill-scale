import { EbookDetailInteractiveClient } from '@/components/ebook-detail-interactive-client'
import { fetchProductBySlug } from '@/lib/products/products-service'
import { productToEbook, type EbookItem } from '@/lib/ebooks-data'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default async function EbookDetailPage({ params }: PageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug).trim()

  // Query the dedicated /products collection where slug == params.slug
  let initialBook: EbookItem | undefined
  try {
    const product = await fetchProductBySlug(decodedSlug)
    if (product) {
      initialBook = productToEbook(product)
    }
  } catch (err) {
    console.warn('Notice: Server fetch from /products failed, falling back:', err)
  }

  return <EbookDetailInteractiveClient slug={slug} initialBook={initialBook} />
}
