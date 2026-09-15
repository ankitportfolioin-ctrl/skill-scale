import { ProductRedirectClient } from './product-redirect-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  return <ProductRedirectClient slug={slug} />
}
