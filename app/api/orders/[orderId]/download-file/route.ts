import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { EBOOKS_CATALOG } from '@/lib/ebooks-data'
import { hasOrderAccess, isDownloadFormat, orderBookIds } from '@/lib/order-access'

const SIGNED_URL_SECONDS = 120

/**
 * Sends the customer to a short-lived signed URL for one purchased file.
 * Requires (1) a token proving payment for this order and (2) that the requested book is
 * actually part of this order. Never serves placeholder content in place of a missing file.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await context.params
    const params = req.nextUrl.searchParams
    const bookId = params.get('bookId') || ''
    const format = (params.get('format') || 'epub').toLowerCase()
    const token = params.get('token') || ''

    if (!orderId || !bookId) {
      return NextResponse.json({ error: 'Missing orderId or bookId' }, { status: 400 })
    }
    if (!isDownloadFormat(format)) {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }

    const adminDb = getSupabaseAdmin()
    const { data: order } = await adminDb.from('orders').select('*').eq('id', orderId).maybeSingle()

    if (!hasOrderAccess(order, orderId, token)) {
      return NextResponse.json({ error: 'Unauthorized download access' }, { status: 403 })
    }

    // The book must have been bought in THIS order. Without this, a paid token for the cheapest
    // book would unlock every other book in the catalog.
    if (!orderBookIds(order).includes(bookId)) {
      return NextResponse.json({ error: 'That title is not part of this order.' }, { status: 403 })
    }

    const book = EBOOKS_CATALOG.find((b) => b.id === bookId)
    const safeName = (book?.title || bookId).replace(/[^a-zA-Z0-9_-]/g, '_')
    const storagePath = `private-ebooks/${bookId}/${bookId}.${format}`

    const { data, error } = await adminDb.storage
      .from('ebooks')
      .createSignedUrl(storagePath, SIGNED_URL_SECONDS, { download: `${safeName}.${format}` })

    if (error || !data?.signedUrl) {
      console.error(`[download-file] No file at ${storagePath} for paid order ${orderId}:`, error?.message)
      return NextResponse.json(
        { error: 'This file is not available yet. Your purchase is recorded and we will email you when it is ready.' },
        { status: 404 },
      )
    }

    return NextResponse.redirect(data.signedUrl, 302)
  } catch (err) {
    console.error('[download-file] Error serving download file:', err)
    return NextResponse.json({ error: 'Download could not be generated' }, { status: 500 })
  }
}
