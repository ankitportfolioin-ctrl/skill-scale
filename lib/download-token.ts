import crypto from 'crypto'

/**
 * Generates a tamper-proof signed token for post-payment download verification.
 * Does not require a logged-in user session, allowing immediate guest downloads.
 */
export function generateDownloadToken(orderId: string, email?: string): string {
  const secret =
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'skillscale-post-checkout-secret-token'
  const normalizedEmail = (email || '').toLowerCase().trim()
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}:${normalizedEmail}`)
    .digest('hex')
}

/**
 * Verifies that a given token matches either the orderId:email signature
 * or the orderId signature.
 */
export function verifyDownloadToken(orderId: string, token: string, email?: string): boolean {
  if (!orderId || !token) return false

  const secret =
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'skillscale-post-checkout-secret-token'

  // Check with email if provided
  if (email) {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}:${email.toLowerCase().trim()}`)
      .digest('hex')
    if (token === expected) return true
  }

  // Check general order token (fallback)
  const expectedGeneral = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}:`)
    .digest('hex')

  return token === expectedGeneral
}
