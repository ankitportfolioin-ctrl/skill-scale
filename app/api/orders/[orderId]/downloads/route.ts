import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { EBOOKS_CATALOG } from '@/lib/ebooks-data'
import { hasOrderAccess, orderBookIds, orderCustomerEmail, DOWNLOAD_FORMATS } from '@/lib/order-access'
import { listBookFiles } from '@/lib/book-files'

const FORMAT_INFO: Record<string, { label: string; description: string }> = {
  epub: { label: 'EPUB (e-readers & tablets)', description: 'Reflowable layout for Apple Books, Kobo and most tablets' },
  pdf: { label: 'PDF (desktop & print)', description: 'Fixed layout for large screens and printing' },
  mobi: { label: 'MOBI (Kindle)', description: 'For Kindle devices and Send-to-Kindle' },
  zip: { label: 'Complete bundle (.zip)', description: 'Everything for this title in one archive' },
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}

/**
 * Lists the downloads for an order. Access requires a token proving the payment was verified;
 * an order id on its own, or an order merely existing, grants nothing.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await context.params
    const token = req.nextUrl.searchParams.get('token') || ''

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const adminDb = getSupabaseAdmin()
    const { data: order } = await adminDb.from('orders').select('*').eq('id', orderId).maybeSingle()

    if (!hasOrderAccess(order, orderId, token)) {
      return NextResponse.json({ error: 'Invalid or expired download access token.' }, { status: 403 })
    }

    const bookIds = orderBookIds(order)
    if (bookIds.length === 0) {
      return NextResponse.json({ error: 'No items were found for this order.' }, { status: 404 })
    }

    const items = await Promise.all(
      bookIds.map(async (id) => {
        const book = EBOOKS_CATALOG.find((b) => b.id === id)

        // Only offer files that really exist in storage, with their real sizes.
        const sizeByFormat = await listBookFiles(adminDb, id)

        const link = (format: string) =>
          `/api/orders/${encodeURIComponent(orderId)}/download-file?bookId=${encodeURIComponent(id)}&format=${format}&token=${encodeURIComponent(token)}`

        const formats = DOWNLOAD_FORMATS.filter((format) => format !== 'zip' && sizeByFormat.has(format)).map(
          (format) => ({
            format: format.toUpperCase(),
            label: FORMAT_INFO[format].label,
            description: FORMAT_INFO[format].description,
            size: formatBytes(sizeByFormat.get(format) ?? 0),
            ready: true,
            downloadUrl: link(format),
          }),
        )

        const hasZip = sizeByFormat.has('zip')
        const nothingUploaded = formats.length === 0 && !hasZip

        if (nothingUploaded) {
          console.error(`[order-downloads] Paid order ${orderId} has no uploaded files for book "${id}".`)
        }

        return {
          id,
          title: book?.title ?? id,
          author: book?.author,
          category: book?.category,
          image: book?.image,
          shortDescription: book?.shortDescription,
          zipDownloadUrl: hasZip ? link('zip') : '',
          formats,
          unavailableMessage: nothingUploaded
            ? 'The files for this title are not available yet. Your purchase is recorded, and we will email you as soon as they are ready.'
            : undefined,
        }
      }),
    )

    return NextResponse.json({
      orderId,
      customerEmail: orderCustomerEmail(order) || 'Customer',
      status: order?.status ?? 'Processing',
      total: Number(order?.total ?? 0),
      date: order?.date ?? '',
      items,
      verified: true,
    })
  } catch (err) {
    console.error('[order-downloads] Error loading downloads:', err)
    return NextResponse.json({ error: 'Failed to retrieve order downloads.' }, { status: 500 })
  }
}
