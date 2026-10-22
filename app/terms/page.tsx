import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = { title: 'Terms of Use | SkillScale' }

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">Terms of Use</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: 22 October 2026</p>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5">
<p>By buying or downloading from SkillScale you agree to these terms. Contact: <a href="mailto:ankit.portfolio.in@gmail.com">ankit.portfolio.in@gmail.com</a>.</p>
<h2>What you get</h2>
<p>A digital file for your own personal use. Files have no copy protection, and we trust you not to share or resell them.</p>
<h2>Prices and payment</h2>
<p>Prices are in Indian rupees and shown at checkout. Payments are processed by Razorpay.</p>
<h2>Delivery</h2>
<p>Your download is available on the download page right after checkout. If a file is missing or broken, email us and we will fix it.</p>
<h2>Content</h2>
<p>The books are for general information and learning. They are not professional, legal or financial advice, and we do not promise any particular result or income.</p>
<h2>Refunds</h2>
<p>See the <a href="/refunds">Refund Policy</a>.</p>
<h2>Changes</h2>
<p>We may update these terms. The date above shows the latest version.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
