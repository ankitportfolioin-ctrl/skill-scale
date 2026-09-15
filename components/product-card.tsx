'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/cms/content'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'

export function ProductCard({
  product,
  currency,
  onAdd,
  onSelect,
}: {
  product: Product
  currency: string
  onAdd: (product: Product) => void
  onSelect?: (product: Product) => void
}) {
  return (
    <article
      tabIndex={0}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_45px_-22px_rgba(49,46,129,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Link
        href={`/ebooks/${product.slug}`}
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted p-5 cursor-pointer block"
      >
        <Image
          src={formatGoogleDriveImageUrl(product.image)}
          alt={product.imageAlt}
          fill
          unoptimized={product.image.startsWith('data:') || product.image.startsWith('http') || product.image.startsWith('//')}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={product.portrait ? 'object-contain p-5 transition duration-500 group-hover:scale-[1.03]' : 'object-cover transition duration-500 group-hover:scale-[1.03]'}
        />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-highlight px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-highlight-foreground shadow-sm">
            {product.badge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold uppercase tracking-[0.12em] text-primary">{product.category}</span>
          <span className="text-muted-foreground">{product.format}</span>
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary transition-colors">
            <Link href={`/ebooks/${product.slug}`} className="hover:underline">
              {product.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">by {product.creator}</p>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-auto flex items-center gap-1.5 pt-1 text-sm">
          <Star aria-hidden="true" className="size-4 fill-highlight text-highlight" />
          <span className="font-semibold text-foreground">{product.rating}</span>
          <span className="text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-xl font-bold text-foreground">
              {currency}{product.price}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {currency}{product.compareAtPrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/ebooks/${product.slug}`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-semibold text-foreground transition hover:bg-muted hover:text-primary"
            >
              Details
            </Link>
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onAdd(product)
              }}
              className="h-9 bg-success px-3 text-xs text-success-foreground hover:bg-success/90"
            >
              <Plus data-icon="inline-start" className="size-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
