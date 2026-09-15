import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_DEFAULT_URL, SUPABASE_DEFAULT_ANON_KEY } from '@/lib/supabase'
import type { NextRequest } from 'next/server'
export function getSupabaseServer(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_DEFAULT_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_DEFAULT_ANON_KEY, { global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }, auth: { persistSession:false, autoRefreshToken:false } })
}
export async function requireUser(req: NextRequest) { const client=getSupabaseServer(req); const {data:{user},error}=await client.auth.getUser(); return { client, user, error } }
