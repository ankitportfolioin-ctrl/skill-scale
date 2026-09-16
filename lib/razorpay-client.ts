'use client'

/**
 * Dynamically loads the Razorpay checkout script into the document head.
 * Resolves true if successfully loaded, false otherwise.
 */
let loadPromise: Promise<boolean> | null = null

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false)
  }

  // Check if already present on window
  if ((window as any).Razorpay) {
    return Promise.resolve(true)
  }

  if (loadPromise) {
    return loadPromise
  }

  loadPromise = new Promise<boolean>((resolve) => {
    // Check existing script tag
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => resolve(false))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout script.')
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return loadPromise
}
