'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, ShieldAlert, LogIn, LogOut, Loader2, ShieldCheck, KeyRound } from 'lucide-react'
import { useAuth, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, isDesignatedAdmin } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

type AdminAccessStatus = 'checking' | 'authorized' | 'unauthorized' | 'unauthenticated'

export function AdminAuth({ children }: { children: React.ReactNode }) {
  const { user, authUser, isLoading: isAuthLoading, openLogin, logout, loginWithPassword } = useAuth()
  const [status, setStatus] = useState<AdminAccessStatus>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoggingInAdmin, setIsLoggingInAdmin] = useState(false)

  const verifyAdminAccess = useCallback(async (uid: string) => {
    setStatus('checking')
    setErrorMessage(null)

    try {
      const currentEmail = authUser?.email || user?.email || ''
      if (user?.role === 'admin' || isDesignatedAdmin(currentEmail)) {
        setStatus('authorized')
        return
      }
      setStatus('unauthorized')
    } catch (err: unknown) {
      console.error('Error verifying admin authorization:', err)
      const currentEmail = authUser?.email || user?.email || ''
      if (isDesignatedAdmin(currentEmail)) {
        setStatus('authorized')
        return
      }
      setStatus('unauthorized')
      setErrorMessage('Unable to verify administrator permissions due to a network or permission error.')
    }
  }, [authUser, user])

  useEffect(() => {
    if (isAuthLoading) {
      setStatus('checking')
      return
    }

    const currentUid = authUser?.id || user?.id

    if (!currentUid) {
      setStatus('unauthenticated')
      return
    }

    verifyAdminAccess(currentUid)
  }, [isAuthLoading, authUser, user, verifyAdminAccess])

  // 1. Loading State
  if (status === 'checking' || isAuthLoading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="size-8 animate-spin text-[#312E81]" />
          <p className="font-heading text-lg font-semibold text-slate-800">
            Verifying administrator authorization...
          </p>
            <p className="text-xs text-slate-500">Checking credentials with Supabase</p>
        </div>
      </main>
    )
  }

  // 2. Unauthenticated State (No Supabase user)
  if (status === 'unauthenticated') {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to storefront
        </Link>

        <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#312E81] text-white">
            <Lock aria-hidden="true" className="size-6" />
          </div>

          <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight text-slate-900">
            Please sign in to access the admin panel.
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            This workspace requires administrator credentials. Sign in with your verified administrator account to continue.
          </p>

          {/* Default Admin Credentials Notice & Quick Action */}
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 text-xs text-indigo-950">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-indigo-600" />
                Default Admin Credentials
              </span>
              <span className="rounded bg-indigo-200/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800">
                Active
              </span>
            </div>
            <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-700">
              <p>
                <span className="text-slate-400">ID:</span>{' '}
                <strong className="text-indigo-950 select-all">{DEFAULT_ADMIN_EMAIL}</strong>
              </p>
              <p>
                <span className="text-slate-400">Pass:</span>{' '}
                <strong className="text-indigo-950 select-all">{DEFAULT_ADMIN_PASSWORD}</strong>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              id="admin-auth-quick-login-btn"
              type="button"
              disabled={isLoggingInAdmin}
              onClick={async () => {
                setIsLoggingInAdmin(true)
                await loginWithPassword(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)
                setIsLoggingInAdmin(false)
              }}
              className="h-11 w-full gap-2 bg-[#312E81] text-white hover:bg-[#28256a] font-semibold cursor-pointer shadow-sm"
            >
              {isLoggingInAdmin ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing In as Admin...
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  Sign In as Default Admin
                </>
              )}
            </Button>

            <Button
              id="admin-auth-login-btn"
              type="button"
              onClick={() => openLogin()}
              variant="outline"
              className="h-11 w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              <LogIn className="size-4" />
              Sign In with Custom Account
            </Button>

            <Button
              id="admin-auth-back-btn"
              nativeButton={false}
              render={<Link href="/" />}
              variant="ghost"
              className="h-10 w-full text-slate-600 hover:text-slate-900"
            >
              Return to Storefront
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // 3. Unauthorized State (Authenticated user, but no valid admin document)
  if (status === 'unauthorized') {
    const signedInEmail = authUser?.email || user?.email || 'your account'

    return (
      <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to storefront
        </Link>

        <div className="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
            <ShieldAlert aria-hidden="true" className="size-6" />
          </div>

          <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight text-slate-900">
            You are not authorized to access the admin panel.
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            The account <strong className="font-semibold text-slate-800">{signedInEmail}</strong> does not have administrator privileges.
          </p>

          {errorMessage && (
            <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-100">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Button
              id="admin-auth-signout-btn"
              type="button"
              onClick={async () => {
                await logout()
                setStatus('unauthenticated')
              }}
              variant="outline"
              className="h-11 w-full gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>

            <Button
              id="admin-auth-return-storefront-btn"
              nativeButton={false}
              render={<Link href="/" />}
              className="h-11 w-full bg-[#312E81] text-white hover:bg-[#28256a] font-semibold"
            >
              Return to Storefront
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // 4. Authorized: Render the Admin Panel
  return <>{children}</>
}
