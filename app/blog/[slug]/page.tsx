import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getArticle, articleParagraphs } from '@/lib/journal'

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await getArticle((await params).slug)
  return a ? { title: `${a.title} | SkillScale`, description: a.excerpt ?? undefined } : { title: 'Blog | SkillScale' }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticle((await params).slug)
  if (!article) notFound()
  const blocks = articleParagraphs(article.content)
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">← All articles</Link>
        <h1 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">{article.title}</h1>
        <p className="mt-3 text-xs text-muted-foreground">
          {[article.author, article.date, article.read_time].filter(Boolean).join(' • ')}
        </p>
        <div className="mt-8 space-y-5 text-base leading-8">
          {blocks.map((b, i) =>
            b.heading ? (
              <h2 key={i} className="pt-4 font-heading text-xl font-bold text-primary">{b.text}</h2>
            ) : (
              <p key={i}>{b.text}</p>
            ),
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
