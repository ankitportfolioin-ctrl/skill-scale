'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import {
  X,
  User,
  Download,
  ShoppingBag,
  Heart,
  LogOut,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Mail,
  Calendar,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { useAuth, AccountTab } from '@/lib/auth-context'
import { EBOOKS_CATALOG } from '@/lib/ebooks-data'
import { supabase } from '@/lib/supabase'

export function AccountDashboardModal() {
  const {
    user,
    isAccountModalOpen,
    activeAccountTab,
    closeAccountDashboard,
    openAccountDashboard,
    logout,
    wishlist,
    toggleWishlist,
    purchases,
    orders,
  } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on Escape & body scroll lock
  useEffect(() => {
    if (!isAccountModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAccountDashboard()
    }
    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isAccountModalOpen, closeAccountDashboard])

  if (!mounted || !isAccountModalOpen || !user) return null

  const handleCopyCode = () => {
    if (!navigator.clipboard?.writeText) return
    navigator.clipboard.writeText('SKILL15').then(() => {
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }).catch(() => undefined)
  }

  // Find wishlist books from catalog
  const wishlistBooks = EBOOKS_CATALOG.filter((book) => wishlist.includes(book.id))

  const tabs: { id: AccountTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'purchases', label: 'Purchases & Downloads', icon: Download },
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ]

  return createPortal(
    <div
      id="account-dashboard-dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-dashboard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeAccountDashboard}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        id="account-dashboard-dialog-card"
        className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#312E81] text-white font-bold text-base uppercase shadow-xs">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <h2 id="account-dashboard-title" className="font-heading text-lg font-bold text-slate-900 leading-tight">
                {user.name}
              </h2>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="account-logout-header-btn"
              type="button"
              onClick={() => {
                closeAccountDashboard()
                logout()
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

            <button
              id="account-close-modal-btn"
              type="button"
              onClick={closeAccountDashboard}
              aria-label="Close dashboard"
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeAccountTab === tab.id
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                onClick={() => openAccountDashboard(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#312E81] text-[#312E81]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`size-4 ${isActive ? 'text-[#312E81]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'wishlist' && wishlist.length > 0 && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600 font-bold">
                    {wishlist.length}
                  </span>
                )}
                {tab.id === 'purchases' && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] text-emerald-700 font-bold">
                    {purchases.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
          {/* 1. My Account Tab */}
          {activeAccountTab === 'account' && (
            <div className="space-y-6">
              {/* Promo code reminder */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#10B981] text-white">
                      <Sparkles className="size-4" />
                    </span>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-emerald-950">
                        15% Reader Welcome Discount
                      </h3>
                      <p className="mt-0.5 text-xs text-emerald-800">
                        Use this code at checkout to take 15% off any technical guide or bundle.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100/50 shadow-2xs transition cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-slate-400" />
                        <span>SKILL15</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Profile Details Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Profile Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Full Name</label>
                    <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Email Address</label>
                    <p className="font-semibold text-slate-800 text-sm">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Account Created</label>
                    <p className="font-medium text-slate-700">{user.joinedAt}</p>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Authentication Method</label>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 capitalize">
                      <ShieldCheck className="size-3 text-emerald-600" />
                      {user.provider}
                    </span>
                  </div>
                </div>
              </div>

              {/* DRM-Free Reading Commitment */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="size-5 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">100% DRM-Free Ownership Guarantee</h4>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      Every guide in your SkillScale library is provided in universal EPUB and PDF formats. You own your files forever with zero vendor lock-in and lifetime free errata updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. My Purchases & Downloads Tab */}
          {activeAccountTab === 'purchases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Your Reading Library</h3>
                  <p className="text-xs text-slate-500">
                    Instant access to EPUB and PDF files with permanent cloud backup.
                  </p>
                </div>
                <Link
                  href="/ebooks"
                  onClick={closeAccountDashboard}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#312E81] hover:underline"
                >
                  Browse more guides <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {purchases.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <Download className="size-8 mx-auto text-slate-400 mb-2" />
                  <h4 className="text-sm font-semibold text-slate-800">No purchases yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When you purchase a technical guide or bundle, your download links and receipt will appear here immediately.
                  </p>
                  <Link
                    href="/ebooks"
                    onClick={closeAccountDashboard}
                    className="inline-flex items-center gap-1.5 mt-4 rounded-xl bg-[#312E81] px-4 py-2 text-xs font-semibold text-white hover:bg-[#28256a]"
                  >
                    Explore E-Books
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                          <Image
                            src={purchase.coverImage || 'https://picsum.photos/seed/bookcover/400/600'}
                            alt={purchase.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-heading text-sm font-bold text-slate-900 line-clamp-1">
                            {purchase.title}
                          </h4>
                          <p className="text-xs text-slate-500">By {purchase.author}</p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{purchase.format}</span>
                            <span>•</span>
                            <span>{purchase.fileSize}</span>
                            <span>•</span>
                            <span>{purchase.purchasedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          disabled={downloadingId === purchase.id}
                          onClick={async () => {
                            setDownloadingId(purchase.id)
                            try {
                              const { data: { session } } = await supabase.auth.getSession()
                              const idToken = session?.access_token
                              if (!idToken) return
                              const res = await fetch('/api/purchases/download', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                                body: JSON.stringify({ purchaseId: purchase.id }),
                              })
                              const data = await res.json()
                              if (res.ok && data.url) {
                                window.open(data.url, '_blank', 'noopener,noreferrer')
                              }
                            } finally {
                              setDownloadingId(null)
                            }
                          }}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 shadow-2xs transition cursor-pointer"
                        >
                          <Download className="size-3.5" />
                          <span>{downloadingId === purchase.id ? 'Preparing…' : 'Download Files'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Order History Tab */}
          {activeAccountTab === 'orders' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">Order Receipts</h3>
                <p className="text-xs text-slate-500">
                  Tax invoices and confirmation history for your accounting records.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <ShoppingBag className="size-8 mx-auto text-slate-400 mb-2" />
                  <h4 className="text-sm font-semibold text-slate-800">No orders found</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your previous orders will appear here with downloadable VAT invoices.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                        <div>
                          <span className="font-semibold text-slate-900">{order.orderNumber}</span>
                          <span className="text-slate-400 mx-2">•</span>
                          <span className="text-slate-500">{order.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            {order.status}
                          </span>
                          <span className="font-heading text-sm font-bold text-slate-900">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.title} × {item.quantity}</span>
                              <span className="font-medium text-slate-900">${item.price.toFixed(2)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex justify-between text-slate-500">
                            <span>Digital order</span>
                            <span className="font-medium text-slate-900">${order.total.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Wishlist Tab */}
          {activeAccountTab === 'wishlist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">Saved for Later</h3>
                  <p className="text-xs text-slate-500">
                    Guides you have bookmarked for your future reading list.
                  </p>
                </div>
                <Link
                  href="/ebooks"
                  onClick={closeAccountDashboard}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#312E81] hover:underline"
                >
                  Browse all guides <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {wishlistBooks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <Heart className="size-8 mx-auto text-slate-300 mb-2" />
                  <h4 className="text-sm font-semibold text-slate-800">Your wishlist is empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click the heart icon on any e-book in the marketplace to save it here for later.
                  </p>
                  <Link
                    href="/ebooks"
                    onClick={closeAccountDashboard}
                    className="inline-flex items-center gap-1.5 mt-4 rounded-xl bg-[#312E81] px-4 py-2 text-xs font-semibold text-white hover:bg-[#28256a]"
                  >
                    Browse E-Books
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wishlistBooks.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                          <Image
                            src={book.image}
                            alt={book.title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-heading text-xs font-bold text-slate-900 truncate">
                            {book.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                          <span className="font-heading text-xs font-bold text-[#312E81]">
                            ${book.price}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          href={`/ebooks/${book.slug}`}
                          onClick={closeAccountDashboard}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(book.id)}
                          aria-label={`Remove ${book.title} from wishlist`}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
