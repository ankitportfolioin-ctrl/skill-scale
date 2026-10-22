import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = { title: 'Privacy Policy | SkillScale' }

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: 22 October 2026</p>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5">
<p>SkillScale is run by an individual in India. This page explains what we collect and why. Contact: <a href="mailto:ankit.portfolio.in@gmail.com">ankit.portfolio.in@gmail.com</a>.</p>
<h2>What we collect</h2>
<ul><li>Your email address, when you check out, download a free title or create an account.</li>
<li>Order details: what you bought, the amount, and the payment status.</li>
<li>Account details if you sign up (email and a password, which we never see in plain form).</li></ul>
<p>We do not store your card or UPI details. Payments are handled by Razorpay.</p>
<h2>Why we use it</h2>
<p>To deliver your download, show you your orders, answer your emails and keep the store secure.</p>
<h2>Who processes it</h2>
<ul><li>Razorpay, for payments.</li><li>Supabase, for our database, accounts and file storage.</li><li>Vercel, for hosting the website.</li><li>Resend, for sending the emails we send you.</li></ul>
<p>We do not sell your data.</p>
<h2>Your choices</h2>
<p>Email us to see, correct or delete the data we hold about you. We may need to keep order records for as long as the law requires.</p>
<h2>Changes</h2>
<p>If this page changes, the date above changes.</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
