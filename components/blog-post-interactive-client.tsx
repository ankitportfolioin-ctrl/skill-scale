'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Check,
  Download,
  Mail,
  ShoppingBag,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import type { EbookItem } from '@/lib/ebooks-data'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'

interface BlogPostInteractiveClientProps {
  relatedEbook: EbookItem
  postTitle: string
}

export function BlogPostInteractiveClient({
  relatedEbook,
  postTitle,
}: BlogPostInteractiveClientProps) {
  const { addToCart } = useCart()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
  }

  return (
    <div className="mt-14 space-y-10">
      {/* 4. CTA Section: Related E-Book Showcase */}
      <section className="rounded-3xl border border-border bg-soft p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <BookOpen className="size-4 text-highlight" />
          Recommended Companion E-Book
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative aspect-[3/4] w-32 shrink-0 overflow-hidden rounded-xl bg-muted shadow-md">
            <Image
              src={relatedEbook.image}
              alt={relatedEbook.imageAlt}
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-xs font-semibold text-muted-foreground">
              {relatedEbook.category} • By {relatedEbook.author}
            </span>
            <h3 className="mt-1 font-heading text-xl font-bold text-primary">
              {relatedEbook.title}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-6">
              {relatedEbook.shortDescription}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-xl font-bold text-foreground">
                  ${relatedEbook.price}
                </span>
                {relatedEbook.compareAtPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${relatedEbook.compareAtPrice}
                  </span>
                )}
              </div>

              <Button
                type="button"
                onClick={() => addToCart(relatedEbook)}
                className="h-10 bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingBag className="mr-1.5 size-4" />
                Add to Cart (Instant Download)
              </Button>

              <Link
                href={`/ebooks/${relatedEbook.slug}`}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                View full chapters <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Newsletter Section: Offer a subscription prompt for future blog posts */}
      <section className="rounded-3xl bg-primary p-6 text-primary-foreground sm:p-10 shadow-lg">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
            <Mail className="size-4" />
            Stay Updated
          </span>
          <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Never Miss a Practical Deep-Dive
          </h3>
          <p className="mt-2 text-xs sm:text-sm leading-6 text-indigo-200">
            Subscribe to get newly published articles, architectural breakdowns, and reader discounts sent directly to your inbox every two weeks.
          </p>

          <div className="mt-6 max-w-md mx-auto">
            {subscribed ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 border border-white/20 p-4 text-emerald-300 text-xs sm:text-sm font-semibold">
                <Check className="size-4 shrink-0" />
                Thank you! You're subscribed to new article releases.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <label htmlFor="blog-newsletter-email" className="sr-only">Email address for article updates</label>
                <input
                  id="blog-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="h-11 flex-1 rounded-xl border border-white/20 bg-white/10 px-3.5 text-sm text-white placeholder:text-indigo-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                />
                <Button
                  type="submit"
                  className="h-11 bg-success text-success-foreground hover:bg-success/90 font-semibold px-5 shadow cursor-pointer text-xs"
                >
                  Subscribe
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
