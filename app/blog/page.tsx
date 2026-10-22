import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { listArticles } from '@/lib/journal'

export const revalidate = 300
export const metadata = { title: 'Blog | SkillScale', description: 'Articles from SkillScale.' }

export default async function BlogPage() {
  const articles = await listArticles()
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">Blog</h1>
        {articles.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No articles yet. Check back soon.
          </p>
        ) : (
          <ul className="mt-8 space-y-6">
            {articles.map((a) => (
              <li key={a.id} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs text-muted-foreground">
                  {[a.category, a.date, a.read_time].filter(Boolean).join(' • ')}
                </p>
                <h2 className="mt-2 font-heading text-xl font-bold">
                  <Link href={`/blog/${a.slug}`} className="hover:text-primary">{a.title}</Link>
                </h2>
                {a.excerpt && <p className="mt-2 text-sm leading-6 text-muted-foreground">{a.excerpt}</p>}
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
