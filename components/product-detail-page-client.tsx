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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/cms/content'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'

interface Props {
  product: Product
  currency: string
  relatedProducts: Product[]
}

export function ProductDetailPageClient({ product, currency, relatedProducts }: Props) {
  const { cartCount, openCart, addToCart: globalAddToCart, showNotice } = useCart()
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
      {/* Floating cart trigger */}
      <div className="fixed right-6 top-20 z-40">
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
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Left Column: Media & Specs */}
        <div className="space-y-6 lg:col-span-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-muted p-4 shadow-sm">
            <Image
              src={formatGoogleDriveImageUrl(product.image)}
              alt={product.imageAlt || product.title}
              fill
              priority
              unoptimized={product.image.startsWith('data:') || product.image.startsWith('http') || product.image.startsWith('//')}
              sizes="(max-width: 1024px) 100vw, 550px"
              className={product.portrait ? 'object-contain p-4' : 'object-cover'}
            />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-highlight px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-highlight-foreground shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-soft p-5 text-sm">
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

          <div className="flex items-center justify-between rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
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
        <div className="space-y-6 lg:col-span-6">
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
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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

          <div className="flex items-baseline gap-3 rounded-2xl bg-secondary/50 p-5">
            <span className="font-heading text-4xl font-bold text-foreground">
              {currency}{product.price}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {currency}{product.compareAtPrice}
                </span>
                {discountPercent && (
                  <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
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
                onClick={() => handleAddToCart(product, quantity)}
                className="h-12 flex-1 gap-2 bg-success text-base font-semibold text-success-foreground shadow-md hover:bg-success/90 cursor-pointer"
              >
                {justAdded ? (
                  <>
                    <Check className="size-5" />
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

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleAddToCart(product, quantity)
                openCart()
              }}
              className="h-11 w-full gap-2 text-sm cursor-pointer"
            >
              <ShoppingBag className="size-4" />
              Instant Checkout Preview
            </Button>
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
                <div className="relative aspect-[4/3] bg-muted p-4">
                  <Image
                    src={formatGoogleDriveImageUrl(item.image)}
                    alt={item.title}
                    fill
                    unoptimized={item.image.startsWith('data:') || item.image.startsWith('http') || item.image.startsWith('//')}
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
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
