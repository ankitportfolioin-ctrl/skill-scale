'use client'

import { useState, useMemo, FormEvent, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Gift,
  Globe2,
  Heart,
  Layers,
  Mail,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useCart, ebookToProduct } from '@/lib/cart-context'
import { type EbookItem, productToEbook } from '@/lib/ebooks-data'
import { ProductModal } from '@/components/product-modal'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useStorefrontContent } from '@/components/cms/use-content'
import { useProducts } from '@/components/products/use-products'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'
import { BookCoverImage } from '@/components/ui/book-cover-image'
import { ProductCoverImage } from '@/components/product-cover-image'

export function MarketplaceHome({ preview = false }: { preview?: boolean }) {
  const { content, isLive } = useStorefrontContent(preview)
  const { products: storeProducts } = useProducts()
  const { addToCart, openCart } = useCart()
  const { openSignUp, user, openAccountDashboard } = useAuth()
  const currency = content?.site?.currency || '₹'
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [activeModalBook, setActiveModalBook] = useState<EbookItem | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  // Map products queried from the top-level /products collection to EbookItem list
  const catalogBooks = useMemo<EbookItem[]>(() => {
    if (storeProducts && storeProducts.length > 0) {
      return storeProducts
        .filter((p) => p.published !== false)
        .map((p) => productToEbook(p))
    }
    return []
  }, [storeProducts])

  const featuredBooks = useMemo(() => {
    return catalogBooks.filter((book) => {
      if (selectedGenre === 'All') return true
      return book.category === selectedGenre
    })
  }, [catalogBooks, selectedGenre])

  // Top staff picks for hero section
  const heroPicks = useMemo<EbookItem[]>(() => {
    if (content?.hero?.featuredProductIds && content.hero.featuredProductIds.length > 0) {
      const picks = content.hero.featuredProductIds
        .map((id) => catalogBooks.find((b) => b.id === id || b.slug === id))
        .filter(Boolean) as EbookItem[]
      if (picks.length > 0) return picks.slice(0, 3)
    }
    return catalogBooks.slice(0, 3)
  }, [catalogBooks, content?.hero?.featuredProductIds])

  // Categories list for filtering
  const displayCategories = useMemo(() => {
    if (content?.categories && content.categories.length > 0) {
      return ['All', ...content.categories.map((c) => c.name)]
    }
    return ['All', ...Array.from(new Set(catalogBooks.map((b) => b.category).filter(Boolean)))]
  }, [content?.categories, catalogBooks])

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterSubscribed(true)
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground flex flex-col">
      {preview && (
        <aside className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/70 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Draft Preview Mode &mdash; Showing unpublished changes currently staged in Admin</span>
          </div>
        </aside>
      )}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* 1. Navbar */}
      <SiteHeader />

      <main id="main-content" className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">
        {/* 2. Hero Header Section: Headline, Subheadline, Primary CTA to browse collection */}
        <section id="top" className="relative w-full max-w-full overflow-hidden border-b border-border bg-soft">
          <div className="hero-grid absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="relative mx-auto grid w-full max-w-7xl min-w-0 gap-8 px-4 py-8 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-8">
            <div className="w-full min-w-0">
              <div className="mb-4 sm:mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs font-semibold text-primary shadow-sm min-w-0">
                <Sparkles className="size-3.5 text-highlight shrink-0" />
                <span className="truncate min-w-0">
                  {content?.hero?.eyebrow || "Built By Engineers Who've Shipped This"}
                </span>
              </div>

              <h1 className="font-heading text-2.5xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-primary break-words w-full max-w-full min-w-0">
                <span>{content?.hero?.title || "That's All You Need To Start"}</span>
                {content?.hero?.accent && (
                  <span className="block text-primary/85">{content.hero.accent}</span>
                )}
              </h1>

              <p className="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg leading-6 sm:leading-8 text-muted-foreground break-words">
                {content?.hero?.description ||
                  "Skip the tutorials. Every guide here comes from someone who built the real thing — AI agents in production, design systems teams actually use, dev tools people pay for. Read it, then build the version that gets you paid."}
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col gap-2.5 sm:flex-row sm:items-center w-full min-w-0">
                <Link
                  href={content?.hero?.primaryHref || "/ebooks"}
                  prefetch={true}
                  className="inline-flex min-h-[48px] py-3 px-5 sm:px-6 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-success text-xs sm:text-sm md:text-base font-semibold text-success-foreground shadow-[0_10px_25px_-12px_rgba(16,185,129,0.8)] transition hover:bg-success/90 text-center whitespace-normal break-words"
                >
                  <span className="whitespace-normal break-words text-center">{content?.hero?.primaryCta || "Browse The Ideas"}</span>
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
                <Link
                  href={content?.hero?.secondaryHref || "/about"}
                  prefetch={true}
                  className="inline-flex min-h-[44px] py-2.5 px-4 sm:px-5 w-full sm:w-auto items-center justify-center rounded-xl border border-border/70 bg-background/60 text-xs sm:text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground text-center whitespace-normal break-words"
                >
                  <span className="whitespace-normal break-words text-center">{content?.hero?.secondaryCta || "Why We Wrote These"}</span>
                </Link>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-x-6 sm:gap-y-3 text-xs sm:text-sm text-muted-foreground min-w-0">
                {(content?.hero?.bullets && content.hero.bullets.length > 0
                  ? content.hero.bullets
                  : [
                      'Written by working engineers, not ghostwriters',
                      'Real code & systems, not just theory',
                      'Download right after checkout',
                      'No DRM, just the file',
                    ]
                ).map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 min-w-0 max-w-full">
                    <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
                    <span className="leading-snug min-w-0 flex-1 break-words">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Featured Showcase (Interactive Clickable Previews!) */}
            <div className="relative w-full min-w-0 max-w-full rounded-2xl sm:rounded-3xl border border-border bg-card p-3.5 sm:p-6 shadow-xl lg:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3 sm:pb-4 gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                    {content?.hero?.picksEyebrow || "Our books"}
                  </span>
                  <h2 className="font-heading text-sm sm:text-lg font-bold text-primary truncate">
                    {content?.hero?.picksTitle || "Start here"}
                  </h2>
                </div>
                {content?.hero?.picksRating && (
                  <span className="self-start sm:self-auto shrink-0 max-w-full rounded-full bg-success/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-success truncate">
                    {content.hero.picksRating}
                  </span>
                )}
              </div>

              <div className="mt-3.5 sm:mt-5 space-y-3 sm:space-y-4 min-w-0">
                {heroPicks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/ebooks/${book.slug}`}
                    className="group flex cursor-pointer items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border border-border bg-background p-2.5 sm:p-3.5 transition hover:border-primary/40 hover:shadow-md min-w-0 w-full max-w-full"
                  >
                    <div className="relative w-11 sm:w-14 shrink-0 overflow-hidden rounded-lg aspect-[4/5]">
                      <ProductCoverImage
                        src={book.image}
                        alt={book.imageAlt || book.title}
                        title={book.title}
                        author={book.author}
                        category={book.category}
                        variant="thumb"
                        className="size-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <span className="block text-[10px] sm:text-[11px] font-semibold text-muted-foreground truncate">
                        {book.category}
                      </span>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-snug break-words group-hover:text-primary transition">
                        {book.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
                        By {book.author}
                      </p>
                    </div>
                    <div className="text-right shrink-0 pl-1.5 self-center">
                      <span className="block font-heading text-xs sm:text-sm font-bold text-foreground whitespace-nowrap">
                        {Number(book.price) === 0 ? 'Free' : `${currency}${book.price}`}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-border flex items-center justify-between gap-2 text-xs text-muted-foreground min-w-0">
                <span className="font-medium truncate min-w-0">Books by SkillScale</span>
                <Link
                  href="/ebooks"
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  Browse Catalog <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Ecommerce Products List Section: Featured e-books with covers, authors, prices, quick add-to-cart */}
        <section id="featured-books" className="scroll-mt-20 py-10 sm:py-20">
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-4 sm:pb-6">
              <div>
                <span className="text-xs font-bold tracking-wide text-primary">
                  {content?.productSection?.eyebrow || "The Catalog"}
                </span>
                <h2 className="mt-1 sm:mt-2 font-heading text-2xl sm:text-4xl font-bold tracking-tight text-primary">
                  {content?.productSection?.title || "Guides Other Startup Founders Are Using Right Now"}
                </h2>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl">
                  {content?.productSection?.description ||
                    "Engineering deep-dives, Startup ideas, Roadmap, design systems and Practicals — written by people who shipped the real thing, not people writing about it."}
                </p>
              </div>

              <Link
                href="/ebooks"
                prefetch={true}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline group shrink-0"
              >
                Browse Catalog
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Quick Genre Selector */}
            <div className="mt-4 sm:mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">Filter:</span>
              {displayCategories.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setSelectedGenre(genre)}
                  aria-pressed={selectedGenre === genre}
                  className={`shrink-0 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-semibold transition cursor-pointer border ${
                    selectedGenre === genre
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Grid of Featured E-Books */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-2.5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredBooks.length === 0 && (
                <p className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  New books are on the way. Check back soon.
                </p>
              )}
              {featuredBooks.map((book) => (
                <div
                  key={book.id}
                  className="group flex flex-col rounded-xl sm:rounded-2xl border border-border bg-card p-2 sm:p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg min-w-0"
                >
                  {/* Book Cover - Direct Navigation to Product Detail Page */}
                  <Link
                    href={`/ebooks/${book.slug}`}
                    aria-label={`View product details for ${book.title}`}
                    className="relative block size-full cursor-pointer"
                  >
                    <ProductCoverImage
                      src={book.image}
                      alt={book.imageAlt || book.title}
                      title={book.title}
                      author={book.author}
                      category={book.category}
                      variant="card"
                      badge={book.badge}
                      className="rounded-lg sm:rounded-xl"
                    >
                      <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity group-hover/cover:opacity-100 flex items-center justify-center">
                        <span className="rounded-xl bg-background/95 px-3 py-1.5 text-xs font-bold text-primary shadow flex items-center gap-1">
                          View Details <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </ProductCoverImage>
                  </Link>

                  {/* Meta */}
                  <div className="mt-2.5 sm:mt-4 flex flex-1 flex-col min-w-0">
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground gap-1">
                      <span className="font-semibold text-muted-foreground truncate">{book.category}</span>

                    </div>

                    <h3 className="mt-1 sm:mt-2 font-heading text-xs sm:text-base font-bold leading-snug line-clamp-2">
                      <Link href={`/ebooks/${book.slug}`} className="hover:text-primary transition">
                        {book.title}
                      </Link>
                    </h3>

                    <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
                      By {book.author}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground line-clamp-2 flex-1 hidden sm:block">
                      {book.shortDescription}
                    </p>

                    {/* Price and Cart Action */}
                    <div className="mt-2.5 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 border-t border-border pt-2 sm:pt-3">
                      <div className="flex items-baseline gap-1 sm:gap-1.5">
                        <span className="font-heading text-sm sm:text-lg font-bold text-foreground">
                          {Number(book.price) === 0 ? 'Free' : `${currency}${book.price}`}
                        </span>
                        {book.compareAtPrice && (
                          <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                            {currency}{book.compareAtPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
                        <Link
                          href={`/ebooks/${book.slug}`}
                          className="hidden lg:inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground transition hover:bg-muted hover:text-primary"
                        >
                          Details
                        </Link>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setActiveModalBook(book)}
                          className="h-7 sm:h-8 px-1.5 sm:px-2 text-[11px] sm:text-xs text-muted-foreground hover:text-foreground hidden min-[440px]:inline-flex"
                          title="Quick preview popup"
                        >
                          Preview
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addToCart(book)}
                          className="h-7 sm:h-8 flex-1 sm:flex-initial bg-primary px-2 sm:px-3 text-[11px] sm:text-xs text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        >
                          <ShoppingBag className="mr-1 size-3 sm:size-3.5 shrink-0" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why buy here: only things that are true today */}
        <section className="border-y border-border bg-soft py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                How buying here works
              </h2>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { icon: Download, title: 'Download right after checkout', desc: 'Your file opens on the download page as soon as checkout completes. Free titles need only an email address.' },
                { icon: ShieldCheck, title: 'No DRM', desc: 'You get the file itself, with no reader app or copy protection in the way.' },
                { icon: Mail, title: 'A real person replies', desc: 'Problem with a file or an order? Email ankit.portfolio.in@gmail.com and we will sort it out.' },
              ].map((b) => {
                const Icon = b.icon
                return (
                  <div key={b.title} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-base font-bold text-foreground">{b.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground flex-1">{b.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 8. Reader Account Membership CTA: Light/Outlined treatment with distinct visual styling */}
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border-2 border-border/80 bg-card p-8 sm:p-12 text-center lg:text-left lg:flex lg:items-center lg:justify-between shadow-sm">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary">
                <Gift className="size-3.5" />
                Free account
              </span>
              <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                Keep your downloads in one place
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Create a free account to keep your orders and downloads in one place.
              </p>
            </div>

            <div className="mt-8 shrink-0 lg:mt-0 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                onClick={() => {
                  if (user) {
                    openAccountDashboard('account')
                  } else {
                    openSignUp()
                  }
                }}
                className="h-12 bg-success text-success-foreground hover:bg-success/90 font-semibold px-6 shadow-md text-sm cursor-pointer"
              >
                {user ? 'View My Account' : 'Create Free Account'}
              </Button>
              <Link
                href="/ebooks"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 text-sm font-semibold text-primary transition hover:bg-muted"
              >
                Browse Catalog
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* 9. Newsletter Section & 10. Footer */}
      <SiteFooter />

      {/* Quick View Product Modal */}
      {activeModalBook && (
        <ProductModal
          product={ebookToProduct(activeModalBook)}
          currency={currency}
          isOpen={Boolean(activeModalBook)}
          onClose={() => setActiveModalBook(null)}
          onAddToCart={(prod, qty) => addToCart(prod, qty)}
          onOpenCart={openCart}
        />
      )}
    </div>
  )
}
