'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  User,
  AlertCircle,
  KeyRound,
} from 'lucide-react'
import { useAuth, AuthScreen } from '@/lib/auth-context'

export function AuthModal() {
  const {
    user,
    isAuthModalOpen,
    currentScreen,
    closeAuth,
    setScreen,
    loginWithPassword,
    loginWithMagicLink,
    signUpWithPassword,
    loginWithOAuth,
    requestPasswordReset,
    resetPassword,
  } = useAuth()

  const [mounted, setMounted] = useState(false)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)

  // Password visibility
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Status & validation states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null)

  // Field touched states for inline validation on blur
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  // Clear errors when changing screen
  useEffect(() => {
    setGeneralError(null)
    setGeneralSuccess(null)
    setTouched({})
  }, [currentScreen])

  // ESC key and body scroll lock
  useEffect(() => {
    if (!isAuthModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuth()
    }
    window.addEventListener('keydown', handleKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isAuthModalOpen, closeAuth])

  if (!mounted || !isAuthModalOpen) return null

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  // Inline validation calculations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const emailError =
    touched.email && !email.trim()
      ? 'Please enter your email address.'
      : touched.email && !emailRegex.test(email.trim())
      ? 'Enter a valid email address (e.g. name@domain.com).'
      : null

  const nameError =
    currentScreen === 'signup' && touched.name && !name.trim()
      ? 'Please enter your name.'
      : null

  const passwordError =
    touched.password && !password
      ? 'Please enter a password.'
      : touched.password && password.length < 8
      ? 'Password must be at least 8 characters.'
      : null

  const confirmPasswordError =
    (currentScreen === 'signup' || currentScreen === 'reset-password') &&
    touched.confirmPassword &&
    confirmPassword !== password
      ? 'Passwords do not match.'
      : null

  const termsError =
    currentScreen === 'signup' && touched.terms && !agreedTerms
      ? 'You must accept the Terms of Service & Privacy Policy to continue.'
      : null

  // Submit Handlers
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!email.trim() || !emailRegex.test(email.trim()) || !password) return

    setIsSubmitting(true)
    setGeneralError(null)

    const result = await loginWithPassword(email, password)
    setIsSubmitting(false)

    if (!result.success) {
      setGeneralError(result.error || "That email or password doesn't match what we have.")
    }
  }

  const handleMagicLinkSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ email: true })
    if (!email.trim() || !emailRegex.test(email.trim())) return

    setIsSubmitting(true)
    setGeneralError(null)

    const result = await loginWithMagicLink(email)
    setIsSubmitting(false)

    if (result.success) {
      setGeneralSuccess(
        result.message || 'Magic link sent! Check your inbox to sign in with one click.'
      )
    } else {
      setGeneralError(result.error || 'Unable to send magic link. Please try again.')
    }
  }

  const handleSignUpSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirmPassword: true, terms: true })

    if (!name.trim() || !emailRegex.test(email.trim()) || password.length < 8 || password !== confirmPassword || !agreedTerms) {
      return
    }

    setIsSubmitting(true)
    setGeneralError(null)

    const result = await signUpWithPassword(name, email, password)
    setIsSubmitting(false)

    if (!result.success) {
      setGeneralError(result.error || "We couldn't create that account — try logging in instead.")
    }
  }

  const handleForgotPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ email: true })
    if (!email.trim() || !emailRegex.test(email.trim())) return

    setIsSubmitting(true)
    setGeneralError(null)

    const result = await requestPasswordReset(email)
    setIsSubmitting(false)

    if (result.success) {
      setGeneralSuccess(
        result.message ||
          'If that email is in our system, we sent a password reset link to it. Check your inbox and spam folder.'
      )
    } else {
      setGeneralError(result.error || 'Unable to send password reset email. Please try again.')
    }
  }

  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ password: true, confirmPassword: true })
    if (password.length < 8 || password !== confirmPassword) return

    setIsSubmitting(true)
    setGeneralError(null)

    const result = await resetPassword(password)
    setIsSubmitting(false)

    if (result.success) {
      setGeneralSuccess('Your password has been updated. You can now log in.')
      setTimeout(() => {
        setScreen('login')
        setGeneralSuccess(null)
      }, 2000)
    } else {
      setGeneralError(result.error || 'Unable to update password. Please try again.')
    }
  }

  const handleOAuthClick = async (provider: 'google' | 'github') => {
    setIsSubmitting(true)
    setGeneralError(null)
    try {
      const result = await loginWithOAuth(provider)
      if (!result.success && result.error) {
        setGeneralError(result.error)
      }
    } catch (err: any) {
      setGeneralError(err?.message || 'Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div
      id="skillscale-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/50 backdrop-blur-[2px] animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuth()
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-[#F8FAFC] p-6 shadow-2xl sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          type="button"
          onClick={closeAuth}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* ========================================================================= */}
        {/* SCREEN 1: LOGIN */}
        {/* ========================================================================= */}
        {currentScreen === 'login' && (
          <div>
            <div className="text-left">
              <h2 id="auth-modal-title" className="font-heading text-2xl font-bold tracking-tight text-[#1e1b4b]">
                Log In to SkillScale
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Access your DRM-free purchases, downloads, and account details.
              </p>
            </div>

            {generalError && (
              <div
                id="login-error-message"
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800"
              >
                <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Email
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                      emailError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                    }`}
                  />
                </div>
                {emailError && <p className="mt-1 text-xs text-rose-600">{emailError}</p>}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className={`h-11 w-full rounded-xl border bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                      passwordError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1 text-xs text-rose-600">{passwordError}</p>}

                {/* "Forgot password?" link directly under the password field */}
                <div className="mt-1.5 flex justify-end">
                  <button
                    id="link-forgot-password"
                    type="button"
                    onClick={() => setScreen('forgot-password')}
                    className="text-xs font-semibold text-[#312E81] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Primary Button: Deep Indigo #312E81 */}
              <button
                id="btn-submit-login"
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#312E81] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#28256a] active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </button>
            </form>

            {/* Social Logins: Google & GitHub */}
            <div className="relative my-5 text-center text-xs text-slate-400">
              <span className="bg-[#F8FAFC] px-3 font-medium uppercase tracking-wider text-slate-500">
                Or continue with
              </span>
              <div className="absolute inset-0 top-1/2 -z-10 border-t border-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-oauth-google"
                type="button"
                onClick={() => handleOAuthClick('google')}
                disabled={isSubmitting}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition cursor-pointer"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google
              </button>

              <button
                id="btn-oauth-github"
                type="button"
                onClick={() => handleOAuthClick('github')}
                disabled={isSubmitting}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition cursor-pointer"
              >
                <svg className="size-4 shrink-0 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                GitHub
              </button>
            </div>

            {/* Password-less / Magic link login option */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setScreen('magic-link')}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
              >
                <Mail className="size-3.5 text-emerald-600" />
                Email me a one-click magic link instead
              </button>
            </div>

            {/* Below the form: New here? Create an account */}
            <div className="mt-6 text-center text-xs text-slate-600">
              New here?{' '}
              <button
                id="link-switch-to-signup"
                type="button"
                onClick={() => setScreen('signup')}
                className="font-semibold text-[#312E81] hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 2: SIGN UP */}
        {/* ========================================================================= */}
        {currentScreen === 'signup' && (
          <div>
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-[#10B981]">
                <Sparkles className="size-3.5" />
                Welcome Perk
              </div>
              <h2 id="auth-modal-title" className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#1e1b4b]">
                Get 15% Off Your First Guide
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Create your account to unlock lifetime DRM-free access and your coupon code.
              </p>
            </div>

            {generalError && (
              <div
                id="signup-error-message"
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800"
              >
                <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1">
                  <span>{generalError}</span>
                  {generalError.includes('try logging in instead') && (
                    <button
                      type="button"
                      onClick={() => setScreen('login')}
                      className="ml-1.5 font-bold text-[#312E81] underline cursor-pointer"
                    >
                      Log in here
                    </button>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="mt-5 space-y-3.5" noValidate>
              {/* Name */}
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Name
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched('name')}
                    placeholder="Alex Rivera"
                    autoComplete="name"
                    required
                    className={`h-10 w-full rounded-xl border bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                      nameError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                    }`}
                  />
                </div>
                {nameError && <p className="mt-1 text-xs text-rose-600">{nameError}</p>}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className={`h-10 w-full rounded-xl border bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                      emailError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                    }`}
                  />
                </div>
                {emailError && <p className="mt-1 text-xs text-rose-600">{emailError}</p>}
              </div>

              {/* Password with requirement hint */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                  >
                    Password
                  </label>
                  <span className="text-[11px] font-medium text-slate-500">8+ characters</span>
                </div>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched('password')}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    className={`h-10 w-full rounded-xl border bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                      passwordError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {passwordError && <p className="mt-1 text-xs text-rose-600">{passwordError}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="signup-confirm-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => markTouched('confirmPassword')}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    className={`h-10 w-full rounded-xl border bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                      confirmPasswordError
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <p className="mt-1 text-xs text-rose-600">{confirmPasswordError}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    id="signup-agree-terms"
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => {
                      setAgreedTerms(e.target.checked)
                      markTouched('terms')
                    }}
                    className="mt-1 size-4 rounded border-slate-300 text-[#312E81] focus:ring-[#312E81]"
                    required
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="/about#terms" target="_blank" className="font-semibold text-[#312E81] underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/about#privacy" target="_blank" className="font-semibold text-[#312E81] underline">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {termsError && <p className="mt-1 text-xs text-rose-600">{termsError}</p>}
              </div>

              {/* Primary button: Create My Account */}
              <button
                id="btn-submit-signup"
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#312E81] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#28256a] active:scale-[0.99] transition cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Creating Account...' : 'Create My Account'}
              </button>
            </form>

            {/* Social options */}
            <div className="relative my-4 text-center text-xs text-slate-400">
              <span className="bg-[#F8FAFC] px-3 font-medium uppercase tracking-wider text-slate-500">
                Or sign up with
              </span>
              <div className="absolute inset-0 top-1/2 -z-10 border-t border-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-oauth-google-signup"
                type="button"
                onClick={() => handleOAuthClick('google')}
                disabled={isSubmitting}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition cursor-pointer"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google
              </button>

              <button
                id="btn-oauth-github-signup"
                type="button"
                onClick={() => handleOAuthClick('github')}
                disabled={isSubmitting}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition cursor-pointer"
              >
                <svg className="size-4 shrink-0 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                GitHub
              </button>
            </div>

            {/* Below form: Already have an account? Log in */}
            <div className="mt-5 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <button
                id="link-switch-to-login"
                type="button"
                onClick={() => setScreen('login')}
                className="font-semibold text-[#312E81] hover:underline cursor-pointer"
              >
                Log in
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 3: FORGOT PASSWORD */}
        {/* ========================================================================= */}
        {currentScreen === 'forgot-password' && (
          <div>
            <div className="text-left">
              <h2 id="auth-modal-title" className="font-heading text-2xl font-bold tracking-tight text-[#1e1b4b]">
                Forgot Password
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            {generalSuccess ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
                  <Check className="size-4 shrink-0 text-[#10B981] mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900">Check your inbox</p>
                    <p className="mt-1 leading-relaxed">{generalSuccess}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setScreen('login')}
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Return to Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="mt-5 space-y-4" noValidate>
                {generalError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800"
                  >
                    <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{generalError}</span>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                  >
                    Email
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => markTouched('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                        emailError
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                      }`}
                    />
                  </div>
                  {emailError && <p className="mt-1 text-xs text-rose-600">{emailError}</p>}
                </div>

                <button
                  id="btn-submit-forgot"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#312E81] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#28256a] active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                </button>

                <div className="text-center text-xs text-slate-600">
                  Remembered your password?{' '}
                  <button
                    type="button"
                    onClick={() => setScreen('login')}
                    className="font-semibold text-[#312E81] hover:underline cursor-pointer"
                  >
                    Back to Log In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 4: RESET PASSWORD */}
        {/* ========================================================================= */}
        {currentScreen === 'reset-password' && (
          <div>
            <div className="text-left">
              <h2 id="auth-modal-title" className="font-heading text-2xl font-bold tracking-tight text-[#1e1b4b]">
                Reset Your Password
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Choose a new, secure password for your SkillScale account.
              </p>
            </div>

            {generalSuccess ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
                  <Check className="size-4 shrink-0 text-[#10B981] mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900">Password Updated</p>
                    <p className="mt-1 leading-relaxed">{generalSuccess}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="mt-5 space-y-4" noValidate>
                {generalError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800">
                    <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{generalError}</span>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="reset-password-input"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      New Password
                    </label>
                    <span className="text-[11px] font-medium text-slate-500">8+ characters</span>
                  </div>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reset-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => markTouched('password')}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      required
                      className={`h-11 w-full rounded-xl border bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                        passwordError
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {passwordError && <p className="mt-1 text-xs text-rose-600">{passwordError}</p>}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => markTouched('confirmPassword')}
                      placeholder="Repeat new password"
                      autoComplete="new-password"
                      required
                      className={`h-11 w-full rounded-xl border bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                        confirmPasswordError
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="mt-1 text-xs text-rose-600">{confirmPasswordError}</p>
                  )}
                </div>

                <button
                  id="btn-submit-reset-password"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#312E81] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#28256a] active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SCREEN 5: MAGIC LINK */}
        {/* ========================================================================= */}
        {currentScreen === 'magic-link' && (
          <div>
            <div className="text-left">
              <h2 id="auth-modal-title" className="font-heading text-2xl font-bold tracking-tight text-[#1e1b4b]">
                Sign In With Magic Link
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Purchased without setting a password? We&apos;ll send a one-click link straight to your inbox.
              </p>
            </div>

            {generalSuccess ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
                  <Check className="size-4 shrink-0 text-[#10B981] mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900">Magic Link Sent</p>
                    <p className="mt-1 leading-relaxed">{generalSuccess}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setScreen('login')}
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Return to Log In
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLinkSubmit} className="mt-5 space-y-4" noValidate>
                {generalError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800"
                  >
                    <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                    <span>{generalError}</span>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="magic-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                  >
                    Your Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="magic-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => markTouched('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className={`h-11 w-full rounded-xl border bg-white pl-10 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                        emailError
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                          : 'border-slate-200 focus:border-[#312E81] focus:ring-2 focus:ring-[#312E81]/10'
                      }`}
                    />
                  </div>
                  {emailError && <p className="mt-1 text-xs text-rose-600">{emailError}</p>}
                </div>

                <button
                  id="btn-submit-magic-link"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Magic Link...' : 'Send Magic Link &rarr;'}
                </button>

                <div className="text-center text-xs text-slate-600">
                  Prefer password?{' '}
                  <button
                    type="button"
                    onClick={() => setScreen('login')}
                    className="font-semibold text-[#312E81] hover:underline cursor-pointer"
                  >
                    Log in with password
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
