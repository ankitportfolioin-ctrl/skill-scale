import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { generateDownloadToken } from '@/lib/download-token'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { orderCustomerEmail } from '@/lib/order-access'

// This gives the browser an immediate yes/no so it can show "Payment successful" and open the
// download page without waiting on the webhook. The order itself is only FULFILLED (entitlements
// written, email sent) in app/api/webhooks/razorpay/route.ts.
//
// The download token returned here is only issued when Razorpay's signature checks out, which
// requires a real payment id and signature from Razorpay. The email the token is bound to comes
// from the order row we saved at checkout, never from this request body.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string' ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json({ verified: false, error: 'Missing payment details.' }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ verified: false, error: 'Server misconfigured.' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    const a = Buffer.from(expectedSignature)
    const b = Buffer.from(razorpay_signature)
    const verified = a.length === b.length && crypto.timingSafeEqual(a, b)

    if (!verified) {
      return NextResponse.json({ verified: false, orderId: razorpay_order_id, downloadToken: '' })
    }

    const { data: order } = await getSupabaseAdmin()
      .from('orders')
      .select('id, customer_email, items')
      .eq('id', razorpay_order_id)
      .maybeSingle()

    if (!order) {
      // Payment is genuine but we have no record of the order. Do not hand out a token for it.
      console.error('[verify-payment] Verified payment for an unknown order:', razorpay_order_id)
      return NextResponse.json({ verified: true, orderId: razorpay_order_id, downloadToken: '' })
    }

    return NextResponse.json({
      verified: true,
      orderId: razorpay_order_id,
      downloadToken: generateDownloadToken(razorpay_order_id, orderCustomerEmail(order)),
    })
  } catch (err) {
    console.error('Payment verification error:', err)
    return NextResponse.json({ verified: false, error: 'Verification failed.' }, { status: 500 })
  }
}
