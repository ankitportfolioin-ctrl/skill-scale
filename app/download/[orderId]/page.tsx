'use client'

import React, { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Download,
  BookOpen,
  Layers,
  Smartphone,
  CheckCircle2,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  FileArchive,
  ExternalLink,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

interface FormatItem {
  format: string
  label: string
  description: string
  size: string
  ready: boolean
  downloadUrl: string
}

interface DownloadItem {
  id: string
  title: string
  author?: string
  category?: string
  image?: string
  shortDescription?: string
  zipDownloadUrl: string
  formats: FormatItem[]
}

interface OrderDownloadData {
  orderId: string
  customerEmail: string
  status: string
  total: number
  date: string
  items: DownloadItem[]
  verified: boolean
}

export default function OrderDownloadPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = use(params)
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [data, setData] = useState<OrderDownloadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDownloads() {
      try {
        setLoading(true)
        setError(null)
        const url = `/api/orders/${encodeURIComponent(orderId)}/downloads?token=${encodeURIComponent(token)}`
        const res = await fetch(url)
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Unable to verify order downloads.')
        }
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err?.message || 'Could not load downloads for this order.')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchDownloads()
    }
  }, [orderId, token])

  const getFormatIcon = (format: string) => {
    switch (format.toUpperCase()) {
      case 'EPUB':
        return BookOpen
      case 'PDF':
        return Layers
      case 'MOBI':
        return Smartphone
      case 'ZIP':
      default:
        return FileArchive
    }
  }

  const handleDownload = (format: string, url: string, title: string) => {
    setDownloadingFormat(`${title}-${format}`)
    // Trigger download in a standard direct way
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      setDownloadingFormat(null)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Status Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="size-3.5" />
              Checkout Complete • DRM-Free Access Active
            </div>

            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Your E-Books Are Ready to Download
            </h1>

            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              No DRM, no reader apps, no waiting. Download your files below in any format,
              or transfer them directly to your Kindle, tablet, or e-reader.
            </p>

            {data?.customerEmail && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-muted/60 border border-border px-3.5 py-1.5 text-xs text-muted-foreground">
                <Mail className="size-3.5 text-primary" />
                <span>
                  Access verified for{' '}
                  <strong className="text-foreground font-semibold">{data.customerEmail}</strong>
                </span>
                <span className="text-border">•</span>
                <span>Order #{orderId.slice(-8).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mt-12 rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
              <RefreshCw className="mx-auto size-8 text-primary animate-spin" />
              <p className="mt-4 font-semibold text-foreground">Preparing your DRM-free package...</p>
              <p className="mt-1 text-xs text-muted-foreground">Signing direct CDN download keys</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="mt-12 rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center text-rose-900 shadow-sm">
              <p className="font-semibold text-base">Unable to load downloads</p>
              <p className="mt-1 text-xs text-rose-700">{error}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                If your payment was completed, check your inbox for backup links or contact support with Order #{orderId}.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
              >
                Return to Store
              </Link>
            </div>
          )}

          {/* Main Download Screen */}
          {!loading && data && data.items && (
            <div className="mt-10 space-y-8">
              {data.items.map((book) => (
                <div
                  key={book.id}
                  className="rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8 overflow-hidden transition"
                >
                  {/* Visual Mockup Card Header (Matching Marketplace Design) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <Download className="size-6" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                            {book.category || 'Digital Edition'}
                          </span>
                          <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                            100% DRM-FREE
                          </span>
                        </div>
                        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl mt-0.5">
                          {book.title}
                        </h2>
                        {book.author && (
                          <p className="text-xs text-muted-foreground">By {book.author}</p>
                        )}
                      </div>
                    </div>

                    {book.zipDownloadUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownload('ZIP', book.zipDownloadUrl, book.title)}
                        disabled={downloadingFormat === `${book.title}-ZIP`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-[0.98] disabled:opacity-75"
                      >
                        <FileArchive className="size-4" />
                        {downloadingFormat === `${book.title}-ZIP`
                          ? 'Starting Download...'
                          : 'Download All (.ZIP Bundle)'}
                      </button>
                    )}
                  </div>

                  {/* Format List (The exact "Instant Download Screen" UI) */}
                  <div className="mt-6 space-y-3">
                    {book.formats.map((file) => {
                      const Icon = getFormatIcon(file.format)
                      const isDownloading = downloadingFormat === `${book.title}-${file.format}`

                      return (
                        <div
                          key={file.format}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-4 transition hover:bg-muted/50 hover:border-primary/20"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="mt-0.5 sm:mt-0 flex size-9 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-primary shadow-2xs group-hover:scale-105 transition">
                              <Icon className="size-4" />
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-foreground">
                                  {file.label}
                                </p>
                                <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                  Ready
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {file.description} •{' '}
                                <span className="font-semibold text-foreground/80">{file.size}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => handleDownload(file.format, file.downloadUrl, book.title)}
                              disabled={isDownloading}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground hover:bg-muted hover:border-primary/40 hover:text-primary transition shadow-2xs active:scale-[0.98] disabled:opacity-75"
                            >
                              <Download className={`size-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                              <span>{isDownloading ? 'Downloading...' : `Download ${file.format}`}</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Informational Cards: Delivery & Password Setup (Optional) */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Email Confirmation Card */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Mail className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-foreground">
                      Backup Sent to Your Inbox
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      We sent download links and your receipt to{' '}
                      <strong className="text-foreground">{data.customerEmail}</strong>. You can re-open
                      this download page anytime directly from that email.
                    </p>
                  </div>
                </div>

                {/* Password / Multi-Device Access Card */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <KeyRound className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-foreground">
                      Multi-Device Access (Optional)
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      No password is required to enjoy your books. If you&apos;d like to sign in across other
                      devices or view past orders, check your email for the optional password setup link, or log in with a Magic Link anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* DRM-Free Explainer Banner */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 flex items-start gap-3.5 text-xs text-emerald-900 dark:text-emerald-200">
                <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold">You own your copies unconditionally:</strong> Zero watermarks,
                  no restrictive reader software, and no telemetry. You can back up these files to Dropbox or Google Drive, email them to your personal Kindle address, or read them on Calibre, Apple Books, and reMarkable.
                </div>
              </div>

              {/* Navigation Back */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Link
                  href="/ebooks"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <ArrowRight className="size-3.5 rotate-180" /> Browse More Books
                </Link>

                <Link
                  href="/account"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Go to My Account <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
