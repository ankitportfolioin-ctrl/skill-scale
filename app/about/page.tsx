import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = { title: 'About | SkillScale', description: 'What SkillScale is and who to contact.' }

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">About SkillScale</h1>
        <div className="mt-6 space-y-4 text-base leading-8 text-muted-foreground">
          <p>
            SkillScale is a small independent store for practical e-books on building with AI tools and turning that
            skill into paid work. It is run by one person, and the catalog is small on purpose.
          </p>
          <p>
            Every book is a plain, DRM-free download that you get right after checkout. Some titles are free; the
            rest are priced in Indian rupees.
          </p>
          <p>
            Questions, a problem with a file, or a refund request: write to{' '}
            <a className="text-primary underline" href="mailto:ankit.portfolio.in@gmail.com">ankit.portfolio.in@gmail.com</a>.
          </p>
          <p>
            <Link href="/ebooks" className="font-semibold text-primary hover:underline">Browse the books →</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
