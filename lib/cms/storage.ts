import { defaultContent, type SiteContent, cloneContent } from './content'
import { supabase } from '@/lib/supabase'
import { saveProductToSupabase, fetchProductsFromSupabase } from '@/lib/products/products-service'

export { defaultContent }
export interface CmsRevision { id: string; createdAt: string; content: SiteContent }
export interface CmsState { draft: SiteContent; published: SiteContent; publishedAt: string | null; draftUpdatedAt: string | null; lastPublishedAt?: string | null; revisions: CmsRevision[]; source?: 'cloud'|'local'|'default' }
const KEY = 'skillscale_cms_state_v3'
const initial = (): CmsState => ({ draft: cloneContent(defaultContent), published: cloneContent(defaultContent), publishedAt: null, draftUpdatedAt: null, lastPublishedAt: null, revisions: [], source: 'default' })

function cache(): CmsState | null {
  if (typeof window === 'undefined') return null
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!p) return null
    return { ...initial(), ...p, source: 'local' as const }
  } catch {
    return null
  }
}

function saveCache(s: CmsState) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }
}

function mergeContent(content: any, extraProducts?: any[]): SiteContent {
  const products = Array.isArray(content?.products) && content.products.length > 0
    ? content.products
    : (Array.isArray(extraProducts) && extraProducts.length > 0 ? extraProducts : (defaultContent.products || []))

  return {
    ...defaultContent,
    ...content,
    products,
    site: {
      ...defaultContent.site,
      ...content?.site,
      currency: (content?.site?.currency === '$' || !content?.site?.currency) ? '₹' : content.site.currency,
    },
  }
}

async function readDoc(id: string) { const { data } = await supabase.from('cms_documents').select('*').eq('id', id).maybeSingle(); return data }

export async function getCmsState(): Promise<CmsState> {
  const c = cache() || initial();
  const [{ data: pub }, { data: draft }, { data: revs }, dbProducts] = await Promise.all([
    supabase.from('cms_documents').select('*').eq('id','published').maybeSingle(),
    supabase.from('cms_documents').select('*').eq('id','draft').maybeSingle(),
    supabase.from('cms_revisions').select('*').order('created_at', { ascending: false }).limit(20),
    fetchProductsFromSupabase().catch(() => []),
  ])

  const productsToUse = Array.isArray(dbProducts) && dbProducts.length > 0 ? dbProducts : undefined
  const published = mergeContent(pub?.content || c.published, productsToUse)
  const draftMerged = mergeContent(draft?.content || published, productsToUse)

  const state: CmsState = {
    ...c,
    published,
    draft: draftMerged,
    publishedAt: pub?.published_at || c.publishedAt,
    draftUpdatedAt: draft?.updated_at || c.draftUpdatedAt,
    lastPublishedAt: pub?.published_at || c.lastPublishedAt,
    revisions: (revs || []).map((r: any) => ({ id: r.id, createdAt: r.created_at, content: mergeContent(r.content, productsToUse) })),
    source: pub || draft ? 'cloud' : c.source
  }
  saveCache(state);
  return state
}

export function subscribeToPublishedContent(onUpdate: (content: SiteContent) => void): () => void {
  getCmsState().then((s) => onUpdate(s.published));
  const uniqueChannelName = `cms-published-${Math.random().toString(36).substring(2, 15)}`;
  const ch = supabase
    .channel(uniqueChannelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cms_documents', filter: 'id=eq.published' }, () => getCmsState().then(s => onUpdate(s.published)))
    .subscribe()
  return () => { void supabase.removeChannel(ch) }
}

export function subscribeToCmsState(onUpdate: (state: CmsState) => void): () => void {
  getCmsState().then(onUpdate)
  const uniqueChannelName = `cms-state-${Math.random().toString(36).substring(2, 15)}`;
  const ch = supabase
    .channel(uniqueChannelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cms_documents' }, () => getCmsState().then(onUpdate))
    .subscribe()
  return () => { void supabase.removeChannel(ch) }
}

export async function saveDraft(draft: SiteContent): Promise<CmsState> {
  const current = await getCmsState(), now = new Date().toISOString();
  
  // 1. Save full draft (including products) to cms_documents
  const { error } = await supabase.from('cms_documents').upsert({ id:'draft', content: draft, updated_at:now }, { onConflict:'id' });
  if (error) throw error

  // 2. Synchronize all products to the Supabase products table
  if (Array.isArray(draft.products) && draft.products.length > 0) {
    for (const prod of draft.products) {
      try {
        await saveProductToSupabase(prod)
      } catch (pErr) {
        console.warn(`Could not sync product ${prod.id} to Supabase:`, pErr)
      }
    }
  }

  const next = { ...current, draft: cloneContent(draft), draftUpdatedAt: now, source:'cloud' as const };
  saveCache(next);
  return next
}

export async function publishDraft(draft?: SiteContent): Promise<CmsState> {
  const current = await getCmsState(), content = cloneContent(draft || current.draft), now = new Date().toISOString(), revisionId = `rev-${Date.now()}`;
  
  // 1. Save published and draft documents in cms_documents
  const { error } = await supabase.from('cms_documents').upsert([
    { id:'published', content, updated_at:now, published_at:now },
    { id:'draft', content, updated_at:now }
  ], { onConflict:'id' });
  if (error) throw error

  // 2. Synchronize all published products to the Supabase products table
  if (Array.isArray(content.products) && content.products.length > 0) {
    for (const prod of content.products) {
      try {
        await saveProductToSupabase(prod)
      } catch (pErr) {
        console.warn(`Could not sync product ${prod.id} to Supabase:`, pErr)
      }
    }
  }

  // 3. Record revision
  await supabase.from('cms_revisions').insert({ id:revisionId, content, created_at:now })

  const next = {
    ...current,
    draft: content,
    published: content,
    publishedAt: now,
    draftUpdatedAt: now,
    lastPublishedAt: now,
    revisions: [{ id:revisionId, createdAt:now, content }, ...current.revisions].slice(0,20),
    source: 'cloud' as const
  };
  saveCache(next);
  return next
}

export async function resetCms() { return publishDraft(cloneContent(defaultContent)) }
export async function restoreRevision(revision: { id:string; createdAt:string; content:SiteContent } | string) { const s = await getCmsState(); const r = typeof revision === 'string' ? s.revisions.find(x => x.id === revision) : revision; return r ? saveDraft(r.content) : s }
export function exportCmsContent(content: SiteContent) { return JSON.stringify(content, null, 2) }
export async function importCmsContent(input: any) { let c = input; if (typeof window !== 'undefined' && input instanceof File) c = JSON.parse(await input.text()); const draft = c?.draft || c; if (!draft?.site || !draft?.products) throw new Error('Invalid SkillScale content format'); return saveDraft(draft) }

