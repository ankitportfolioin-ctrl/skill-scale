import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { razorpay } from '@/lib/razorpay'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { isBookDeliverable } from '@/lib/book-files'
import { getSellableProducts } from '@/lib/catalog-server'
import { generateDownloadToken } from '@/lib/download-token'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CartLineInput {
  id?: unknown
}

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

    const lines: CartLineInput[] = Array.isArray(body?.lines) ? body.lines : []
    if (!lines.length) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    const adminDb = getSupabaseAdmin()

    // 2. Work out the order from the products table. Prices come from the database only.
    //    Digital titles are one copy each, so quantity is always 1.
    const ids = lines.map((line) => (typeof line?.id === 'string' ? line.id : '')).filter(Boolean)
    const products = await getSellableProducts(adminDb, ids)

    let totalPaise = 0
    const items: { id: string; title: string; author?: string; quantity: number; price: number }[] = []
    const seen = new Set<string>()

    for (const id of ids) {
      if (seen.has(id)) continue
      seen.add(id)

      const product = products.get(id)
      if (!product) {
        return NextResponse.json({ error: 'One of the titles in your cart is no longer available.' }, { status: 400 })
      }

      // Never take money for, or hand out, a title we cannot deliver: it must have an uploaded file.
      if (!(await isBookDeliverable(adminDb, product.id))) {
        return NextResponse.json(
          { error: `"${product.title}" is not available yet. Please remove it from your cart.` },
          { status: 409 },
        )
      }

      totalPaise += Math.round(product.priceInr * 100)
      items.push({
        id: product.id,
        title: product.title,
        author: product.creator,
        quantity: 1,
        price: product.priceInr,
      })
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    // 3. Link to an existing customer profile if there is one.
    let existingUserId: string | null = null
    try {
      const { data: profile } = await adminDb.from('profiles').select('id').ilike('email', email).maybeSingle()
      if (profile?.id) existingUserId = profile.id
    } catch (profileErr) {
      console.warn('[checkout] Profile lookup notice:', profileErr)
    }

    // 4a. Free order: nothing to pay, so there is no payment to verify. Record it and hand back a
    //     download token straight away. No email is sent and no account is created here, so this
    //     endpoint cannot be used to send mail to other people's addresses.
    if (totalPaise === 0) {
      const freeOrderId = `order_free_${crypto.randomUUID()}`
      const { error: freeError } = await adminDb.from('orders').insert({
        id: freeOrderId,
        user_id: existingUserId,
        order_number: freeOrderId,
        total: 0,
        status: 'Completed',
        items,
        customer_email: email,
      })
      if (freeError) {
        console.error('[checkout] Could not record free order:', freeError.message)
        return NextResponse.json({ error: 'Could not start your download. Please try again.' }, { status: 500 })
      }
      return NextResponse.json({
        free: true,
        orderId: freeOrderId,
        downloadToken: generateDownloadToken(freeOrderId, email),
      })
    }

    // 4b. Paid order. Payments are switched on by adding the Razorpay keys.
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Paid downloads are not switched on yet. Free titles are available now; paid titles open soon.' },
        { status: 503 },
      )
    }

    const order = await razorpay.orders.create({
      amount: totalPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: true,
      notes: {
        email,
        bookIds: items.map((item) => item.id).join(','),
        userId: existingUserId || '',
      },
    })

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
