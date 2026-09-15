'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import {
  ebookToProduct,
  productToEbook,
  type EbookItem,
} from '@/lib/ebooks-data'
import { type Product } from '@/lib/cms/content'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'
import { ProductDetailPageClient } from '@/components/product-detail-page-client'
import { Button } from '@/components/ui/button'
import {
  subscribeToProductBySlug,
  fetchProductBySlug,
} from '@/lib/products/products-service'
import { useProducts } from '@/components/products/use-products'

interface Props {
  slug: string
  initialBook?: EbookItem
}

export function EbookDetailInteractiveClient({ slug, initialBook }: Props) {
  const decodedSlug = useMemo(() => {
    try {
      return decodeURIComponent(slug).trim().toLowerCase()
    } catch {
      return slug.trim().toLowerCase()
    }
  }, [slug])

  // Direct product state queried from the /products collection where slug == slug
  const [productFromCollection, setProductFromCollection] = useState<Product | null>(null)
  const [hasQueried, setHasQueried] = useState(false)

  // Real-time listener querying the top-level /products collection where slug == slug
  useEffect(() => {
    let isMounted = true

    // Initial query where slug == slug
    fetchProductBySlug(decodedSlug).then((prod) => {
      if (isMounted) {
        if (prod) setProductFromCollection(prod)
        setHasQueried(true)
      }
    })

    // Real-time listener for this specific product in /products
    const unsubscribe = subscribeToProductBySlug(decodedSlug, (updatedProduct) => {
      if (isMounted) {
        if (updatedProduct) setProductFromCollection(updatedProduct)
        setHasQueried(true)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [decodedSlug])

  // Query catalog for related books from /products collection
  const { products: storeProducts } = useProducts()

  // Resolve target book: from /products collection query or pre-resolved book
  const { book, isDraftOnly } = useMemo<{
    book: EbookItem | null
    isDraftOnly: boolean
  }>(() => {
    // 1. Direct result from /products collection query (where slug == slug)
    if (productFromCollection) {
      return {
        book: productToEbook(productFromCollection),
        isDraftOnly: false,
      }
    }

    // 2. Server-side pre-resolved book from /products query
    if (initialBook) {
      return { book: initialBook, isDraftOnly: false }
    }

    // If the database query has completed and product was not found, it has been deleted or does not exist
    if (hasQueried && !productFromCollection && !initialBook) {
      return { book: null, isDraftOnly: false }
    }

    return { book: null, isDraftOnly: false }
  }, [productFromCollection, initialBook, decodedSlug, hasQueried])

  // Related e-books from the /products collection
  const relatedEbooks = useMemo(() => {
    if (!book) return []

    const allBooks: EbookItem[] = []
    if (storeProducts && storeProducts.length > 0) {
      storeProducts
        .filter((p) => p.published !== false)
        .forEach((p) => allBooks.push(productToEbook(p)))
    }

    return allBooks
      .filter((b) => b.id !== book.id && (b.category === book.category || b.featured))
      .slice(0, 3)
      .map(ebookToProduct)
  }, [book, storeProducts])

  // Fallback view when product is not found
  if (!book && hasQueried) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          <div className="size-16 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground mb-6">
            <HelpCircle className="size-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            E-Book Not Found
          </span>
          <h1 className="mt-2 text-2xl font-bold font-heading text-foreground sm:text-3xl">
            We couldn&apos;t find this product
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-md">
            No active e-book was found in the products collection matching{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
              /ebooks/{slug}
            </code>
            .
          </p>

          <div className="mt-4 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground max-w-lg text-left">
            <p className="font-semibold text-foreground mb-1">
              Did you just add this product in the Admin Panel?
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Ensure the product slug matches this URL parameter.
              </li>
              <li>
                Click <strong className="text-foreground">Publish to Live</strong> or{' '}
                <strong className="text-foreground">Save &amp; Publish Product</strong> in the Admin
                Panel to write it directly to the <code>/products</code> collection.
              </li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/ebooks" />}>
              <BookOpen className="size-4 mr-1.5" />
              Browse All E-Books
            </Button>
            <Button variant="outline" render={<Link href="/admin" />}>
              Go to Admin Panel
            </Button>
          </div>

          {/* Popular e-books from store */}
          {storeProducts && storeProducts.length > 0 && (
            <div className="mt-16 w-full text-left border-t border-border pt-10">
              <h2 className="text-base font-bold font-heading text-foreground mb-4">
                Explore Available Titles
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {storeProducts.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/ebooks/${item.slug}`}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted mb-3">
                      <Image
                        src={formatGoogleDriveImageUrl(item.image)}
                        alt={item.imageAlt || item.title}
                        fill
                        unoptimized
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-primary">
                      {item.category}
                    </span>
                    <h3 className="text-sm font-bold font-heading text-foreground group-hover:text-primary transition line-clamp-1 mt-0.5">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs font-bold text-foreground">
                      ${item.price}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
        <SiteFooter />
      </div>
    )
  }

  // Loading skeleton during initial query
  if (!book) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="aspect-[4/3] rounded-2xl bg-muted lg:col-span-6" />
              <div className="space-y-4 lg:col-span-6">
                <div className="h-8 w-3/4 rounded bg-muted" />
                <div className="h-5 w-1/3 rounded bg-muted" />
                <div className="h-24 w-full rounded bg-muted" />
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const product = ebookToProduct(book)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      {/* Draft banner notice if viewing an unpublished draft product */}
      {isDraftOnly && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-300 font-medium">
          Draft Preview: This product is currently in your draft. Click{' '}
          <Link href="/admin" className="underline font-bold hover:text-amber-800">
            Publish to Live
          </Link>{' '}
          in the Admin Panel to write it to the <code>/products</code> collection.
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/ebooks" className="hover:text-primary transition">
            E-Books
          </Link>
          <span>/</span>
          <Link
            href={`/ebooks?genre=${encodeURIComponent(book.category)}`}
            className="hover:text-primary transition"
          >
            {book.category}
          </Link>
          <span>/</span>
          <span className="truncate text-foreground font-medium">
            {book.title}
          </span>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <ProductDetailPageClient
          product={product}
          currency="$"
          relatedProducts={relatedEbooks}
        />

        {/* Extended E-Book Details Section: Table of Contents & Key Takeaways */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Table of Contents */}
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="size-5" />
                </span>
                <div>
                  <h2 className="font-heading text-lg font-bold text-primary">
                    Table of Contents
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {book.pages} pages across full thematic modules
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-border text-sm">
                {book.tableOfContents.map((chapter, index) => (
                  <div
                    key={index}
                    className="flex items-center py-3 text-muted-foreground hover:text-foreground"
                  >
                    <span className="w-8 text-xs font-mono text-primary font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-medium text-xs sm:text-sm">
                      {chapter}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Author Profile & Key Takeaways */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-primary">
                      What You&apos;ll Learn &amp; Implement
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Direct practical outcomes you can ship
                    </p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {book.keyTakeaways.map((takeaway, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Author Bio Box */}
              <div className="rounded-3xl border border-border bg-muted/40 p-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  About the Author
                </span>
                <h3 className="mt-1 font-heading text-base font-bold text-primary">
                  {book.author}
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {book.authorBio}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section: Instant Download Guarantee */}
        <section className="mt-16 rounded-3xl bg-soft border border-border p-8 text-center sm:p-12">
          <div className="max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Zap className="size-3.5" />
              100% DRM-Free Guarantee
            </span>
            <h2 className="mt-3 font-heading text-2xl font-bold text-primary sm:text-3xl">
              Buy Once, Read Forever on Any Device
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-6">
              When you purchase &ldquo;{book.title}&rdquo;, you receive instant download
              links for PDF, EPUB, and MOBI with no proprietary app restrictions.
              Enjoy free lifetime errata and updates.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
