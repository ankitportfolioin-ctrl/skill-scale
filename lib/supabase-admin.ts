import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client.
 *
 * This client BYPASSES Row Level Security. It exists for one reason: server-to-server
 * flows (the Razorpay webhook) run with no user session, so `auth.uid()` is NULL and
 * every RLS policy that calls `public.is_admin()` evaluates to false. Using the anon
 * key there causes fulfillment writes to be silently rejected.
 *
 * HARD RULES:
 *   1. Never import this file from a component marked 'use client'.
 *   2. The env var must NOT be prefixed with NEXT_PUBLIC_ — that would inline the
 *      service-role key into the browser bundle and hand every visitor full DB access.
 *   3. Use the normal RLS-scoped client (lib/supabase-server.ts) for anything that
 *      acts on behalf of a signed-in user.
 */

let adminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error(
      'FATAL: NEXT_PUBLIC_SUPABASE_URL is not set. Order fulfillment cannot run.',
    )
  }

  if (!serviceKey) {
    throw new Error(
      'FATAL: SUPABASE_SERVICE_ROLE_KEY is not set. The Razorpay webhook cannot write ' +
        'purchases or sign download URLs without it (RLS will reject every write). ' +
        'Add it in your hosting provider\'s environment variables — Supabase Dashboard > ' +
        'Settings > API > service_role key.',
    )
  }

  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return adminClient
}
