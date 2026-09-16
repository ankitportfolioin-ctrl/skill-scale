'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Sparkles, X, BookOpen, Gift, ArrowRight, Copy, LogOut, User, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ReaderAccount {
  name: string
  email: string
  selectedTopics: string[]
  joinedAt: string
}

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AccountModal({ isOpen, onClose, onSuccess }: AccountModalProps) {
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<'register' | 'signin' | 'profile'>('register')
  const [account, setAccount] = useState<ReaderAccount | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    'Technical Guides',
    'AI & Architecture',
  ])
  const [copiedCode, setCopiedCode] = useState(false)
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check existing stored account on open
  useEffect(() => {
    if (!isOpen) return
    try {
      const stored = localStorage.getItem('skillscale_reader_account')
      if (stored) {
        const parsed = JSON.parse(stored) as ReaderAccount
        setAccount(parsed)
        setMode('profile')
        setName(parsed.name || '')
        setEmail(parsed.email || '')
        if (parsed.selectedTopics) setSelectedTopics(parsed.selectedTopics)
      } else {
        setAccount(null)
        setMode('register')
      }
    } catch {
      setAccount(null)
      setMode('register')
    }
  }, [isOpen])

  // Keydown and body scroll lock
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    )
  }

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    const newAccount: ReaderAccount = {
      name: name.trim(),
      email: email.trim(),
      selectedTopics,
      joinedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem('skillscale_reader_account', JSON.stringify(newAccount))
      window.dispatchEvent(new Event('skillscale:account-updated'))
    } catch {
      // ignore
    }

    setAccount(newAccount)
    setSubmittedMessage('Reader account created! 15% discount unlocked.')
    setMode('profile')
    if (onSuccess) onSuccess()
  }

  const handleSignInSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const signedInAccount: ReaderAccount = {
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      selectedTopics,
      joinedAt: account?.joinedAt || new Date().toISOString(),
    }

    try {
      localStorage.setItem('skillscale_reader_account', JSON.stringify(signedInAccount))
      window.dispatchEvent(new Event('skillscale:account-updated'))
    } catch {
      // ignore
    }

    setAccount(signedInAccount)
    setSubmittedMessage('Successfully signed in!')
    setMode('profile')
    if (onSuccess) onSuccess()
  }

  const handleSignOut = () => {
    try {
      localStorage.removeItem('skillscale_reader_account')
      window.dispatchEvent(new Event('skillscale:account-updated'))
    } catch {
      // ignore
    }
    setAccount(null)
    setName('')
    setEmail('')
    setPassword('')
    setSubmittedMessage(null)
    setMode('signin')
  }

  const handleCopyPromo = () => {
    const markCopied = () => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2500)
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText('READER15').then(markCopied).catch(() => undefined)
    }
  }

  const modalContent = (
    <div
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/45 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-background p-6 shadow-2xl sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          id="close-account-modal-button"
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X className="size-5" />
        </button>

        {submittedMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Sparkles className="size-4 shrink-0 text-emerald-600" />
            <span>{submittedMessage}</span>
          </div>
        )}

        {/* Tab Switcher (if not in logged-in profile view) */}
        {mode !== 'profile' && (
          <div className="mb-6 flex rounded-xl bg-muted/60 p-1">
            <button
              id="tab-create-account"
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Free Account (15% Off)
            </button>
            <button
              id="tab-sign-in"
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
          </div>
        )}

        {/* MODE 1: CREATE ACCOUNT */}
        {mode === 'register' && (
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Gift className="size-5" />
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                Exclusive 15% Welcome Perk
              </span>
            </div>

            <h2 id="account-modal-title" className="mt-4 font-heading text-2xl font-bold tracking-tight text-primary">
              Create Your Free Reader Account
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Save your favorite e-books, get personalized new release alerts, and unlock your 15% discount for any digital guide.
            </p>

            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Full Name
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Select Your Topics of Interest
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Technical Guides',
                    'AI & Architecture',
                    'Design & UX',
                    'Self-Help & Growth',
                    'Fiction & Sci-Fi',
                  ].map((topic) => {
                    const active = selectedTopics.includes(topic)
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer border ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {active && <Check className="inline-block mr-1 size-3" />}
                        {topic}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-2">
                <Button id="btn-submit-register" type="submit" className="h-12 w-full bg-success text-success-foreground hover:bg-success/90 font-semibold shadow-md">
                  Claim 15% Off & Create Free Account
                </Button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  No credit card required. 100% DRM-free library access.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* MODE 2: SIGN IN */}
        {mode === 'signin' && (
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <User className="size-5" />
              </span>
              <span className="text-xs font-semibold text-primary">
                SkillScale Reader Portal
              </span>
            </div>

            <h2 id="account-modal-title" className="mt-4 font-heading text-2xl font-bold tracking-tight text-primary">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in to view your purchased library, downloads, and member discounts.
            </p>

            <form onSubmit={handleSignInSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="signin-email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="signin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signin-password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-3.5 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button id="btn-submit-signin" type="submit" className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md">
                  Sign In to Reader Account
                </Button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="mt-3 block w-full text-center text-xs text-primary hover:underline"
                >
                  Don&apos;t have an account? Create one for 15% off
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODE 3: PROFILE (LOGGED IN) */}
        {mode === 'profile' && account && (
          <div className="py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#1e1b4b] text-lg font-bold text-white shadow-sm">
                  {account.name ? account.name.charAt(0).toUpperCase() : 'R'}
                </div>
                <div>
                  <h2 id="account-modal-title" className="font-heading text-xl font-bold text-primary">
                    {account.name || 'Reader'}
                  </h2>
                  <p className="text-xs text-muted-foreground">{account.email}</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700">
                Active Member
              </span>
            </div>

            {/* Promo Code Box */}
            <div className="mt-5 rounded-2xl border border-dashed border-emerald-500 bg-emerald-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest text-emerald-800 font-bold">
                  Your 15% Reader Discount Code
                </span>
                <button
                  id="btn-copy-promo-code"
                  type="button"
                  onClick={handleCopyPromo}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="size-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <div className="mt-2 font-mono text-2xl font-bold tracking-wider text-emerald-800">
                READER15
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Automatically applied at checkout or use code <strong className="font-mono">READER15</strong> on any order.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <Button
                id="btn-modal-browse-ebooks"
                type="button"
                onClick={onClose}
                className="h-11 w-full gap-2 bg-primary text-primary-foreground font-semibold"
              >
                <BookOpen className="size-4" />
                Browse DRM-Free E-Books
              </Button>

              <button
                id="btn-modal-sign-out"
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
