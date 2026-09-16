import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Mail,
  Share2,
  Sparkles,
  Tag,
  User,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BLOG_POSTS, EBOOKS_CATALOG } from '@/lib/ebooks-data'
import { BlogPostInteractiveClient } from '@/components/blog-post-interactive-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  const relatedEbook = EBOOKS_CATALOG.find((b) => b.slug === post.relatedEbookSlug) || EBOOKS_CATALOG[0]
  const otherPosts = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 2)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 1. Navbar */}
      <SiteHeader />

      {/* Breadcrumb navigation */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex h-12 max-w-4xl items-center gap-2 px-4 text-xs text-muted-foreground sm:px-6">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary transition">
            Blog
          </Link>
          <span>/</span>
          <span className="truncate font-medium text-foreground">{post.title}</span>
        </div>
      </div>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-8"
        >
          <ArrowLeft className="size-3.5" />
          Back to all articles
        </Link>

        {/* 2. Blog Post Header Section: Title, Author, Date, Reading Time, Category, Featured Image */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {post.category}
            </span>
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-primary sm:text-5xl leading-[1.15]">
            {post.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg leading-7 text-muted-foreground">
            {post.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <div className="flex items-center gap-3">
              <div className="relative size-11 overflow-hidden rounded-full bg-muted">
                <Image
                  src={post.authorAvatar}
                  alt={post.author}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-foreground">{post.author}</p>
                <p className="text-xs text-muted-foreground">{post.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {post.date}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {post.readTime}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-muted shadow-lg">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 800px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        </header>

        {/* 3. Blog Post Body Section: Full article content with styled typography */}
        <article className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:text-primary prose-p:text-muted-foreground prose-p:leading-8 prose-p:text-base sm:prose-p:text-lg">
          {post.content.map((block, index) => {
            if (block.type === 'heading') {
              return (
                <h2
                  key={index}
                  className="mt-10 mb-4 font-heading text-2xl font-bold tracking-tight text-primary sm:text-3xl"
                >
                  {block.text}
                </h2>
              )
            }
            if (block.type === 'pullquote') {
              return (
                <blockquote
                  key={index}
                  className="my-8 rounded-2xl border-l-4 border-primary bg-primary/5 p-6 font-heading text-lg font-semibold italic text-primary sm:text-xl"
                >
                  “{block.text}”
                </blockquote>
              )
            }
            if (block.type === 'callout') {
              return (
                <div
                  key={index}
                  className="my-8 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 text-sm text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200"
                >
                  <Sparkles className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                  <div className="font-medium">{block.text}</div>
                </div>
              )
            }
            return (
              <p key={index} className="my-5 text-base sm:text-lg leading-8 text-muted-foreground">
                {block.text}
              </p>
            )
          })}
        </article>

        {/* Interactive CTA & Newsletter Box */}
        <BlogPostInteractiveClient
          relatedEbook={relatedEbook}
          postTitle={post.title}
        />

        {/* Read Next Section */}
        {otherPosts.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <h3 className="font-heading text-xl font-bold text-primary mb-6">
              More Articles from the SkillScale Journal
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {otherPosts.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-md"
                >
                  <span className="text-xs font-semibold text-primary">{item.category}</span>
                  <h4 className="mt-2 font-heading text-base font-bold group-hover:text-primary transition line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground line-clamp-2 flex-1">
                    {item.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Read article <ArrowRight className="size-3" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
