'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  Copy,
  Download,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/cms/content'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'
import { ProductCoverImage } from '@/components/product-cover-image'

interface Props {
  product: Product
  currency: string
  relatedProducts: Product[]
}

export function ProductDetailPageClient({ product, currency = '₹', relatedProducts }: Props) {
  const { cartCount, openCart, openCheckout, addToCart: globalAddToCart, showNotice } = useCart()
  const [quantity, setQuantity] = React.useState(1)
  const [justAdded, setJustAdded] = React.useState(false)
  const [copiedLink, setCopiedLink] = React.useState(false)

  const handleAddToCart = (item: Product, qty: number = 1) => {
    globalAddToCart(item, qty)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  const handleCopyLink = () => {
    if (!navigator.clipboard?.writeText) return
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }).catch(() => undefined)
  }

  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null

  return (
    <div>
      {/* Floating cart trigger - placed at bottom right so it never overlaps header navigation */}
      <div className="fixed right-4 bottom-6 z-40 sm:right-6 sm:bottom-8">
        <Button
          type="button"
          onClick={openCart}
          className="relative flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 cursor-pointer"
          aria-label={`Open cart with ${cartCount} items`}
        >
          <ShoppingBag className="size-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-success text-[10px] font-bold text-success-foreground shadow">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Main product showcase */}
      <div className="grid gap-6 md:grid-cols-12 md:gap-8 lg:gap-12">
        {/* Left Column: Media & Specs */}
        <div className="space-y-4 sm:space-y-6 md:col-span-5 lg:col-span-6 max-w-[320px] sm:max-w-md mx-auto md:max-w-none w-full">
          <ProductCoverImage
            src={product.image}
            alt={product.imageAlt || product.title}
            title={product.title}
            author={product.creator}
            category={product.category}
            variant="detail"
            priority
            badge={product.badge}
            className="rounded-2xl border shadow-sm"
          />

          <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-soft p-4 sm:p-5 text-sm">
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Format</span>
              <span className="mt-1 font-semibold text-foreground">{product.format}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">License</span>
              <span className="mt-1 font-semibold text-foreground">{product.license}</span>
            </div>
            <div className="col-span-2 border-t pt-3 mt-1">
              <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">Requirements</span>
              <span className="mt-1 font-semibold text-foreground">{product.requirements}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" />
              14-day satisfaction guarantee
            </span>
            <span className="inline-flex items-center gap-2">
              <Download className="size-4 text-primary" />
              Instant digital download
            </span>
          </div>
        </div>

        {/* Right Column: Info & Action */}
        <div className="space-y-6 md:col-span-7 lg:col-span-6 min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {product.category}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="gap-1.5 text-xs text-muted-foreground"
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
            </div>
            <h1 className="mt-2 font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground break-words">
              {product.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                by <strong className="font-semibold text-foreground">{product.creator}</strong>
                <BadgeCheck className="size-4 text-primary" />
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

          <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 rounded-2xl bg-secondary/50 p-4 sm:p-5">
            <span className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              {currency}{product.price}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-sm sm:text-base text-muted-foreground line-through">
                  {currency}{product.compareAtPrice}
                </span>
                {discountPercent && (
                  <span className="rounded-full bg-success/15 px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs font-bold text-success">
                    Save {discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p className="text-base font-medium text-foreground">{product.shortDescription}</p>
            <p>{product.description}</p>
          </div>

          {product.features && product.features.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                What&apos;s Included
              </h2>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 text-sm">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="size-4 shrink-0 text-success mt-1" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Row */}
          <div className="space-y-3 pt-2">
            {/* Primary Checkout-First CTA */}
            <Button
              type="button"
              onClick={() => openCheckout(product)}
              className="h-12 w-full gap-2 bg-emerald-600 text-base font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition cursor-pointer"
            >
              <Zap className="size-5" />
              Get Instant Access • {currency}{product.price}
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center justify-between rounded-xl border bg-background px-4 py-2.5 sm:w-36">
                <span className="text-xs text-muted-foreground">Qty:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex size-7 items-center justify-center rounded border text-muted-foreground transition hover:bg-muted disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex size-7 items-center justify-center rounded border text-muted-foreground transition hover:bg-muted"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddToCart(product, quantity)}
                className="h-12 flex-1 gap-2 text-sm font-semibold cursor-pointer border-border hover:bg-muted"
              >
                {justAdded ? (
                  <>
                    <Check className="size-5 text-emerald-600" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <Plus className="size-5" />
                    Add to Cart • {currency}{product.price * quantity}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t pt-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            You might also like
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:shadow-md"
              >
                <ProductCoverImage
                  src={item.image}
                  alt={item.title}
                  title={item.title}
                  author={item.creator}
                  category={item.category}
                  variant="card"
                />
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {item.category}
                  </span>
                  <Link
                    href={`/product/${item.slug}`}
                    className="mt-1 font-heading text-base font-semibold text-foreground hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {item.shortDescription}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="font-heading text-lg font-bold">
                      {currency}{item.price}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddToCart(item, 1)}
                      className="bg-success text-success-foreground hover:bg-success/90 cursor-pointer"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
