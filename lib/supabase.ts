import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_DEFAULT_URL = 'https://wxtzacrsjkypfsejnifc.supabase.co'
export const SUPABASE_DEFAULT_ANON_KEY = 'sb_publishable_JsJiv7-2pdNAx7CBjMn3Rg_b7D_2ngm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_DEFAULT_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY

// The anon key is public by design, so hardcoding a fallback is not a credential leak.
// The risk is silence: without this warning, a missing env var in production would
// quietly point the live store at the development Supabase project instead of failing.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — ' +
      'falling back to the hardcoded default project. Set both in your environment ' +
      'before deploying to production.',
  )
}

let supabaseInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return supabaseInstance
}

export const supabase = getSupabase()

export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    hasKey: Boolean(supabaseAnonKey),
    isDefaultConfig: supabaseUrl === SUPABASE_DEFAULT_URL,
  }
}
