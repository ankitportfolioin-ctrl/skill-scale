import 'server-only'
import Razorpay from 'razorpay'

/**
 * Razorpay SDK singleton.
 *
 * Deliberately fails loudly when keys are missing. The previous version fell back to
 * 'rzp_test_placeholder' / 'placeholder_secret', which turned a missing-config problem
 * into an opaque "authentication failed" at checkout time — much harder to diagnose in
 * production than a startup error naming the exact variable.
 */

let razorpayClient: Razorpay | null = null

export function getRazorpay(): Razorpay {
  if (razorpayClient) return razorpayClient

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    throw new Error(
      'FATAL: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must both be set. ' +
        'Find them in Razorpay Dashboard > Settings > API Keys.',
    )
  }

  razorpayClient = new Razorpay({ key_id, key_secret })
  return razorpayClient
}

// Lazy proxy so a missing key throws when the SDK is actually used at request time,
// rather than at module-import time during `next build`.
export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const client = getRazorpay()
    const val = (client as any)[prop]
    return typeof val === 'function' ? val.bind(client) : val
  },
})
