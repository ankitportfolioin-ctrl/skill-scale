'use client'

import { useState, useEffect } from 'react'
import {
  Check,
  Copy,
  Database,
  ExternalLink,
  FileUp,
  HardDrive,
  Loader2,
  RefreshCw,
  Server,
  UploadCloud,
  AlertCircle,
  FileCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminCard } from './admin-fields'
import { type SiteContent } from '@/lib/cms/content'
import {
  testSupabaseStatus,
  saveProductToSupabase,
  uploadEbookFileToSupabase,
  getSupabaseSetupSQL,
  type SupabaseDiagnostics,
  fetchProductsFromSupabase,
} from '@/lib/supabase/products-service'

export function SupabaseManager({ content }: { content: SiteContent }) {
  const [diagnostics, setDiagnostics] = useState<SupabaseDiagnostics | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState('')
  const [copiedSql, setCopiedSql] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [copiedUrl, setCopiedUrl] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const diag = await testSupabaseStatus()
      setDiagnostics(diag)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  const handleSyncAllToSupabase = async () => {
    if (!content.products || content.products.length === 0) {
      window.alert('No products available in the catalog to sync.')
      return
    }

    try {
      setIsSyncing(true)
      setSyncStatus(`Syncing 0 / ${content.products.length} items to Supabase...`)

      let successCount = 0
      let failedCount = 0
      let firstError = ''

      for (let i = 0; i < content.products.length; i++) {
        const prod = content.products[i]
        setSyncStatus(`Syncing item ${i + 1} of ${content.products.length}: “${prod.title}”...`)
        const res = await saveProductToSupabase(prod)
        if (res.success) {
          successCount++
        } else {
          failedCount++
          if (!firstError) firstError = res.error || 'Unknown error'
        }
      }

      await checkConnection()

      if (failedCount === 0) {
        setSyncStatus(`Successfully stored all ${successCount} e-books and guides in Supabase!`)
      } else {
        setSyncStatus(
          `Synced ${successCount} items. ${failedCount} failed (${firstError}). If the table does not exist, run the SQL script below first.`
        )
      }
    } catch (err: any) {
      setSyncStatus('Sync encountered an error: ' + (err?.message || 'Error'))
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(getSupabaseSetupSQL())
      setCopiedSql(true)
      setTimeout(() => setCopiedSql(false), 3000)
    } catch {
      // Fallback
    }
  }

  const handleFileUpload = async (file?: File) => {
    setUploadError('')
    setUploadedUrl('')
    if (!file) return

    try {
      setIsUploading(true)
      const res = await uploadEbookFileToSupabase(file, 'ebooks', 'files')
      if (res.success && res.url) {
        setUploadedUrl(res.url)
      } else {
        setUploadError(
          res.error || 'Failed to upload to bucket. Ensure the "ebooks" storage bucket exists.'
        )
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!uploadedUrl) return
    await navigator.clipboard.writeText(uploadedUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2500)
  }

  const sqlCode = getSupabaseSetupSQL()

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#3ecf8e]/20 text-[#3ecf8e]">
              <Database className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Supabase Connection &amp; Storage</h2>
              <p className="text-xs text-muted-foreground">
                Connected to <span className="font-mono font-medium text-foreground">wxtzacrsjkypfsejnifc.supabase.co</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={checkConnection}
              disabled={isChecking}
              className="h-9"
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${isChecking ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
            <a
              href="https://supabase.com/dashboard/project/wxtzacrsjkypfsejnifc"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-semibold hover:bg-muted"
            >
              Supabase Dashboard
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Diagnostics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Connection
            </span>
            <Server className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`size-2.5 rounded-full ${
                diagnostics?.connected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className="font-semibold text-sm">
              {diagnostics?.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate">
            {diagnostics?.url || 'https://wxtzacrsjkypfsejnifc.supabase.co'}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Products Table
            </span>
            <HardDrive className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            {diagnostics?.tableExists ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <FileCheck className="size-4" /> Ready in Postgres
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <AlertCircle className="size-4" /> Not created yet
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {diagnostics?.tableExists
              ? `${diagnostics.productCount} e-books stored`
              : 'Run SQL migration below'}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Catalog Items
            </span>
            <Database className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {content.products.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Ready to store &amp; sync</p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Storage Bucket
            </span>
            <FileUp className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {diagnostics?.buckets.length
              ? diagnostics.buckets.join(', ')
              : 'ebooks'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">For PDFs &amp; Digital Files</p>
        </div>
      </div>

      {/* Sync All E-books & Guides Button */}
      <AdminCard
        title="Store E-Books & Guides in Supabase"
        description="Upsert all e-books, guides, and digital packages from your store into the Supabase products table."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleSyncAllToSupabase}
              disabled={isSyncing}
              className="bg-[#3ecf8e] text-slate-900 font-semibold hover:bg-[#3ecf8e]/90"
            >
              {isSyncing ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <UploadCloud className="size-4 mr-2" />
              )}
              Sync All E-Books to Supabase
            </Button>

            <span className="text-xs text-muted-foreground">
              Will insert or update {content.products.length} catalog e-books into Supabase
            </span>
          </div>

          {syncStatus && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs font-medium text-foreground">
              {syncStatus}
            </div>
          )}

          {!diagnostics?.tableExists && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Action needed: Create table in Supabase SQL Editor</p>
                <p className="mt-0.5 text-muted-foreground">
                  The <code className="font-mono text-xs">public.products</code> table has not been created yet in your Supabase project. Copy the SQL script below and run it in your Supabase SQL Editor.
                </p>
              </div>
            </div>
          )}
        </div>
      </AdminCard>

      {/* Digital File Upload to Supabase Storage */}
      <AdminCard
        title="Upload E-Book Files to Supabase Storage"
        description="Host digital e-book files (PDF, EPUB, ZIP, cover art) on Supabase Storage."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="inline-flex h-10 w-fit cursor-pointer items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-semibold hover:bg-muted">
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}
              {isUploading ? 'Uploading file...' : 'Choose E-Book / Guide File to Upload'}
              <input
                type="file"
                className="sr-only"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                disabled={isUploading}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Uploads to Supabase bucket <code className="font-mono">ebooks/files</code>. Generates a permanent CDN download link.
            </p>
          </div>

          {uploadedUrl && (
            <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Check className="size-4" /> File uploaded successfully to Supabase Storage!
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={uploadedUrl}
                  className="flex-1 rounded-lg border bg-background px-3 py-1.5 font-mono text-xs"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleCopyUrl}>
                  {copiedUrl ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copiedUrl ? 'Copied' : 'Copy URL'}
                </Button>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-destructive font-medium">{uploadError}</p>
          )}
        </div>
      </AdminCard>

      {/* SQL Setup Migration */}
      <AdminCard
        title="Supabase Database &amp; Storage Schema (SQL)"
        description="Copy and paste this script into your Supabase project's SQL Editor to set up the products table and storage bucket."
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <a
              href="https://supabase.com/dashboard/project/wxtzacrsjkypfsejnifc/sql/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Open Supabase SQL Editor
              <ExternalLink className="size-3" />
            </a>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCopySql}
              className="h-8"
            >
              {copiedSql ? (
                <Check className="size-3.5 text-emerald-500 mr-1.5" />
              ) : (
                <Copy className="size-3.5 mr-1.5" />
              )}
              {copiedSql ? 'SQL Copied!' : 'Copy SQL Script'}
            </Button>
          </div>

          <pre className="max-h-[280px] overflow-auto rounded-xl border bg-muted/70 p-4 font-mono text-xs text-foreground/90">
            {sqlCode}
          </pre>
        </div>
      </AdminCard>
    </div>
  )
}
