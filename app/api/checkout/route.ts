import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { EBOOKS_CATALOG } from '@/lib/ebooks-data'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isBookDeliverable } from '@/lib/book-files'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    // 1. Validate customer email (the only required field for checkout)
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'A valid email address is required so we can deliver your download links.' },
        { status: 400 },
      )
    }

    const lines = Array.isArray(body?.lines) ? body.lines : []
    if (!lines.length) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    const adminDb = getSupabaseAdmin()

    // 2. Calculate order totals securely from catalog
    let totalPaise = 0
    const items = [] as {
      id: string
      title: string
      author?: string
      quantity: number
      price: number
    }[]
    const ids: string[] = []

    for (const line of lines) {
      const book = EBOOKS_CATALOG.find((b) => b.id === line.id)
      if (!book) {
        return NextResponse.json({ error: `Unknown book in order: ${line.id}` }, { status: 400 })
      }
      // Never take money for a title we cannot deliver: it must have an uploaded file.
      if (!(await isBookDeliverable(adminDb, book.id))) {
        return NextResponse.json(
          { error: `"${book.title}" is not available yet. Please remove it from your cart.` },
          { status: 409 },
        )
      }
      const quantity = Math.max(1, Math.min(10, Math.floor(line.quantity) || 1))
      totalPaise += Math.round(book.priceINR * 100) * quantity
      items.push({
        id: book.id,
        title: book.title,
        author: book.author,
        quantity,
        price: book.priceINR,
      })
      ids.push(book.id)
    }

    // 3. Check if a Supabase user profile already exists for this email
    // If it exists, link to the existing user. Otherwise keep null until server-side webhook creation.
    let existingUserId: string | null = null

    try {
      const { data: profile } = await adminDb
        .from('profiles')
        .select('id, email')
        .ilike('email', email)
        .maybeSingle()

      if (profile?.id) {
        existingUserId = profile.id
      }
    } catch (profileErr) {
      console.warn('[checkout] Profile lookup notice:', profileErr)
    }

    // 4. Create Razorpay order
    // Razorpay standard checkout in India requires only customer email for digital delivery.
    const orderReceipt = `rcpt_${Date.now()}`
    const order = await razorpay.orders.create({
      amount: totalPaise,
      currency: 'INR',
      receipt: orderReceipt,
      payment_capture: true,
      notes: {
        email,
        bookIds: ids.join(','),
        userId: existingUserId || '',
      },
    })

    // 5. Record the order using the admin service-role client.
    // No download token is issued here: this runs BEFORE the customer has paid. A token is only
    // issued after Razorpay's signature is verified (verify-payment route / webhook).
    // supabase-js returns errors instead of throwing, so check explicitly. If the order cannot be
    // saved we stop here, before the customer is asked to pay for something we cannot deliver.
    const { error: insertError } = await adminDb.from('orders').insert({
      id: order.id,
      user_id: existingUserId,
      order_number: order.id,
      total: totalPaise / 100,
      status: 'Processing',
      items,
      customer_email: email,
    })
    if (insertError) {
      console.error('[checkout] Could not record order:', insertError.message)
      return NextResponse.json(
        { error: 'Could not start checkout. Please try again in a moment.' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      orderId: order.id,
      amount: totalPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      prefillEmail: email,
    })
  } catch (err) {
    console.error('[checkout] Error starting checkout:', err)
    return NextResponse.json(
      { error: 'Could not start checkout. Please check your connection and try again.' },
      { status: 500 },
    )
  }
}
