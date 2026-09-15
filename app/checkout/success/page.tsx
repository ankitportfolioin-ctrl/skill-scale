import Link from 'next/link'
import { CheckCircle2, Download, Mail } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'Order Confirmed — SkillScale',
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
            Payment confirmed
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Thanks for your order! We're preparing your DRM-free files now — this usually
            takes just a few seconds after payment.
          </p>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <Mail className="size-5 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-900">Check your inbox</p>
              <p className="mt-1 text-xs text-slate-500">
                Your download links are on their way to your email.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <Download className="size-5 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-900">Or download right here</p>
              <p className="mt-1 text-xs text-slate-500">
                Your files also appear under My Account → Purchases &amp; Downloads.
              </p>
            </div>
          </div>

          <Link
            href="/ebooks"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
          >
            Continue browsing
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
