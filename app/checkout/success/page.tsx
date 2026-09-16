'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Download, Mail, ArrowRight } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || ''
  const token = searchParams.get('token') || ''

  const downloadLink = orderId
    ? `/download/${encodeURIComponent(orderId)}${token ? `?token=${encodeURIComponent(token)}` : ''}`
    : '/account'

  return (
    <div className="max-w-lg w-full text-center">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
        <CheckCircle2 className="size-8" />
      </div>
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
        Payment Confirmed
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Thanks for your purchase! Your DRM-free files are ready for instant download.
      </p>

      {orderId && (
        <div className="mt-6">
          <Link
            href={downloadLink}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
          >
            <Download className="size-4" />
            Open Instant Download Screen
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <Mail className="size-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">Check your inbox</p>
          <p className="mt-1 text-xs text-muted-foreground">
            A permanent copy of your download links was also sent to your email.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <Download className="size-5 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold text-foreground">DRM-Free Freedom</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Files in EPUB, PDF, and MOBI format with no proprietary reader requirements.
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          href="/ebooks"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Browse more e-books <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading confirmation...</div>}>
          <SuccessContent />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  )
}

