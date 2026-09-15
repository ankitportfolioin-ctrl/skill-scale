import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase-server'

const SIGNED_URL_VALID_SECONDS = 7 * 24 * 60 * 60

export async function POST(req: NextRequest) {
  try {
    const { client, user } = await requireUser(req)
    if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })

    const { purchaseId } = await req.json()
    if (!purchaseId || typeof purchaseId !== 'string') {
      return NextResponse.json({ error: 'Missing purchaseId.' }, { status: 400 })
    }

    // Only ever read from *this* user's own purchases subcollection — a user can never
    // request a download link for a purchase that isn't theirs.
    const { data: purchase } = await client.from('purchases').select('storage_path').eq('id', purchaseId).eq('user_id', user.id).maybeSingle()
    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found.' }, { status: 404 })
    }

    const storagePath = purchase.storage_path as string | undefined
    if (!storagePath) {
      return NextResponse.json({ error: 'No file is associated with this purchase yet.' }, { status: 404 })
    }

    const { data, error } = await client.storage.from('ebooks').createSignedUrl(storagePath, SIGNED_URL_VALID_SECONDS)
    if (error || !data?.signedUrl) return NextResponse.json({ error: 'Could not generate a download link.' }, { status: 500 })

    return NextResponse.json({ url: data.signedUrl })
  } catch (err) {
    console.error('Download link refresh failed:', err)
    return NextResponse.json({ error: 'Could not generate a download link.' }, { status: 500 })
  }
}
