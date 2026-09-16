'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/cms/content'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'
import { ProductCoverImage } from '@/components/product-cover-image'

interface ProductModalProps {
  product: Product | null
  currency: string
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, quantity: number) => void
  onOpenCart?: () => void
}

export function ProductModal({
  product,
  currency = '₹',
  isOpen,
  onClose,
  onAddToCart,
  onOpenCart,
}: ProductModalProps) {
  const [quantity, setQuantity] = React.useState(1)
  const [justAdded, setJustAdded] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)
  const { openCheckout } = useCart()

  // Reset state when product changes
  React.useEffect(() => {
    if (product) {
      setQuantity(1)
      setJustAdded(false)
      setCopiedLink(false)
    }
  }, [product])

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const handleAdd = () => {
    onAddToCart(product, quantity)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/ebooks/${product.slug}`
    if (!navigator.clipboard?.writeText) return
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }).catch(() => undefined)
  }

  const discountPercent = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
      )
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <span>{product.category}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{product.format}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Copy product link"
            >
              {copiedLink ? (
                <>
                  <Check className="size-3.5 text-success" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Share</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Close product details"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-12">
            {/* Left: Product Media Preview */}
            <div className="flex flex-col gap-4 lg:col-span-5 max-w-[280px] sm:max-w-sm mx-auto lg:max-w-none w-full">
              <Link
                href={`/ebooks/${product.slug}`}
                onClick={onClose}
                title="Click to open full product page"
                className="block cursor-pointer"
              >
                <ProductCoverImage
                  src={product.image}
                  alt={product.imageAlt || product.title}
                  title={product.title}
                  author={product.creator}
                  category={product.category}
                  variant="modal"
                  badge={product.badge}
                  className="rounded-xl border shadow-inner"
                >
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="rounded-xl bg-background/95 px-3.5 py-1.5 text-xs font-bold text-primary shadow-md flex items-center gap-1.5">
                      Open Full Page <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </ProductCoverImage>
              </Link>

              {/* Quick specs box */}
              <div className="grid grid-cols-2 gap-2 rounded-xl border bg-soft p-3.5 text-xs">
                <div>
                  <span className="block text-muted-foreground">Format</span>
                  <span className="font-semibold text-foreground">{product.format}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground">License</span>
                  <span className="font-semibold text-foreground">{product.license}</span>
                </div>
                <div className="col-span-2 border-t pt-2 mt-1">
                  <span className="block text-muted-foreground">Requirements</span>
                  <span className="font-semibold text-foreground">{product.requirements}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3.5 py-2.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-success" />
                  14-day satisfaction guarantee
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Download className="size-4 text-primary" />
                  Instant download
                </span>
              </div>
            </div>

            {/* Right: Product Details & Purchase Form */}
            <div className="flex flex-col gap-5 lg:col-span-7">
              <div>
                <h2
                  id="product-modal-title"
                  className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                >
                  <Link
                    href={`/ebooks/${product.slug}`}
                    onClick={onClose}
                    className="hover:text-primary transition hover:underline"
                  >
                    {product.title}
                  </Link>
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    by <strong className="font-semibold text-foreground">{product.creator}</strong>
                    <BadgeCheck className="size-4 text-primary" aria-label="Verified creator" />
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-highlight text-highlight" />
                    <span className="font-semibold text-foreground">{product.rating}</span>
                    <span className="text-muted-foreground">({product.reviews} reviews)</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{product.sales} sales</span>
                </div>
              </div>

              {/* Price block */}
              <div className="flex items-baseline gap-3 rounded-xl bg-secondary/50 p-4">
                <span className="font-heading text-3xl font-bold text-foreground">
                  {currency}{product.price}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {currency}{product.compareAtPrice}
                    </span>
                    {discountPercent && (
                      <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-bold text-success">
                        Save {discountPercent}%
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Full Description */}
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">{product.shortDescription}</p>
                <p>{product.description}</p>
              </div>

              {/* Key Features List */}
              {product.features && product.features.length > 0 && (
                <div className="rounded-xl border bg-card p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    What&apos;s Included
                  </h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-xs">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="size-4 shrink-0 text-success mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="mt-auto space-y-3 pt-2">
                {/* Instant Access direct checkout button */}
                <Button
                  type="button"
                  onClick={() => {
                    onClose()
                    openCheckout(product)
                  }}
                  className="h-12 w-full gap-2 bg-emerald-600 text-base font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition cursor-pointer"
                >
                  <Zap className="size-5" />
                  Get Instant Access • {currency}{product.price}
                </Button>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Quantity selector */}
                  <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-1.5 sm:w-36">
                    <span className="text-xs text-muted-foreground">Qty:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="flex size-6 items-center justify-center rounded border text-muted-foreground transition hover:bg-muted disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="flex size-6 items-center justify-center rounded border text-muted-foreground transition hover:bg-muted"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAdd}
                    className="h-11 flex-1 gap-2 border-border text-sm font-semibold hover:bg-muted cursor-pointer"
                  >
                    {justAdded ? (
                      <>
                        <Check className="size-4 text-emerald-600" />
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" />
                        Add to Cart • {currency}{product.price * quantity}
                      </>
                    )}
                  </Button>
                </div>

                {/* Prominent Dedicated Full Page CTA */}
                <div className="pt-2">
                  <Link
                    href={`/ebooks/${product.slug}`}
                    onClick={onClose}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/10 px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-primary-foreground shadow-sm"
                  >
                    <span>View Dedicated Product Page & Chapters</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {onOpenCart && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClose()
                        onOpenCart()
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      <ShoppingBag className="size-3.5 mr-1" />
                      View Cart & Checkout
                    </Button>
                  )}
                  <Link
                    href={`/ebooks/${product.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
                  >
                    Full Product Detail Page
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
