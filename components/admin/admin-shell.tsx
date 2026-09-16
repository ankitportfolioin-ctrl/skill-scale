'use client'

import Image from 'next/image'
import { ArchiveRestore, Check, ChevronRight, Database, Download, ExternalLink, FileText, FolderKanban, Home, LayoutDashboard, LogOut, Menu, Package, RotateCcw, Save, Settings2, ShieldAlert, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { mutate as mutateGlobal } from 'swr'
import { Button } from '@/components/ui/button'
import { cmsCacheKey, useCmsState } from '@/components/cms/use-content'
import { exportCmsContent, importCmsContent, publishDraft, resetCms, restoreRevision, saveDraft } from '@/lib/cms/storage'
import { cloneContent, defaultContent, validateContent, type SiteContent } from '@/lib/cms/content'
import { useAuth } from '@/lib/auth-context'
import { AdminAuth } from './admin-auth'
import { AdminCard, Field, inputClassName } from './admin-fields'
import { CollectionsEditor, FooterSettingsEditor, HomepageEditor } from './content-editors'
import { ProductManager } from './product-manager'
import { SupabaseManager } from './supabase-manager'

type Section = 'overview' | 'products' | 'supabase' | 'homepage' | 'collections' | 'settings'

const sections: Array<{ id: Section; label: string; icon: typeof Home }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'supabase', label: 'Supabase DB', icon: Database },
  { id: 'homepage', label: 'Homepage', icon: Home },
  { id: 'collections', label: 'Collections', icon: FolderKanban },
  { id: 'settings', label: 'Footer & SEO', icon: Settings2 },
]

function formatDate(value: string | null) {
  if (!value) return 'Not published locally yet'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function AdminShell() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { data, isLoading, mutate } = useCmsState()
  const [draft, setDraft] = useState<SiteContent | null>(null)
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [notice, setNotice] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    if (data?.draft && !initialized.current) {
      setDraft(cloneContent(data.draft))
      initialized.current = true
    } else if (!isLoading && !data?.draft && !initialized.current) {
      setDraft(cloneContent(defaultContent))
      initialized.current = true
    }
  }, [data, isLoading])

  const flash = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2600)
  }

  const handleSaveDraft = async () => {
    if (!draft) return
    try {
      setSaveState('saving')
      const next = await saveDraft(draft)
      await mutate(next, { revalidate: false })
      setSaveState('saved')
      flash('Draft saved successfully.')
    } catch (err: any) {
      console.error('Error saving draft:', err)
      setSaveState('idle')
      window.alert('Failed to save draft: ' + (err?.message || 'Error occurred'))
    }
  }

  const handlePublish = async () => {
    if (!draft) return
    const errors = validateContent(draft)
    if (errors.length) {
      window.alert(errors.join('\n'))
      return
    }
    try {
      setSaveState('saving')
      const next = await publishDraft(draft)
      await mutate(next, { revalidate: false })
      await mutateGlobal(cmsCacheKey())
      setSaveState('saved')
      flash('Changes published to live website! All visitors are updated in real-time.')
    } catch (err: any) {
      console.error('Error publishing live CMS state:', err)
      window.alert('Failed to publish changes: ' + (err?.message || 'Error occurred'))
    }
  }

  const handleRevert = () => {
    if (!data || !window.confirm('Replace the draft with the currently published content?')) return
    setDraft(cloneContent(data.published))
    flash('Draft reverted to the published version.')
  }

  const handleReset = async () => {
    if (!window.confirm('Reset all draft and published content to the SkillScale defaults?')) return
    const next = await resetCms()
    setDraft(cloneContent(defaultContent))
    await mutate(next, { revalidate: false })
    flash('Content reset to defaults.')
  }

  const handleExport = () => {
    if (!draft) return
    const blob = new Blob([exportCmsContent(draft)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `skillscale-content-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    flash('Draft exported as JSON.')
  }

  const handleImport = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      const next = await importCmsContent(parsed)
      setDraft(cloneContent(next.draft))
      await mutate(next, { revalidate: false })
      flash('Content imported into the draft.')
    } catch {
      window.alert('This file is not valid SkillScale JSON.')
    }
  }

  const effectiveDraft = draft ?? data?.draft ?? defaultContent
  const unpublishedChanges = data?.published ? JSON.stringify(effectiveDraft) !== JSON.stringify(data.published) : false

  return (
    <div className="min-h-screen bg-soft text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-primary text-primary-foreground transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-xl bg-[#1e1b4b] text-xs font-bold text-white shadow-sm shrink-0">
              <Image
                src="/brand-logo.png"
                alt="SkillScale Admin"
                width={36}
                height={36}
                className="size-full object-cover rounded-xl"
              />
            </span>
            <span className="font-heading font-bold tracking-tight">{effectiveDraft.site.brandName} Admin</span>
          </Link>
          <Button type="button" size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X /></Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Admin sections">
          {sections.map((section) => { const Icon = section.icon; return <button key={section.id} type="button" onClick={() => { setActiveSection(section.id); setSidebarOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${activeSection === section.id ? 'bg-white text-primary shadow-sm' : 'text-indigo-100 hover:bg-white/10'}`}><Icon aria-hidden="true" className="size-4" />{section.label}<ChevronRight aria-hidden="true" className="ml-auto size-4 opacity-50" /></button> })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/8 p-3 text-xs leading-5 text-indigo-100">
            <p className="font-semibold text-white">Administrator Session</p>
            <p className="mt-0.5 truncate text-[11px] text-indigo-200">{user?.email || 'Authorized Administrator'}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout()
              router.push('/')
            }}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-indigo-100 hover:bg-white/10 cursor-pointer transition"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out of Admin
          </button>
        </div>
      </aside>
      {sidebarOpen && <button type="button" aria-label="Close navigation" className="fixed inset-0 z-40 bg-foreground/35 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <Button type="button" size="icon" variant="ghost" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu /></Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{sections.find((section) => section.id === activeSection)?.label}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {saveState === 'saving' ? (
                <><Save aria-hidden="true" className="size-3.5 animate-spin text-primary" />Saving...</>
              ) : saveState === 'saved' ? (
                <><Check aria-hidden="true" className="size-3.5 text-emerald-500" />Draft saved</>
              ) : (
                <><span className="size-2 rounded-full bg-emerald-500 inline-block" />Connected</>
              )}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="hidden sm:inline-flex" onClick={handleSaveDraft} disabled={saveState === 'saving'}><Save data-icon="inline-start" />{saveState === 'saving' ? 'Saving...' : 'Save Draft'}</Button>
            <Button type="button" variant="outline" size="sm" className="hidden sm:inline-flex" onClick={handleRevert} disabled={!unpublishedChanges}><RotateCcw data-icon="inline-start" />Revert</Button>
            <Button nativeButton={false} render={<Link href="/" target="_blank" rel="noopener noreferrer" />} variant="outline" size="sm"><ExternalLink data-icon="inline-start" /><span className="hidden sm:inline">View live site</span><span className="sm:hidden">Live</span></Button>
            <Button nativeButton={false} render={<Link href="/?preview=draft" target="_blank" rel="noopener noreferrer" />} variant="outline" size="sm"><ExternalLink data-icon="inline-start" /><span className="hidden sm:inline">Preview draft</span><span className="sm:hidden">Preview</span></Button>
            <Button type="button" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm" onClick={handlePublish} disabled={!unpublishedChanges}><Upload data-icon="inline-start" />Publish to Live</Button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {unpublishedChanges && <div className="mb-5 flex items-start gap-3 rounded-xl border border-highlight/30 bg-highlight/10 px-4 py-3 text-sm"><FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-highlight-foreground" /><p><strong>Draft changes are not live.</strong> Preview them, then publish when ready.</p></div>}
          {activeSection === 'overview' && <Overview content={effectiveDraft} publishedAt={data?.publishedAt ?? null} draftUpdatedAt={data?.draftUpdatedAt ?? null} revisions={data?.revisions ?? []} onRestore={async (revision) => { const next = await restoreRevision(revision); setDraft(cloneContent(next.draft)); await mutate(next, { revalidate: false }); flash('Revision restored into the draft.') }} onNavigate={setActiveSection} />}
          {activeSection === 'products' && <ProductManager content={effectiveDraft} onChange={setDraft} />}
          {activeSection === 'supabase' && <SupabaseManager content={effectiveDraft} />}
          {activeSection === 'homepage' && <HomepageEditor content={effectiveDraft} onChange={setDraft} />}
          {activeSection === 'collections' && <CollectionsEditor content={effectiveDraft} onChange={setDraft} />}
          {activeSection === 'settings' && <div className="flex flex-col gap-5"><FooterSettingsEditor content={effectiveDraft} onChange={setDraft} /><WorkspaceSettings onExport={handleExport} onImport={handleImport} onReset={handleReset} /></div>}
        </main>
      </div>
      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background shadow-xl lg:left-[calc(50%+8rem)]"><Check aria-hidden="true" className="size-4 text-success" />{notice}</div>}
    </div>
  )
}

function Overview({ content, publishedAt, draftUpdatedAt, revisions, onRestore, onNavigate }: { content: SiteContent; publishedAt: string | null; draftUpdatedAt: string | null; revisions: Array<{ id: string; createdAt: string; content: SiteContent }>; onRestore: (revision: { id: string; createdAt: string; content: SiteContent }) => void; onNavigate: (section: Section) => void }) {
  const visibleProducts = content.products.filter((product) => product.published).length
  return <div className="flex flex-col gap-5"><div><p className="eyebrow">Content workspace</p><h1 className="mt-2 font-heading text-3xl font-bold tracking-tight">Storefront at a glance</h1><p className="mt-2 text-sm text-muted-foreground">Edit locally, preview safely, and publish when the draft is ready.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[[String(content.products.length), 'Total products'], [String(visibleProducts), 'Visible products'], [String(content.categories.length), 'Categories'], [String(content.reviews.length), 'Customer reviews']].map(([value, label]) => <div key={label} className="rounded-2xl border bg-card p-5 shadow-sm"><p className="font-heading text-3xl font-bold text-primary">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>)}</div><div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]"><AdminCard title="Publishing status" description="Only published content appears on the standard storefront."><dl className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-muted p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last draft save</dt><dd className="mt-2 text-sm font-semibold">{formatDate(draftUpdatedAt)}</dd></div><div className="rounded-xl bg-muted p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last publish</dt><dd className="mt-2 text-sm font-semibold">{formatDate(publishedAt)}</dd></div></dl><div className="mt-5 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => onNavigate('products')}><Package data-icon="inline-start" />Manage products</Button><Button type="button" variant="outline" onClick={() => onNavigate('homepage')}><Home data-icon="inline-start" />Edit homepage</Button></div></AdminCard><AdminCard title="Recent revisions" description="Restore a prior published version into the draft."><div className="flex flex-col gap-2">{revisions.length ? revisions.map((revision) => <div key={revision.id} className="flex items-center justify-between gap-3 rounded-xl border p-3"><div><p className="text-sm font-semibold">Published snapshot</p><p className="text-xs text-muted-foreground">{formatDate(revision.createdAt)}</p></div><Button type="button" size="sm" variant="outline" onClick={() => onRestore(revision)}><ArchiveRestore data-icon="inline-start" />Restore</Button></div>) : <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">Revisions appear after the first publish.</p>}</div></AdminCard></div></div>
}

function WorkspaceSettings({ onExport, onImport, onReset }: { onExport: () => void; onImport: (file?: File) => void; onReset: () => void }) {
  return (
    <>
      <AdminCard title="Import and export" description="Move a draft between browsers or keep a manual backup.">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={onExport}>
            <Download data-icon="inline-start" />
            Export draft JSON
          </Button>
          <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-semibold hover:bg-muted">
            <Upload aria-hidden="true" className="size-4" />
            Import draft JSON
            <input type="file" accept="application/json" className="sr-only" onChange={(event) => onImport(event.target.files?.[0])} />
          </label>
        </div>
      </AdminCard>
      <AdminCard title="Danger zone" description="Reset local catalog and site configuration draft.">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Reset local workspace content</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Restores default draft and published catalog content. Export a backup first if you want to keep your edits.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onReset} className="text-destructive hover:text-destructive">
                <RotateCcw data-icon="inline-start" />
                Reset content to default
              </Button>
            </div>
          </div>
        </div>
      </AdminCard>
    </>
  )
}

export function AdminPage() {
  return <AdminAuth><AdminShell /></AdminAuth>
}
