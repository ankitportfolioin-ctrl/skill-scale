'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  Mail,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  BookOpen,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { loadRazorpayScript } from '@/lib/razorpay-client'

export function CheckoutModal() {
  const {
    isCheckoutModalOpen,
    closeCheckout,
    checkoutItems,
    cart,
  } = useCart()
  const { user } = useAuth()

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate email automatically if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  if (!isCheckoutModalOpen) return null

  // Items to checkout: either specific single item chosen via "Get Instant Access", or cart items
  const items = checkoutItems.length > 0 ? checkoutItems : cart

  const totalAmount = items.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address to receive your download.')
      return
    }

    if (items.length === 0) {
      setError('No items selected for checkout.')
      return
    }

    setSubmitting(true)

    try {
      // 1. Create Razorpay order via server API
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          lines: items.map((line) => ({
            id: line.product.id,
            quantity: line.quantity,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.orderId) {
        throw new Error(data.error || 'Unable to start checkout. Please try again.')
      }

      // 2. Load Razorpay script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        throw new Error('Could not load payment checkout window. Please check your connection.')
      }

      // 3. Launch Razorpay payment modal
      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        order_id: data.orderId,
        name: 'SkillScale',
        description: 'Instant DRM-Free E-Book Access',
        prefill: { email: cleanEmail },
        theme: { color: '#059669' },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            // Verify payment signature
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                email: cleanEmail,
              }),
            })
            const verifyData = await verifyRes.json()

            const token = verifyData.downloadToken || data.downloadToken || ''
            // Immediate post-payment redirect to instant download screen without login
            window.location.href = `/download/${encodeURIComponent(response.razorpay_order_id)}?token=${encodeURIComponent(token)}`
          } catch (verifyErr) {
            console.error('Verification redirect error:', verifyErr)
            // Fallback redirect with order ID
            window.location.href = `/download/${encodeURIComponent(response.razorpay_order_id)}`
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false)
          },
        },
      })

      rzp.open()
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err?.message || 'Checkout failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Zap className="size-4" />
            </span>
            <h2 id="checkout-modal-title" className="font-heading text-sm sm:text-base font-bold text-foreground">
              Instant DRM-Free Checkout
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCheckout}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            aria-label="Close checkout"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Order Summary Item(s) */}
          <div className="space-y-2.5 mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Purchasing ({items.length} {items.length === 1 ? 'Title' : 'Titles'})
            </p>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {items.map((line) => (
                <div
                  key={line.product.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {line.product.image ? (
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
                        <Image
                          src={line.product.image}
                          alt={line.product.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-muted-foreground">
                        <BookOpen className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-heading text-sm font-bold text-foreground truncate">
                        {line.product.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {line.product.category || 'Digital Edition'} • EPUB, PDF &amp; MOBI
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-heading text-sm font-bold text-foreground">
                      ₹{(line.product.price * line.quantity).toLocaleString('en-IN')}
                    </p>
                    {line.quantity > 1 && (
                      <p className="text-[10px] text-muted-foreground">Qty: {line.quantity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 px-1 text-sm">
              <span className="text-muted-foreground">Total Due:</span>
              <span className="font-heading text-base font-bold text-foreground">
                ₹{totalAmount.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  INR
                </span>
              </span>
            </div>
          </div>

          {/* Email input field - The ONLY required field */}
          <div className="space-y-2 mb-4">
            <label
              htmlFor="checkout-email"
              className="block text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Where should we send your files? <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                id="checkout-email"
                type="email"
                required
                autoFocus={!user?.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-emerald-600 focus:outline-hidden focus:ring-1 focus:ring-emerald-600 transition"
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Your DRM-free download links, backup copy, and order receipt will be sent here immediately.
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pay Button */}
          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 px-5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Launching Razorpay...</span>
              </>
            ) : (
              <>
                <span>Continue to Payment</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          {/* Security & zero-barrier trust badges */}
          <div className="mt-4 space-y-1.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <Lock className="size-3 text-emerald-600" />
              <span>256-Bit SSL Encrypted Razorpay Checkout</span>
              <span className="text-border">•</span>
              <ShieldCheck className="size-3 text-emerald-600" />
              <span>100% DRM-Free</span>
            </div>
            <p className="text-[10px] text-muted-foreground/80">
              No account creation required to checkout. Instant access granted 4 seconds after payment.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
