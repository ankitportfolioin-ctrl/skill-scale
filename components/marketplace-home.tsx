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
import { GENRES, TESTIMONIALS, BLOG_POSTS, type EbookItem, productToEbook } from '@/lib/ebooks-data'
import { ProductModal } from '@/components/product-modal'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useStorefrontContent } from '@/components/cms/use-content'
import { useProducts } from '@/components/products/use-products'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'

export function MarketplaceHome({ preview = false }: { preview?: boolean }) {
  const { content, isLive } = useStorefrontContent(preview)
  const { products: storeProducts } = useProducts()
  const { addToCart, openCart } = useCart()
  const { openSignUp, user, openAccountDashboard } = useAuth()
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
    return ['All', ...GENRES.map((g) => g.name)]
  }, [content?.categories])

  // Testimonials / Reader reviews
  const displayReviews = useMemo(() => {
    if (content?.reviews && content.reviews.length > 0) {
      return content.reviews.map((r, idx) => ({
        id: r.id || `rev-${idx}`,
        rating: r.rating || 5,
        verified: true,
        quote: r.quote,
        avatar: r.initials || r.name.slice(0, 2).toUpperCase(),
        avatarBg: 'bg-emerald-100 dark:bg-emerald-950/50',
        avatarColor: 'text-emerald-800 dark:text-emerald-300',
        name: r.name,
        role: r.role || 'Verified Reader',
        company: 'Reader',
      }))
    }
    return TESTIMONIALS
  }, [content?.reviews])

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterSubscribed(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {preview && (
        <aside className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/70 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Draft Preview Mode &mdash; Showing unpublished changes currently staged in Admin</span>
          </div>
          <Link
            href="/admin"
            className="rounded bg-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-300 transition dark:bg-amber-900 dark:text-amber-100"
          >
            Back to Admin Panel
          </Link>
        </aside>
      )}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* 1. Navbar */}
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {/* 2. Hero Header Section: Headline, Subheadline, Primary CTA to browse collection */}
        <section id="top" className="relative overflow-hidden border-b border-border bg-soft">
          <div className="hero-grid absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
                <Sparkles className="size-3.5 text-highlight" />
                {content?.hero?.eyebrow || "Built By Engineers Who've Shipped This"}
              </div>

              <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-6xl">
                {content?.hero?.title || "That's All You Need To Start"}
                {content?.hero?.accent && (
                  <span className="block text-primary/85">{content.hero.accent}</span>
                )}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {content?.hero?.description ||
                  "Skip the tutorials. Every guide here comes from someone who built the real thing — AI agents in production, design systems teams actually use, dev tools people pay for. Read it, then build the version that gets you paid."}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={content?.hero?.primaryHref || "/ebooks"}
                  prefetch={true}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-success px-6 text-sm font-semibold text-success-foreground shadow-[0_10px_25px_-12px_rgba(16,185,129,0.8)] transition hover:bg-success/90"
                >
                  {content?.hero?.primaryCta || "Browse The Ideas"}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={content?.hero?.secondaryHref || "/about"}
                  prefetch={true}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-semibold text-primary transition hover:bg-muted"
                >
                  {content?.hero?.secondaryCta || "Why We Wrote These"}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs sm:text-sm text-muted-foreground">
                {(content?.hero?.bullets && content.hero.bullets.length > 0
                  ? content.hero.bullets
                  : [
                      'Written by working engineers, not ghostwriters',
                      'Real code & systems, not just theory',
                      'Instant access, lifetime updates',
                      '14-day money-back guarantee',
                    ]
                ).map((bullet, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                    {bullet}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero Featured Showcase (Interactive Clickable Previews!) */}
            <div className="relative rounded-3xl border border-border bg-card p-6 shadow-2xl lg:p-8">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {content?.hero?.picksEyebrow || "Staff Recommendations"}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-primary">
                    {content?.hero?.picksTitle || "Bestselling This Week"}
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {content?.hero?.picksRating || "★ 4.9 Average Rating"}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {heroPicks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/ebooks/${book.slug}`}
                    className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-background p-3 transition hover:border-primary/40 hover:shadow-md block"
                  >
                    <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={formatGoogleDriveImageUrl(book.image)}
                        alt={book.imageAlt}
                        fill
                        unoptimized
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-primary/80">
                        {book.category}
                      </span>
                      <h4 className="font-heading text-sm font-bold text-foreground truncate group-hover:text-primary transition">
                        {book.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        By {book.author}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-heading text-sm font-bold text-foreground">
                        ${book.price}
                      </span>
                      <span className="block text-[10px] font-medium text-emerald-600">
                        EPUB/PDF
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>{content?.hero?.buildersText || "Over 35,000+ happy digital readers"}</span>
                <Link
                  href="/ebooks"
                  className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View Catalog <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Ecommerce Products List Section: Featured e-books with covers, authors, prices, quick add-to-cart */}
        <section id="featured-books" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {content?.productSection?.eyebrow || "THE CATALOG"}
                </span>
                <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  {content?.productSection?.title || "Guides Other Startup Founders Are Using Right Now"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  {content?.productSection?.description ||
                    "Engineering deep-dives, Startup ideas, Roadmap, design systems and Practicals — written by people who shipped the real thing, not people writing about it."}
                </p>
              </div>

              <Link
                href="/ebooks"
                prefetch={true}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                View Full Catalog →
              </Link>
            </div>

            {/* Quick Genre Selector */}
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Filter:</span>
              {displayCategories.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setSelectedGenre(genre)}
                  aria-pressed={selectedGenre === genre}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${
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
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredBooks.map((book) => (
                <div
                  key={book.id}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  {/* Book Cover - Direct Navigation to Product Detail Page */}
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

                  {/* Meta */}
                  <div className="mt-4 flex flex-1 flex-col">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-semibold text-primary/80">{book.category}</span>
                      <span className="flex items-center gap-1 font-medium text-amber-500">
                        <Star className="size-3.5 fill-current" />
                        {book.rating.toFixed(1)} ({book.reviewsCount})
                      </span>
                    </div>

                    <h3 className="mt-2 font-heading text-base font-bold leading-snug line-clamp-1">
                      <Link href={`/ebooks/${book.slug}`} className="hover:text-primary transition">
                        {book.title}
                      </Link>
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                      By {book.author}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground line-clamp-2 flex-1">
                      {book.shortDescription}
                    </p>

                    {/* Price and Cart Action */}
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
                          onClick={() => setActiveModalBook(book)}
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
          </div>
        </section>

        {/* 4. Feature Section: Instant Digital Delivery */}
        <section className="border-y border-border bg-soft py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Zap className="size-3.5" />
                  Frictionless Delivery
                </span>
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  Instant Digital Delivery for Every E-Book
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Say goodbye to shipping delays, damaged pages, and clunky proprietary reading apps. The moment your checkout completes, your download dashboard immediately generates verified, DRM-free links.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: 'Download in Seconds',
                      desc: 'Instant global cloud CDN delivery ensures you start reading within seconds of completing checkout.',
                    },
                    {
                      title: 'Direct Reader Sync',
                      desc: 'Easily email EPUB and MOBI files directly to your @kindle.com email or import into Apple Books and Kobo with 1 tap.',
                    },
                    {
                      title: 'Permanent Re-Download Access',
                      desc: 'Lost your tablet? Changed computers? Your library is permanently backed up and accessible in your reader account.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                        <p className="text-xs text-muted-foreground leading-5 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Mockup Card */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Download className="size-5" />
                  </span>
                  <div>
                    <h4 className="font-heading text-base font-bold text-primary">
                      Instant Download Screen
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Generated immediately after purchase
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { title: 'EPUB Format (E-Readers & Tablets)', size: '12.4 MB', icon: BookOpen },
                    { title: 'Crisp High-Res PDF (Desktop & Print)', size: '26.8 MB', icon: Layers },
                    { title: 'MOBI File (Kindle Native)', size: '14.1 MB', icon: Smartphone },
                  ].map((file) => {
                    const Icon = file.icon
                    return (
                      <div
                        key={file.title}
                        className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="size-4 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">{file.title}</p>
                            <span className="text-[10px] text-muted-foreground">{file.size}</span>
                          </div>
                        </div>
                        <span className="rounded bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                          Ready
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Feature Section: Wide Range of Genres (Fiction to Self-Help and Technical Guides) */}
        <section id="genres" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Comprehensive Library
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Explore a Wide Spectrum of Curated Genres
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                From deep-dive software engineering and autonomous AI architectures to mind-expanding speculative fiction and personal growth systems.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {GENRES.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/ebooks?genre=${encodeURIComponent(genre.name)}`}
                  prefetch={true}
                  className="group flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        {genre.count} Titles Available
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition flex items-center gap-0.5">
                        Browse <ChevronRight className="size-3" />
                      </span>
                    </div>

                    <h3 className="mt-4 font-heading text-xl font-bold text-primary group-hover:text-accent-foreground transition">
                      {genre.name}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">
                      {genre.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border pt-4 flex items-center justify-between text-xs text-primary font-semibold">
                    <span>Explore {genre.name}</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Benefits Section: Lifetime access, multi-device support, exclusive discounts */}
        <section className="border-y border-border bg-soft py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Storefront Advantages
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Why Readers Prefer the SkillScale Store
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                Built specifically for tech professionals, creators, and discerning readers who value true file ownership and superior formatting.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: '100% DRM-Free Ownership',
                  desc: 'You receive clean files that you can back up, convert, or read on any app of your choice. No restrictive vendor lock-in.',
                },
                {
                  icon: Smartphone,
                  title: 'Multi-Device Support',
                  desc: 'Every purchase bundles EPUB for tablets and phones, MOBI for Kindle devices, and high-resolution PDF for desktop workstations.',
                },
                {
                  icon: Zap,
                  title: 'Lifetime Free Updates',
                  desc: 'As authors release errata fixes, code library updates, and bonus chapters, you receive every updated version at no extra charge.',
                },
                {
                  icon: Gift,
                  title: 'Exclusive Reader Discounts',
                  desc: 'Members receive automatic 15% discounts on new volume releases and access to author chapter preview discussions.',
                },
                {
                  icon: CheckCircle2,
                  title: '14-Day Money-Back Guarantee',
                  desc: 'If any e-book does not provide the practical value you expected, reach out to our team for a no-questions-asked refund.',
                },
                {
                  icon: Users,
                  title: 'Direct Author Support',
                  desc: 'Have a question about a code snippet or architectural diagram? Our authors frequently answer reader questions in our repository discussions.',
                },
              ].map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={benefit.title}
                    className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-base font-bold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground flex-1">
                      {benefit.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 7. Testimonial Section: Praise for e-book quality and ease of purchase */}
        <section id="testimonials" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {content?.reviewSection?.eyebrow || "Reader Reviews"}
              </span>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                {content?.reviewSection?.title || "Loved by Builders, Authors & Voracious Readers"}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                {content?.reviewSection?.description ||
                  "Read what our community has to say about their reading experience and purchase ease."}
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {displayReviews.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-amber-500">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </div>
                    {item.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Verified Reader
                      </span>
                    )}
                  </div>
                  <blockquote className="mt-4 flex-1 text-xs sm:text-sm leading-6 text-foreground">
                    “{item.quote}”
                  </blockquote>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${item.avatarBg} ${item.avatarColor}`}
                    >
                      {item.avatar}
                    </span>
                    <div className="min-w-0">
                      <strong className="block text-xs font-semibold text-foreground truncate">{item.name}</strong>
                      <span className="text-[11px] text-muted-foreground block truncate">{item.role}</span>
                      <span className="text-[10px] font-medium text-primary block truncate">{item.company}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Reader Account Membership CTA: Light/Outlined treatment with distinct visual styling */}
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border-2 border-border/80 bg-card p-8 sm:p-12 text-center lg:text-left lg:flex lg:items-center lg:justify-between shadow-sm">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Gift className="size-3.5" />
                Reader Membership Perk
              </span>
              <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                Sign Up for a Free Account for Personalized Recommendations
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Create a reader profile to save your favorite books, receive tailored reading lists, and get an instant 15% discount code applied to your next purchase.
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
                {user ? 'View My Account & Perks' : 'Create Free Account (15% Off)'}
              </Button>
              <Link
                href="/ebooks"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-semibold text-primary transition hover:bg-muted"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </section>

        {/* 9. Content Section: Editorial Desk Articles (adds 64px+ breathing room and separates the account CTA from the newsletter) */}
        <section className="border-t border-border bg-soft py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Publishing & Engineering
                </span>
                <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  From the SkillScale Editorial Desk
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  Deep-dive essays, author interviews, and technical perspectives from the creators behind our catalog.
                </p>
              </div>

              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Explore All Editorial Articles
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {BLOG_POSTS.slice(0, 2).map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      unoptimized
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-primary shadow backdrop-blur-xs">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h3 className="mt-3 font-heading text-xl font-bold text-foreground group-hover:text-primary transition">
                      <Link href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                      {post.excerpt}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <div className="text-xs">
                        <strong className="block font-semibold text-foreground">{post.author}</strong>
                        <span className="text-muted-foreground">{post.authorRole}</span>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Read Article <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
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
          currency="$"
          isOpen={Boolean(activeModalBook)}
          onClose={() => setActiveModalBook(null)}
          onAddToCart={(prod, qty) => addToCart(prod, qty)}
          onOpenCart={openCart}
        />
      )}
    </div>
  )
}
