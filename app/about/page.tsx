import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'About | SkillScale',
  description: 'SkillScale publishes practical e-books on AI tools, careers, data skills, freelancing and small business, for readers in India.',
}

const series = [
  ['The AI Job Hunt Playbook (India)', 'Resume, applications, interviews and offers.'],
  ['Prompting for Work', 'Reliable results from AI assistants for everyday tasks.'],
  ['Excel & SQL with AI', 'Spreadsheets, SQL and dashboards for entry-level analyst work.'],
  ['Freelancing From India', 'Choose a service, find clients and get paid.'],
  ['AI for Small Business Owners', 'Practical AI for shops, clinics, kitchens and local services.'],
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">About SkillScale</h1>
        <div className="mt-6 space-y-4 text-base leading-8 text-muted-foreground">
          <p>
            SkillScale is a small independent store for practical e-books. We write short, step-by-step guides on using
            AI tools at work, getting a job, learning data skills, freelancing and running a small business, with
            examples from the Indian market.
          </p>

          <h2 className="pt-4 font-heading text-xl font-bold text-foreground">What we publish</h2>
          <ul className="list-disc space-y-2 pl-6">
            {series.map(([name, line]) => (
              <li key={name}><span className="font-semibold text-foreground">{name}</span>: {line}</li>
            ))}
          </ul>
          <p>Each series has three parts, so you can start with one and buy the next only if it helps.</p>

          <h2 className="pt-4 font-heading text-xl font-bold text-foreground">How we work</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>The books are written with the help of AI tools and edited for clarity and accuracy.</li>
            <li>We do not promise income, jobs or clients. The books teach methods; results depend on your effort.</li>
            <li>We do not publish made-up reviews or sales numbers.</li>
            <li>Every book is a plain, DRM-free PDF you can read on any device.</li>
          </ul>

          <h2 className="pt-4 font-heading text-xl font-bold text-foreground">Get in touch</h2>
          <p>
            Questions, a problem with a file, or a refund request: write to{' '}
            <a className="text-primary underline" href="mailto:ankit.portfolio.in@gmail.com">ankit.portfolio.in@gmail.com</a>.
            Our <Link href="/refunds" className="text-primary underline">refund policy</Link> explains how refunds work.
          </p>
          <p className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/ebooks" className="font-semibold text-primary hover:underline">Browse the books →</Link>
            <Link href="/blog" className="font-semibold text-primary hover:underline">Read the blog →</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
