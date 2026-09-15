import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { EBOOKS_CATALOG } from '@/lib/ebooks-data'

/**
 * Razorpay server-to-server webhook — the ONLY place an order is fulfilled.
 *
 * The browser-facing /api/verify-payment endpoint gives the user instant feedback but
 * grants nothing; it can be called by anyone. Fulfillment happens here, gated on an
 * HMAC signature that only Razorpay can produce.
 *
 * Writes use the service-role client because this request carries no user session:
 * auth.uid() is NULL, so the `purchases_admin_write` and `orders_admin_update` RLS
 * policies would reject every write if we used the anon key.
 */

// Signed URLs are emailed to the customer; 7 days gives them time to download.
// The /api/purchases/download endpoint re-signs on demand after that.
const SIGNED_URL_VALID_SECONDS = 7 * 24 * 60 * 60

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-razorpay-signature')
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET

  if (!secret) {
    console.error('[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not configured.')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // The raw body must be read as text, before any JSON parsing — the HMAC is computed
  // over the exact bytes Razorpay sent. Re-serializing parsed JSON changes them.
  const raw = await req.text()

  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')

  // Constant-time comparison: a plain !== leaks information about the expected digest
  // through response timing.
  const signatureBuffer = Buffer.from(signature, 'utf8')
  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer)

  if (!signatureValid) {
    console.warn('[razorpay-webhook] Rejected a request with an invalid signature.')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 })
  }

  if (event?.event !== 'payment.captured') {
    // Acknowledge anything we don't handle so Razorpay stops retrying it.
    return NextResponse.json({ received: true, handled: false })
  }

  const payment = event?.payload?.payment?.entity
  const userId: string | undefined = payment?.notes?.userId
  const bookIds: string[] = String(payment?.notes?.bookIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (!userId || bookIds.length === 0) {
    console.error(
      '[razorpay-webhook] payment.captured is missing notes.userId or notes.bookIds.',
      { orderId: payment?.order_id },
    )
    // 200, not 500: retrying will not add the missing notes. Surfacing it in logs is
    // the only useful action.
    return NextResponse.json({ received: true, handled: false })
  }

  try {
    await fulfillOrder({
      userId,
      bookIds,
      orderId: payment.order_id,
      email: payment.email,
    })
  } catch (err) {
    console.error('[razorpay-webhook] Fulfillment failed:', err)
    // 500 tells Razorpay to retry. fulfillOrder is idempotent, so a retry is safe.
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true, handled: true })
}

interface FulfillArgs {
  userId: string
  bookIds: string[]
  orderId: string
  email?: string
}

/**
 * Idempotent. Purchase rows are keyed `${orderId}_${bookId}` and upserted, so a Razorpay
 * retry re-signs the download URL rather than creating duplicate entitlements.
 */
async function fulfillOrder({ userId, bookIds, orderId, email }: FulfillArgs) {
  const db = getSupabaseAdmin()
  const delivered: { title: string; downloadUrl: string }[] = []

  for (const bookId of bookIds) {
    const book = EBOOKS_CATALOG.find((b) => b.id === bookId)
    if (!book) {
      console.warn(`[razorpay-webhook] Unknown bookId in payment notes: ${bookId}`)
      continue
    }

    const storagePath = `private-ebooks/${bookId}/${bookId}.zip`

    const { data: signed, error: signError } = await db.storage
      .from('ebooks')
      .createSignedUrl(storagePath, SIGNED_URL_VALID_SECONDS)

    if (signError) {
      // Don't abort the whole order — record the entitlement so the customer can
      // re-request the link from their account page once the file is uploaded.
      console.error(
        `[razorpay-webhook] Could not sign ${storagePath}. Is the file uploaded to the ` +
          `'ebooks' bucket at that exact path?`,
        signError,
      )
    }

    const { error: upsertError } = await db.from('purchases').upsert(
      {
        id: `${orderId}_${bookId}`,
        user_id: userId,
        book_id: bookId,
        title: book.title,
        author: book.author,
        format: book.formats.join(', '),
        download_url: signed?.signedUrl || '',
        storage_path: storagePath,
        purchased_at: new Date().toISOString(),
        price: book.priceINR,
        cover_image: book.image,
      },
      { onConflict: 'id' },
    )

    // This one IS fatal: without the purchase row the customer has no entitlement,
    // so we throw and let Razorpay retry.
    if (upsertError) throw upsertError

    if (signed?.signedUrl) {
      delivered.push({ title: book.title, downloadUrl: signed.signedUrl })
    }
  }

  const { error: orderError } = await db
    .from('orders')
    .update({ status: 'Completed' })
    .eq('id', orderId)
    .eq('user_id', userId)

  if (orderError) throw orderError

  await sendDeliveryEmail(email, delivered)
}

async function sendDeliveryEmail(
  email: string | undefined,
  delivered: { title: string; downloadUrl: string }[],
) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!email || !apiKey || !from || delivered.length === 0) {
    if (!apiKey || !from) {
      console.warn(
        '[razorpay-webhook] RESEND_API_KEY / EMAIL_FROM not set — skipping delivery email. ' +
          'The customer can still download from their account page.',
      )
    }
    return
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from,
      to: email,
      subject: 'Your SkillScale e-books are ready to download',
      html:
        `<p>Thanks for your purchase! Your DRM-free files are ready:</p><ul>` +
        delivered
          .map(
            (b) =>
              `<li><strong>${escapeHtml(b.title)}</strong> — ` +
              `<a href="${b.downloadUrl}">Download now</a></li>`,
          )
          .join('') +
        `</ul><p>These links expire in 7 days. You can always generate fresh ones from ` +
        `your account page.</p>`,
    })
  } catch (err) {
    // The entitlement is already recorded in the database, so a failed email must not
    // roll back fulfillment or trigger a Razorpay retry.
    console.error('[razorpay-webhook] Delivery email failed to send:', err)
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
