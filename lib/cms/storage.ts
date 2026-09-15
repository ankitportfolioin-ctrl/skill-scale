import { defaultContent, type SiteContent, cloneContent } from './content'
import { supabase } from '@/lib/supabase'

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
    const s = { ...initial(), ...p, source: 'local' as const }
    if (s.draft) s.draft.products = []
    if (s.published) s.published.products = []
    return s
  } catch {
    return null
  }
}
function saveCache(s: CmsState) {
  if (typeof window !== 'undefined') {
    const clean = {
      ...s,
      draft: s.draft ? { ...s.draft, products: [] } : s.draft,
      published: s.published ? { ...s.published, products: [] } : s.published,
    }
    localStorage.setItem(KEY, JSON.stringify(clean))
  }
}
function mergeContent(content: any): SiteContent { return { ...defaultContent, ...content, products: Array.isArray(content?.products) ? content.products : [] } }
async function readDoc(id: string) { const { data } = await supabase.from('cms_documents').select('*').eq('id', id).maybeSingle(); return data }
export async function getCmsState(): Promise<CmsState> {
  const c = cache() || initial();
  const [{ data: pub }, { data: draft }, { data: revs }] = await Promise.all([
    supabase.from('cms_documents').select('*').eq('id','published').maybeSingle(),
    supabase.from('cms_documents').select('*').eq('id','draft').maybeSingle(),
    supabase.from('cms_revisions').select('*').order('created_at', { ascending: false }).limit(20),
  ])
  const published = mergeContent(pub?.content || c.published)
  const state: CmsState = { ...c, published, draft: mergeContent(draft?.content || published), publishedAt: pub?.published_at || c.publishedAt, draftUpdatedAt: draft?.updated_at || c.draftUpdatedAt, lastPublishedAt: pub?.published_at || c.lastPublishedAt, revisions: (revs || []).map((r: any) => ({ id: r.id, createdAt: r.created_at, content: mergeContent(r.content) })), source: pub || draft ? 'cloud' : c.source }
  saveCache(state); return state
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
  const current = await getCmsState(), now = new Date().toISOString(); const { products: _p, ...content } = draft
  const { error } = await supabase.from('cms_documents').upsert({ id:'draft', content, updated_at:now }, { onConflict:'id' }); if (error) throw error
  const next = { ...current, draft: cloneContent(draft), draftUpdatedAt: now, source:'cloud' as const }; saveCache(next); return next
}
export async function publishDraft(draft?: SiteContent): Promise<CmsState> {
  const current = await getCmsState(), content = cloneContent(draft || current.draft), now = new Date().toISOString(), revisionId = `rev-${Date.now()}`; const { products: _p, ...landing } = content
  const { error } = await supabase.from('cms_documents').upsert([{ id:'published', content:landing, updated_at:now, published_at:now }, { id:'draft', content:landing, updated_at:now }], { onConflict:'id' }); if (error) throw error
  await supabase.from('cms_revisions').insert({ id:revisionId, content:landing, created_at:now })
  const next = { ...current, draft:content, published:content, publishedAt:now, draftUpdatedAt:now, lastPublishedAt:now, revisions:[{ id:revisionId, createdAt:now, content }, ...current.revisions].slice(0,20), source:'cloud' as const }; saveCache(next); return next
}
export async function resetCms() { return publishDraft(cloneContent(defaultContent)) }
export async function restoreRevision(revision: { id:string; createdAt:string; content:SiteContent } | string) { const s = await getCmsState(); const r = typeof revision === 'string' ? s.revisions.find(x => x.id === revision) : revision; return r ? saveDraft(r.content) : s }
export function exportCmsContent(content: SiteContent) { return JSON.stringify(content, null, 2) }
export async function importCmsContent(input: any) { let c = input; if (typeof window !== 'undefined' && input instanceof File) c = JSON.parse(await input.text()); const draft = c?.draft || c; if (!draft?.site || !draft?.products) throw new Error('Invalid SkillScale content format'); return saveDraft(draft) }
