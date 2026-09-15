import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// This gives the browser an immediate yes/no so it can show "Payment successful" without
// waiting on the webhook. It is NOT what fulfills the order — that only ever happens in
// app/api/webhooks/razorpay/route.ts, which Razorpay calls server-to-server and which cannot
// be spoofed by the browser. Trusting this endpoint alone for fulfillment would let anyone
// who can call this API claim a purchase without actually paying.
export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
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

    const verified = expectedSignature === razorpay_signature
    return NextResponse.json({ verified })
  } catch (err) {
    console.error('Payment verification error:', err)
    return NextResponse.json({ verified: false, error: 'Verification failed.' }, { status: 500 })
  }
}
