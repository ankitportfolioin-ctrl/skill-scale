import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Free-plan Supabase projects pause after a period with no activity, which takes the whole store
// offline. A daily scheduled call (see vercel.json) keeps the database active.
// Vercel sends "Authorization: Bearer <CRON_SECRET>" when the CRON_SECRET env var is set.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { error } = await getSupabaseAdmin().from('products').select('id', { head: true, count: 'exact' }).limit(1)
  if (error) {
    console.error('[keepalive] database ping failed:', error.message)
    return NextResponse.json({ ok: false }, { status: 503 })
  }
  return NextResponse.json({ ok: true })
}
