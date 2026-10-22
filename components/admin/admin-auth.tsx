'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock, ShieldAlert, LogIn, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type AdminAccessStatus = 'checking' | 'authorized' | 'unauthorized' | 'unauthenticated'

export function AdminAuth({ children }: { children: React.ReactNode }) {
  const { user, authUser, isLoading: isAuthLoading, openLogin, logout } = useAuth()
  const [status, setStatus] = useState<AdminAccessStatus>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const verifyAdminAccess = useCallback(async (uid: string) => {
    setStatus('checking')
    setErrorMessage(null)

    try {
      // The `admins` table is the source of truth. Only an existing admin can write to it (RLS),
      // so unlike an email list or a profile field it cannot be set by the visitor.
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('id', uid)
        .eq('enabled', true)
        .maybeSingle()

      if (error) throw error
      setStatus(data ? 'authorized' : 'unauthorized')
    } catch (err: unknown) {
      console.error('Error verifying admin authorization:', err)
      setStatus('unauthorized')
      setErrorMessage('Unable to verify administrator permissions due to a network or permission error.')
    }
  }, [])

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

          <div className="mt-6 flex flex-col gap-3">
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
