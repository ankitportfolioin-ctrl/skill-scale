import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { EBOOKS_CATALOG } from '@/lib/ebooks-data'
import { generateDownloadToken } from '@/lib/download-token'

/**
 * Razorpay server-to-server webhook — the ONLY place an order is fulfilled.
 *
 * Checkout-First Authentication:
 * 1. Verifies webhook HMAC signature.
 * 2. Resolves customer email from payment entity/notes.
 * 3. Checks if a Supabase user exists for that email.
 *    - If not, auto-creates user via Supabase Admin API with random password and email_confirm: true.
 *    - If exists, links purchase to that existing user.
 * 4. Inserts purchase records into public.purchases and updates public.orders.
 * 5. Generates optional password recovery link via Supabase Admin API.
 * 6. Sends one unified transactional delivery email via Resend with DRM-free links and optional password setup.
 */

// Signed URLs valid for 7 days. Customer can always re-request fresh links from /download/[orderId] or their account.
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

  // Constant-time comparison
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
  const rawEmail: string =
    payment?.notes?.email ||
    payment?.email ||
    payment?.contact ||
    ''

  const customerEmail = rawEmail.trim().toLowerCase()
  const orderId: string = payment?.order_id || ''

  // Parse book IDs from payment notes
  let bookIds: string[] = String(payment?.notes?.bookIds || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  const db = getSupabaseAdmin()

  // If bookIds not in notes, inspect orders table in database for fallback
  if (bookIds.length === 0 && orderId) {
    try {
      const { data: orderRow } = await db
        .from('orders')
        .select('items, customer_email')
        .eq('id', orderId)
        .maybeSingle()

      if (orderRow?.items && Array.isArray(orderRow.items)) {
        bookIds = orderRow.items
          .map((it: any) => it.id || it.bookId)
          .filter(Boolean)
      }
    } catch (dbErr) {
      console.warn('[razorpay-webhook] Fallback order lookup error:', dbErr)
    }
  }

  if (!customerEmail || bookIds.length === 0) {
    console.error(
      '[razorpay-webhook] payment.captured is missing email or bookIds.',
      { orderId, customerEmail, bookIdsCount: bookIds.length },
    )
    return NextResponse.json({ received: true, handled: false })
  }

  try {
    await fulfillOrder({
      email: customerEmail,
      bookIds,
      orderId,
      explicitUserId: payment?.notes?.userId || undefined,
    })
  } catch (err) {
    console.error('[razorpay-webhook] Fulfillment failed:', err)
    // 500 tells Razorpay to retry. fulfillOrder is idempotent, so a retry is safe.
    return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true, handled: true })
}

interface FulfillArgs {
  email: string
  bookIds: string[]
  orderId: string
  explicitUserId?: string
}

/**
 * Idempotent fulfillment handler.
 * - Resolves or auto-creates Supabase auth user
 * - Upserts purchase rows keyed ${orderId}_${bookId}
 * - Updates order status to Completed
 * - Generates optional password recovery link
 * - Dispatches single Resend confirmation email
 */
async function fulfillOrder({ email, bookIds, orderId, explicitUserId }: FulfillArgs) {
  const db = getSupabaseAdmin()
  let userId = explicitUserId || ''
  let isNewUser = false

  // 1. Resolve or Create Supabase User
  if (!userId) {
    // Check if user already exists in profiles table
    try {
      const { data: profile } = await db
        .from('profiles')
        .select('id, email')
        .ilike('email', email)
        .maybeSingle()

      if (profile?.id) {
        userId = profile.id
      }
    } catch (pErr) {
      console.warn('[razorpay-webhook] Profiles lookup error:', pErr)
    }

    // If still not found, check auth.users or create via Admin API
    if (!userId) {
      try {
        const { data: usersList } = await db.auth.admin.listUsers()
        const users = (usersList as any)?.users as Array<{ id: string; email?: string }> | undefined
        const existingAuthUser = users?.find(
          (u) => u.email?.toLowerCase() === email,
        )

        if (existingAuthUser?.id) {
          userId = existingAuthUser.id
        }
      } catch (listErr) {
        console.warn('[razorpay-webhook] listUsers lookup error:', listErr)
      }
    }

    // If user does NOT exist, create them server-side via Supabase Admin API
    if (!userId) {
      // Cryptographically random, unusable password
      const randomPassword = crypto.randomBytes(32).toString('hex') + 'Aa1!'
      const nameFromEmail = email.split('@')[0] || 'Reader'

      const { data: createdUser, error: createError } = await db.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true, // Auto-confirm so user is not blocked waiting for verification
        user_metadata: {
          name: nameFromEmail,
          created_via: 'checkout_first',
        },
      })

      if (createError) {
        console.warn('[razorpay-webhook] createUser error (checking existing):', createError.message)
        // Check if user was concurrently created
        const { data: usersList } = await db.auth.admin.listUsers()
        const users = (usersList as any)?.users as Array<{ id: string; email?: string }> | undefined
        const found = users?.find((u) => u.email?.toLowerCase() === email)
        if (found?.id) {
          userId = found.id
        } else {
          throw createError
        }
      } else if (createdUser?.user?.id) {
        userId = createdUser.user.id
        isNewUser = true
      }
    }
  }

  if (!userId) {
    throw new Error(`[razorpay-webhook] Failed to resolve or create a user for email: ${email}`)
  }

  // Ensure profiles row exists and is populated
  try {
    await db.from('profiles').upsert(
      {
        id: userId,
        email,
        name: email.split('@')[0] || 'Reader',
        role: 'customer',
        provider: 'password',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
  } catch (profileUpsertErr) {
    console.warn('[razorpay-webhook] Profile sync notice:', profileUpsertErr)
  }

  // 2. Generate signed DRM-free download links & upsert entitlements
  const delivered: { title: string; downloadUrl: string; formats: string[] }[] = []

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
      console.error(
        `[razorpay-webhook] Could not sign ${storagePath}. Will use instant order download route fallback.`,
        signError,
      )
    }

    const downloadUrl = signed?.signedUrl || ''

    const { error: upsertError } = await db.from('purchases').upsert(
      {
        id: `${orderId}_${bookId}`,
        user_id: userId,
        book_id: bookId,
        title: book.title,
        author: book.author,
        format: book.formats.join(', '),
        download_url: downloadUrl,
        storage_path: storagePath,
        purchased_at: new Date().toISOString(),
        price: book.priceINR,
        cover_image: book.image,
      },
      { onConflict: 'id' },
    )

    if (upsertError) throw upsertError

    delivered.push({
      title: book.title,
      downloadUrl: downloadUrl || '',
      formats: book.formats,
    })
  }

  // 3. Update orders table to Completed and link to user_id
  try {
    await db
      .from('orders')
      .update({
        status: 'Completed',
        user_id: userId,
        customer_email: email,
      })
      .eq('id', orderId)
  } catch (orderUpdateErr) {
    console.warn('[razorpay-webhook] Order update notice:', orderUpdateErr)
  }

  // 4. Generate Supabase password recovery link for setting password
  let setPasswordLink = ''
  try {
    const siteUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://ais-dev-d7fy3oaclte56z4rubxvp6-295777212068.asia-southeast1.run.app'

    const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${siteUrl}/account?tab=account`,
      },
    })

    if (!linkError && linkData?.properties?.action_link) {
      setPasswordLink = linkData.properties.action_link
    }
  } catch (linkErr) {
    console.warn('[razorpay-webhook] Could not generate password recovery link:', linkErr)
  }

  // 5. Send ONE unified email via Resend
  const downloadToken = generateDownloadToken(orderId, email)
  await sendDeliveryEmail({
    email,
    delivered,
    orderId,
    downloadToken,
    setPasswordLink,
    isNewUser,
  })
}

interface DeliveryEmailArgs {
  email: string
  delivered: { title: string; downloadUrl: string; formats: string[] }[]
  orderId: string
  downloadToken: string
  setPasswordLink: string
  isNewUser: boolean
}

async function sendDeliveryEmail({
  email,
  delivered,
  orderId,
  downloadToken,
  setPasswordLink,
  isNewUser,
}: DeliveryEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://ais-dev-d7fy3oaclte56z4rubxvp6-295777212068.asia-southeast1.run.app'

  const directOrderDownloadUrl = `${siteUrl}/download/${orderId}?token=${downloadToken}`

  if (!email || !apiKey || !from) {
    console.warn(
      '[razorpay-webhook] RESEND_API_KEY / EMAIL_FROM not set — skipping delivery email. ' +
        'Buyer can download immediately at: ' +
        directOrderDownloadUrl,
    )
    return
  }

  try {
    const resend = new Resend(apiKey)

    const itemsHtml = delivered
      .map(
        (b) => `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #0f172a;">${escapeHtml(b.title)}</h3>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">Included formats: ${escapeHtml(b.formats.join(' • '))}</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${
              b.downloadUrl
                ? `<a href="${b.downloadUrl}" style="background-color: #059669; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; display: inline-block;">Download Direct (.ZIP)</a>`
                : ''
            }
            <a href="${directOrderDownloadUrl}" style="background-color: #312e81; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; display: inline-block;">Open DRM-Free Downloads Screen</a>
          </div>
        </div>
      `,
      )
      .join('')

    const passwordSetupHtml = setPasswordLink
      ? `
      <div style="margin-top: 32px; padding: 16px; background-color: #f1f5f9; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #1e293b;">Want to manage your library later? (Optional)</h4>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569; line-height: 1.5;">
          You can access your books anytime without a password. However, if you'd like to sign in across other devices or sync with Kindle, you can set a password here:
        </p>
        <a href="${setPasswordLink}" style="color: #312e81; font-weight: 600; font-size: 13px; text-decoration: underline;">Set an optional password &rarr;</a>
      </div>
    `
      : ''

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your SkillScale Downloads</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #0f172a; margin: 0; padding: 24px;">
        <div style="max-width: 580px; margin: 0 auto;">
          <div style="border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px;">
            <h2 style="margin: 0; color: #059669; font-size: 20px;">SkillScale</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Instant DRM-Free Access</p>
          </div>

          <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #0f172a;">Your E-Books Are Ready to Download</h1>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
            Thank you for your purchase! We've prepared your complete DRM-free library with EPUB, PDF, and MOBI builds.
          </p>

          <div style="margin-bottom: 24px;">
            <a href="${directOrderDownloadUrl}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; text-align: center; width: 100%; box-sizing: border-box;">
              Access Instant Download Screen &rarr;
            </a>
          </div>

          <div style="margin-bottom: 24px;">
            ${itemsHtml}
          </div>

          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 12px; color: #065f46; line-height: 1.5;">
              <strong>100% DRM-Free:</strong> You own these files forever. Copy them to your Kindle, iPad, phone, or laptop with zero reader apps or restrictions.
            </p>
          </div>

          ${passwordSetupHtml}

          <div style="margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center;">
            <p style="margin: 0 0 4px 0;">Order Reference: ${escapeHtml(orderId)}</p>
            <p style="margin: 0;">SkillScale Publishing Studio &bull; DRM-Free Technical &amp; Practical Guides</p>
          </div>
        </div>
      </body>
      </html>
    `

    await resend.emails.send({
      from,
      to: email,
      subject: 'Your SkillScale e-books are ready to download (DRM-free)',
      html: emailHtml,
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

