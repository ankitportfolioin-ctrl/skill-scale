'use client'

import { useState, FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Feather,
  Mail,
  MessageSquare,
  Sparkles,
  Tag,
  User,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BLOG_POSTS, type BlogPostItem } from '@/lib/ebooks-data'
import { Button } from '@/components/ui/button'

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState<string>('All')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  const allTags = ['All', 'Learning', 'Engineering', 'DRM-Free', 'Writing', 'Indie Authors']

  const filteredPosts = BLOG_POSTS.filter((post) => {
    if (selectedTag === 'All') return true
    return post.tags.includes(selectedTag)
  })

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterSubscribed(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Navbar */}
      <SiteHeader />

      <main className="flex-1">
        {/* 2. Header Section: Title & description of what readers can expect */}
        <section className="relative overflow-hidden border-b border-border bg-soft py-16 sm:py-20">
          <div className="hero-grid absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                <Feather className="size-3.5 text-highlight" />
                The SkillScale Reader & Author Journal
              </span>
              <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                Insights on Reading, Writing & Digital Publishing
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                Practical techniques for reading complex technical books, author interviews, behind-the-scenes engineering workflows, and essays on digital sovereignty.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Blog List Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Tag filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Filter:
              </span>
              {allTags.map((tag) => {
                const active = selectedTag === tag
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>

            {/* Articles Grid */}
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col rounded-3xl border border-border bg-card overflow-hidden shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                >
                  {/* Thumbnail Image */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="relative aspect-[16/10] w-full overflow-hidden bg-muted"
                  >
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-0.5 text-[11px] font-bold text-primary shadow">
                      {post.category}
                    </span>
                  </Link>

                  {/* Article Metadata & Excerpt */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {post.date}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className="mt-3 font-heading text-lg font-bold leading-snug text-foreground group-hover:text-primary transition line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Author Footnote */}
                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-2.5">
                        <div className="relative size-7 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={post.authorAvatar}
                            alt={post.author}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-foreground leading-tight">
                            {post.author}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{post.authorRole}</p>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition"
                      >
                        Read
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Newsletter Section: Receive new posts & e-book deals */}
        <section className="border-y border-border bg-primary py-16 text-primary-foreground">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Mail className="size-3.5" />
              Direct to Your Inbox
            </span>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Get Our Best Essays & Monthly E-Book Deals
            </h2>
            <p className="mt-3 text-sm sm:text-base text-indigo-200 max-w-xl mx-auto">
              Join over 25,000 developers, creators, and avid readers receiving our hand-crafted essays on modern architecture, reading strategies, and release promos.
            </p>

            <div className="mt-8 max-w-md mx-auto">
              {newsletterSubscribed ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 border border-white/20 p-4 text-emerald-300 text-sm font-semibold">
                  <Check className="size-5" />
                  Thanks for subscribing! Check your inbox for our reading framework guide.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-indigo-300 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                  />
                  <Button
                    type="submit"
                    className="h-12 bg-success text-success-foreground hover:bg-success/90 font-semibold px-6 shadow cursor-pointer"
                  >
                    Subscribe
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 5. Feature Section: Variety of Topics (Book reviews, author interviews) */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="size-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-primary">
                  In-Depth Book Reviews
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">
                  Honest, rigorous evaluations of technical literature, system architectures, and productivity frameworks. We dissect what works in production and what remains theoretical.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <MessageSquare className="size-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-primary">
                  Author & Practitioner Interviews
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">
                  Unvarnished discussions with leading authors, staff engineers, and indie researchers about their creative processes, tooling setups, and code verification routines.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Sparkles className="size-5" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-primary">
                  Reading Strategies & Note Systems
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-6 text-muted-foreground">
                  Tactical advice on managing digital libraries, taking high-leverage architectural notes, and applying technical books to solve real-world problems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Feature Section: Value of Expert Insights & Practical Advice */}
        <section className="border-t border-border bg-soft py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              The SkillScale Editorial Philosophy
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Written by Builders Who Actually Ship Code
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-7 text-muted-foreground">
              We never publish generic search-engine optimization fluff or AI-generated summaries. Every single article in our journal is written by an engineer, designer, or published author drawing directly from their daily production experience.
            </p>
          </div>
        </section>

        {/* 7. CTA Section: Encourage visitors to explore the full e-book catalog */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16 text-center lg:text-left lg:flex lg:items-center lg:justify-between shadow-xl">
            <div className="max-w-xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-4xl">
                Turn Reading Into Concrete Practical Results
              </h2>
              <p className="mt-3 text-sm leading-6 text-indigo-200">
                Explore our full catalog of DRM-free e-books with instant download, complete code samples, and lifetime updates.
              </p>
            </div>

            <div className="mt-8 shrink-0 lg:mt-0">
              <Link
                href="/ebooks"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-success px-6 text-sm font-semibold text-success-foreground shadow hover:bg-success/90 transition"
              >
                Browse Full E-Book Catalog
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
