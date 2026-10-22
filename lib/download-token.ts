import crypto from 'crypto'

/**
 * Download tokens prove that a payment for an order has been VERIFIED.
 *
 * They must only ever be issued after Razorpay's signature has been checked: in
 * app/api/verify-payment/route.ts and in the Razorpay webhook. They must NOT be issued at
 * checkout, which happens before the customer has paid.
 */

function getSecret(): string {
  const secret = process.env.RAZORPAY_KEY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) {
    // No hardcoded fallback: a known default secret would let anyone forge tokens.
    throw new Error('Download tokens require RAZORPAY_KEY_SECRET (or SUPABASE_SERVICE_ROLE_KEY) to be set.')
  }
  return secret
}

const normalizeEmail = (email?: string) => (email || '').toLowerCase().trim()

function sign(message: string): string {
  return crypto.createHmac('sha256', getSecret()).update(message).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

/** Token for an order whose payment has been verified. Bound to the order and customer email. */
export function generateDownloadToken(orderId: string, email?: string): string {
  return sign(`paid-v2:${orderId}:${normalizeEmail(email)}`)
}

export function verifyDownloadToken(orderId: string, token: string, email?: string): boolean {
  if (!orderId || !token) return false
  return safeEqual(token, generateDownloadToken(orderId, email))
}

/**
 * Tokens issued by the previous version were minted at checkout, before payment. They are only
 * honoured for orders the webhook has marked Completed, so links already emailed to paying
 * customers keep working while tokens for unpaid orders are worthless.
 */
export function verifyLegacyDownloadToken(orderId: string, token: string, email?: string): boolean {
  if (!orderId || !token || !email) return false
  return safeEqual(token, sign(`${orderId}:${normalizeEmail(email)}`))
}
