'use client'

import { useState, useMemo, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Filter,
  Layers,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Zap,
  Cpu,
  Smartphone,
  CheckCircle2,
  Gift,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { GENRES, PRICING_TIERS, type EbookGenre, type EbookItem, productToEbook } from '@/lib/ebooks-data'
import { useCart, ebookToProduct } from '@/lib/cart-context'
import { ProductModal } from '@/components/product-modal'
import { AccountModal } from '@/components/account-modal'
import { Button } from '@/components/ui/button'
import { useStorefrontContent } from '@/components/cms/use-content'
import { useProducts } from '@/components/products/use-products'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'

function EbooksContent() {
  const { content } = useStorefrontContent()
  const { products: storeProducts } = useProducts()
  const searchParams = useSearchParams()
  const initialGenre = searchParams.get('genre') || 'All'
  const initialSearch = searchParams.get('search') || ''

  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre)
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch)
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'title'>('featured')
  const [activeModalEbook, setActiveModalEbook] = useState<EbookItem | null>(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)

  const { addToCart, openCart } = useCart()

  // Dynamic catalog books queried from the dedicated /products collection
  const catalogBooks = useMemo<EbookItem[]>(() => {
    if (storeProducts && storeProducts.length > 0) {
      return storeProducts
        .filter((p) => p.published !== false)
        .map((p) => productToEbook(p))
    }
    return []
  }, [storeProducts])

  // Filter and sort catalog
  const filteredEbooks = useMemo(() => {
    return catalogBooks.filter((book) => {
      const matchesGenre = selectedGenre === 'All' || book.category === selectedGenre
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q) ||
        book.shortDescription.toLowerCase().includes(q)
      return matchesGenre && matchesSearch
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    })
  }, [catalogBooks, selectedGenre, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Navbar */}
      <SiteHeader onSearch={(q) => setSearchQuery(q)} initialSearch={searchQuery} />

      <main className="flex-1">
        {/* Catalog Banner */}
        <section className="relative overflow-hidden border-b border-border bg-soft py-12 sm:py-16">
          <div className="hero-grid absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                <Sparkles className="size-3.5 text-highlight" />
                Complete Digital Library
              </span>
              <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-primary sm:text-5xl">
                Explore All E-Books
              </h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
                High-leverage technical guides, autonomous AI architectures, production design tokens, self-help systems, and gripping speculative fiction. 100% DRM-free with immediate download.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Ecommerce Products List Section with Filters & Sorting */}
        <section id="catalog" className="scroll-mt-20 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Filter and Sort Bar */}
            <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Genre Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0" aria-label="Filter by genre">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
                  <Filter className="size-3.5" />
                  Genre:
                </span>
                {['All', ...GENRES.map((g) => g.name)].map((genre) => {
                  const active = selectedGenre === genre
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenre(genre)}
                      aria-pressed={active}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {genre}
                    </button>
                  )
                })}
              </div>

              {/* Sort Selector & Results Count */}
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Showing <strong>{filteredEbooks.length}</strong> {filteredEbooks.length === 1 ? 'e-book' : 'e-books'}
                </span>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="featured">Featured Picks</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="title">Title (A – Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active search filter tag */}
            {searchQuery && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Filter keyword: “<strong>{searchQuery}</strong>”</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-primary underline hover:opacity-80"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Product Grid */}
            {filteredEbooks.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEbooks.map((book) => (
                  <div
                    key={book.id}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                  >
                    {/* Cover Image - Direct Navigation to Product Detail Page */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted">
                      <Link
                        href={`/ebooks/${book.slug}`}
                        aria-label={`View product details for ${book.title}`}
                        className="relative block size-full"
                      >
                        <Image
                          src={formatGoogleDriveImageUrl(book.image)}
                          alt={book.imageAlt}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {book.badge && (
                          <span className="absolute top-2.5 left-2.5 rounded-full bg-primary/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
                            {book.badge}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                          <span className="rounded-xl bg-background/95 px-3 py-1.5 text-xs font-bold text-primary shadow flex items-center gap-1">
                            View Details <ArrowRight className="size-3" />
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Book Metadata */}
                    <div className="mt-4 flex flex-1 flex-col">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-primary/80">{book.category}</span>
                        <span className="flex items-center gap-1 font-medium text-amber-500">
                          <Star className="size-3.5 fill-current" />
                          {book.rating.toFixed(1)} ({book.reviewsCount})
                        </span>
                      </div>

                      <h3 className="mt-2 font-heading text-base font-bold leading-snug line-clamp-1">
                        <Link
                          href={`/ebooks/${book.slug}`}
                          className="hover:text-primary transition"
                        >
                          {book.title}
                        </Link>
                      </h3>

                      <p className="mt-1 text-xs text-muted-foreground font-medium">
                        By {book.author}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-muted-foreground line-clamp-2 flex-1">
                        {book.shortDescription}
                      </p>

                      {/* Formats badges */}
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                        {book.formats.map((fmt) => (
                          <span key={fmt} className="rounded bg-muted px-1.5 py-0.5">
                            {fmt}
                          </span>
                        ))}
                        <span className="ml-auto text-[11px] text-muted-foreground">
                          {book.pages} pages
                        </span>
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading text-lg font-bold text-foreground">
                            ${book.price}
                          </span>
                          {book.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ${book.compareAtPrice}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/ebooks/${book.slug}`}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-background px-2.5 text-xs font-semibold text-foreground transition hover:bg-muted hover:text-primary"
                          >
                            Details
                          </Link>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setActiveModalEbook(book)}
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                            title="Quick preview popup"
                          >
                            Preview
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addToCart(book)}
                            className="h-8 bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90"
                          >
                            <ShoppingBag className="mr-1 size-3.5" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center">
                <Search className="mx-auto size-10 text-muted-foreground" />
                <h3 className="mt-4 font-heading text-lg font-semibold">No e-books found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search query or selecting a different genre above.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedGenre('All')
                    setSearchQuery('')
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 3. Feature Section: Instant Digital Download Highlight */}
        <section className="border-y border-border bg-soft py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Zap className="size-3.5" />
                  Instant Digital Delivery
                </span>
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  Read Immediately on Any Screen. Zero Wait, Zero Mystery.
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  The moment your checkout is complete, your download dashboard generates permanent, secure download links. We email you an instant receipt with direct download tokens and keep your files saved in your reader account for life.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Zap className="size-5" />
                    </div>
                    <h3 className="mt-3 font-heading text-sm font-semibold">Under 2-Second Delivery</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-5">
                      Direct cloud CDN download links right on your confirmation screen.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                      <Smartphone className="size-5" />
                    </div>
                    <h3 className="mt-3 font-heading text-sm font-semibold">Send Directly to Kindle & iPad</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-5">
                      Formatted with verified mobi and epub metadata for 1-click ereader import.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xl lg:p-8">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Sample Reader Download Token
                    </span>
                    <p className="font-heading text-base font-bold text-primary mt-0.5">
                      Next.js Systems Handbook (Bundle)
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    Ready to Download
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { format: 'EPUB', size: '14.2 MB', desc: 'Flowable layout for Kindle, Apple Books, Kobo & reMarkable' },
                    { format: 'PDF', size: '28.6 MB', desc: 'Print-ready typography with high-resolution code diagrams' },
                    { format: 'MOBI', size: '16.8 MB', desc: 'Legacy Kindle hardware compatible build' },
                    { format: 'ZIP', size: '6.4 MB', desc: 'Companion GitHub code samples & architecture diagrams' },
                  ].map((item) => (
                    <div
                      key={item.format}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                          {item.format}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{item.desc}</p>
                          <span className="text-[11px] text-muted-foreground">{item.size}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground" aria-label={`${item.format} sample file preview unavailable in demo`}>
                        <Download className="size-3.5" />
                        Sample
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Features List Section: Key Benefits (DRM-Free, Multi-Format, Lifetime Updates) */}
        <section id="drm-free" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Why Readers Choose SkillScale
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                The Reader-First Publishing Standard
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                We believe you should genuinely own the books you buy. Here are the core pillars behind every e-book in our store.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: ShieldCheck,
                  title: '100% DRM-Free Files',
                  desc: 'No proprietary apps or locked ecosystems. You own the clean EPUB, PDF, and MOBI files forever.',
                },
                {
                  icon: Layers,
                  title: 'Multi-Format In Every Pack',
                  desc: 'Every single purchase includes EPUB for ereaders, crisp PDF for desktop, and MOBI for Kindle.',
                },
                {
                  icon: Zap,
                  title: 'Lifetime Errata & Updates',
                  desc: 'When an author revises a chapter or updates code snippets, you get the updated edition at zero cost.',
                },
                {
                  icon: CheckCircle2,
                  title: '14-Day Money-Back Guarantee',
                  desc: 'If an e-book does not meet your expectations, email us within 14 days for a prompt, courteous refund.',
                },
              ].map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-base font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground flex-1">
                      {feature.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 5. Pricing Section: Individual, Bundles, Membership */}
        <section id="pricing" className="scroll-mt-20 border-t border-border bg-soft py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Transparent Pricing
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Choose the Reading Plan That Fits Your Goals
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Purchase single titles a la carte, save big on curated bundles, or unlock the entire library with the All-Access Reader Pass.
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-3 items-stretch">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative flex flex-col rounded-3xl border p-6 sm:p-8 transition-all ${
                    tier.popular
                      ? 'border-primary bg-background shadow-2xl ring-2 ring-primary'
                      : 'border-border bg-card shadow-sm'
                  }`}
                >
                  {tier.badge && (
                    <span
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        tier.popular
                          ? 'bg-primary text-primary-foreground shadow'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  )}

                  <div className="mb-6">
                    <h3 className="font-heading text-xl font-bold text-primary">{tier.name}</h3>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{tier.description}</p>
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
                        {tier.price}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        / {tier.period}
                      </span>
                    </div>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3 border-t border-border pt-6 text-xs text-muted-foreground">
                    {tier.features.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.id === 'membership' ? (
                    <Button
                      type="button"
                      onClick={() => setAccountModalOpen(true)}
                      className="h-11 w-full bg-primary text-primary-foreground font-semibold"
                    >
                      {tier.ctaText}
                    </Button>
                  ) : (
                    <a
                      href={tier.ctaHref}
                      className={`inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition ${
                        tier.popular
                          ? 'bg-success text-success-foreground hover:bg-success/90 shadow'
                          : 'border border-border bg-background text-primary hover:bg-muted'
                      }`}
                    >
                      {tier.ctaText}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Reader Community Perks CTA Section: Light/Outlined treatment */}
        <section id="account-signup" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border-2 border-border/80 bg-card p-8 sm:p-12 text-center lg:text-left lg:flex lg:items-center lg:justify-between lg:gap-10 shadow-sm">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Gift className="size-3.5" />
                Reader Community Perks
              </span>
              <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                Create Your Free Account & Get 15% Off Your First Book
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Save your reading wishlist, receive author Q&A alerts, and automatically sync download links across all your tablets and computers.
              </p>
            </div>

            <div className="mt-8 shrink-0 lg:mt-0 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                onClick={() => setAccountModalOpen(true)}
                className="h-12 bg-success text-success-foreground hover:bg-success/90 px-6 font-semibold shadow text-sm cursor-pointer"
              >
                Sign Up for Free Account
              </Button>
              <a
                href="#catalog"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-semibold text-primary transition hover:bg-muted"
              >
                Continue Browsing
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />

      {/* Quick View Product Modal */}
      {activeModalEbook && (
        <ProductModal
          product={ebookToProduct(activeModalEbook)}
          currency="$"
          isOpen={Boolean(activeModalEbook)}
          onClose={() => setActiveModalEbook(null)}
          onAddToCart={(prod, qty) => addToCart(prod, qty)}
          onOpenCart={openCart}
        />
      )}

      {/* Reader Account Modal */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />
    </div>
  )
}

export default function EbooksPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading e-book catalog...</div>}>
      <EbooksContent />
    </Suspense>
  )
}
