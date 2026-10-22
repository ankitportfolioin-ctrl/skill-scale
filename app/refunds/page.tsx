import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = { title: 'Refund Policy | SkillScale' }

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">Refund Policy</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: 22 October 2026</p>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5">
<p>Digital files cannot be returned, so refunds work like this. Contact: <a href="mailto:ankit.portfolio.in@gmail.com">ankit.portfolio.in@gmail.com</a>.</p>
<h2>When we refund</h2>
<ul><li>The file is missing, corrupted or is not the book you bought, and we cannot fix it.</li>
<li>You were charged twice for the same order.</li></ul>
<p>Ask within 7 days of purchase and include your order number and the email you used.</p>
<h2>When we do not</h2>
<p>Changing your mind after downloading a working file is not a reason for a refund.</p>
<h2>How</h2>
<p>Approved refunds go back to your original payment method through Razorpay. Your bank may take several working days to show it.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
