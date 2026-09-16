'use client'

import Image from 'next/image'
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/cms/content'
import { formatGoogleDriveImageUrl } from '@/lib/cms/drive'
import { BookCoverImage } from '@/components/ui/book-cover-image'

export type CartLine = { product: Product; quantity: number }

type CartDrawerProps = {
  open: boolean
  items: CartLine[]
  onClose: () => void
  onIncrease: (id: string) => void
  onDecrease: (id: string) => void
  onRemove: (id: string) => void
  onCheckout: () => void
  currency?: string
}

export function CartDrawer({ open, items, onClose, onIncrease, onDecrease, onRemove, onCheckout, currency = '₹' }: CartDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const subtotal = items.reduce((total, line) => total + line.product.price * line.quantity, 0)

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <button type="button" aria-label="Close cart" className="absolute inset-0 bg-foreground/35 backdrop-blur-[2px]" onClick={onClose} />
      <section className="absolute inset-y-0 right-0 flex w-full max-w-full sm:max-w-md flex-col bg-background shadow-2xl animate-in slide-in-from-right duration-300">
        <header className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/8 text-primary">
              <ShoppingBag aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h2 id="cart-title" className="font-heading text-lg font-semibold">Your cart</h2>
              <p className="text-xs text-muted-foreground">Demo cart · no payment will be taken</p>
            </div>
          </div>
          <Button autoFocus type="button" size="icon" variant="ghost" onClick={onClose} aria-label="Close cart">
            <X />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {items.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShoppingBag aria-hidden="true" className="size-6" />
              </span>
              <div>
                <h3 className="font-heading font-semibold">Your cart is ready when you are</h3>
                <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">Browse the collection and add a practical resource to get started.</p>
              </div>
              <Button type="button" variant="outline" className="h-10 px-4" onClick={onClose}>Continue browsing</Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4 border-b pb-5">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <BookCoverImage
                      src={product.image}
                      alt={product.title}
                      title={product.title}
                      author={product.creator}
                      category={product.category}
                      fill
                      unoptimized
                      sizes="80px"
                      portrait={product.portrait}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="truncate text-sm font-semibold">{product.title}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">{product.format}</p>
                      </div>
                      <button type="button" onClick={() => onRemove(product.id)} aria-label={`Remove ${product.title}`} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border">
                        <button type="button" onClick={() => onDecrease(product.id)} aria-label={`Decrease quantity of ${product.title}`} className="flex size-8 items-center justify-center rounded-l-lg transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Minus aria-hidden="true" className="size-3.5" /></button>
                        <span className="min-w-7 text-center text-sm font-medium" aria-label={`Quantity ${quantity}`}>{quantity}</span>
                        <button type="button" onClick={() => onIncrease(product.id)} aria-label={`Increase quantity of ${product.title}`} className="flex size-8 items-center justify-center rounded-r-lg transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Plus aria-hidden="true" className="size-3.5" /></button>
                      </div>
                      <span className="font-heading font-semibold">{currency}{product.price * quantity}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t bg-muted/40 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-heading text-xl font-bold">{currency}{subtotal}</span>
            </div>
            <Button type="button" onClick={onCheckout} className="h-12 w-full bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700 shadow-md">
              Instant DRM-Free Checkout &rarr;
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-emerald-600" />
              Secure 256-Bit Razorpay Checkout · No Pre-Registration Required
            </p>
          </footer>
        )}
      </section>
    </div>
  )
}
