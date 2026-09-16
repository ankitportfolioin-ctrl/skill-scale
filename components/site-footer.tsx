'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { Check, Mail, Globe2, ShieldCheck, Download, Sparkles, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SiteFooter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
  }

  return (
    <footer className="bg-primary text-primary-foreground/90 border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-white/[0.05] border border-white/10 p-6 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success">
                <Sparkles className="size-3.5" />
                Reader Newsletter
              </span>
              <h3 className="mt-2 font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Stay Ahead with New E-Book Releases
              </h3>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/80">
                Receive weekly author interviews, deep-dive chapter previews, and exclusive promo codes directly in your inbox. No spam, ever.
              </p>
            </div>

            <div className="mt-6 lg:mt-0 w-full max-w-md">
              {subscribed ? (
                <div className="flex items-center gap-3 rounded-2xl bg-success/20 border border-success/30 p-4 text-success-foreground">
                  <Check className="size-5 shrink-0 text-success" />
                  <div className="text-sm">
                    <p className="font-semibold text-white">You're on the list!</p>
                    <p className="text-xs text-primary-foreground/80">Check your inbox for a welcome code and curated reading list.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/70 pointer-events-none" />
                    <label htmlFor="footer-newsletter-email" className="sr-only">Email address for newsletter</label>
                    <input
                      id="footer-newsletter-email"
                      type="email"
                      required
                      value={email}
                      suppressHydrationWarning
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="h-12 w-full rounded-xl border border-white/20 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-primary-foreground/60 outline-none focus:border-success focus:ring-2 focus:ring-success/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 bg-success text-success-foreground hover:bg-success/90 font-semibold px-5 shrink-0 cursor-pointer shadow-md"
                  >
                    Subscribe Free
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand Info */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-white">
              <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-xl bg-primary text-xs font-bold text-white shadow-sm shrink-0 border border-white/15">
                <Image
                  src="/brand-logo.png"
                  alt="SkillScale Logo"
                  width={36}
                  height={36}
                  className="size-full object-cover rounded-xl"
                />
              </span>
              <span className="font-heading text-xl font-bold tracking-tight">
                SkillScale E-Books
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-primary-foreground/80">
              A curated digital library of high-impact technical guides, AI architectures, design tokens, systems engineering, self-help manuals, and speculative fiction. 100% DRM-free with lifetime updates.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-primary-foreground/70">
              <span className="inline-flex items-center gap-1">
                <Download className="size-3.5 text-success" /> Instant Download
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-success" /> 14-Day Guarantee
              </span>
            </div>
          </div>

          {/* Navigation Column 1: Store & Catalog */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              E-Book Catalog
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-primary-foreground/80">
              <li>
                <Link href="/ebooks" className="hover:text-white transition">
                  Browse Catalog
                </Link>
              </li>
              <li>
                <Link href="/ebooks?genre=Technical+Guides" className="hover:text-white transition">
                  Technical Guides
                </Link>
              </li>
              <li>
                <Link href="/ebooks?genre=AI+%26+Prompting" className="hover:text-white transition">
                  AI & Prompting
                </Link>
              </li>
              <li>
                <Link href="/ebooks?genre=Design+%26+Tokens" className="hover:text-white transition">
                  Design & Tokens
                </Link>
              </li>
              <li>
                <Link href="/ebooks?genre=Systems+%26+DevOps" className="hover:text-white transition">
                  Systems & DevOps
                </Link>
              </li>
              <li>
                <Link href="/ebooks?genre=Self-Help" className="hover:text-white transition">
                  Self-Help
                </Link>
              </li>
              <li>
                <Link href="/ebooks?genre=Speculative" className="hover:text-white transition">
                  Speculative
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Company & Articles */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-primary-foreground/80">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#mission" className="hover:text-white transition">
                  Our Mission & Story
                </Link>
              </li>
              <li>
                <Link href="/about#team" className="hover:text-white transition">
                  Meet the Team
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Reading & Publishing Blog
                </Link>
              </li>
              <li>
                <Link href="/about#testimonials" className="hover:text-white transition">
                  Author & Reader Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Support & Formats */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Reader Support
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-primary-foreground/80">
              <li>
                <Link href="/ebooks#drm-free" className="hover:text-white transition">
                  DRM-Free Promise
                </Link>
              </li>
              <li>
                <Link href="/ebooks#pricing" className="hover:text-white transition">
                  Membership & Bundles
                </Link>
              </li>
              <li>
                <a href="mailto:support@skillscale.dev" className="hover:text-white transition">
                  support@skillscale.dev
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition inline-flex items-center gap-1">
                  CMS Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-primary-foreground/70">
          <p>© {new Date().getFullYear()} SkillScale E-Book Store. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/ebooks" className="hover:text-white transition">
              Browse Catalog
            </Link>
            <Link href="/about" className="hover:text-white transition">
              Our Story
            </Link>
            <Link href="/blog" className="hover:text-white transition">
              Articles
            </Link>
            <Link href="/admin" className="hover:text-white transition">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
