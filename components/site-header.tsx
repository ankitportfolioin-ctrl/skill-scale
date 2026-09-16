'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, FormEvent } from 'react'
import {
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  X,
  Settings,
  ArrowRight,
  BookOpen,
  User,
  ShieldCheck,
  Zap,
  Gift,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { useAuth, AccountTab } from '@/lib/auth-context'
import { AuthModal } from '@/components/auth/auth-modal'
import { AccountDashboardModal } from '@/components/auth/account-dashboard-modal'
import { useStorefrontContent } from '@/components/cms/use-content'

interface SiteHeaderProps {
  onSearch?: (query: string) => void
  initialSearch?: string
}

export function SiteHeader({ onSearch, initialSearch = '' }: SiteHeaderProps) {
  const { content } = useStorefrontContent()
  const pathname = usePathname()
  const router = useRouter()
  const { cartCount, openCart } = useCart()
  const {
    user,
    openLogin,
    openSignUp,
    openAccountDashboard,
    logout,
    wishlist,
  } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [query, setQuery] = useState(initialSearch)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [announcementPaused, setAnnouncementPaused] = useState(false)

  // Auto-rotate announcement bar every 4.5 seconds
  useEffect(() => {
    if (announcementPaused) return
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev === 0 ? 1 : 0))
    }, 4500)
    return () => clearInterval(timer)
  }, [announcementPaused])

  // Close dropdown on click outside
  useEffect(() => {
    if (!accountDropdownOpen) return
    const closeDropdown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('#account-pill-wrapper')) {
        setAccountDropdownOpen(false)
      }
    }
    window.addEventListener('click', closeDropdown)
    return () => window.removeEventListener('click', closeDropdown)
  }, [accountDropdownOpen])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/ebooks', label: 'E-Books' },
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
  ]

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(query)
    } else {
      router.push(`/ebooks?search=${encodeURIComponent(query)}`)
    }
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Announcement Bar: Standardized to #1e1b4b, single message at a time to prevent mobile wrapping */}
      {content?.announcement?.enabled !== false && (
        <aside
          aria-label="Store Announcements"
          onMouseEnter={() => setAnnouncementPaused(true)}
          onMouseLeave={() => setAnnouncementPaused(false)}
          className="relative bg-[#1e1b4b] px-2.5 py-1.5 sm:px-4 sm:py-2 text-center text-xs font-medium text-white transition-colors select-none overflow-hidden"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 sm:gap-2 sm:px-6">
            <button
              type="button"
              onClick={() => setAnnouncementIndex((prev) => (prev === 0 ? 1 : 0))}
              aria-label="Previous announcement"
              suppressHydrationWarning
              className="flex size-6 shrink-0 items-center justify-center rounded text-indigo-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            <div className="flex-1 overflow-hidden min-w-0">
              {announcementIndex === 0 ? (
                <div
                  key="msg-0"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 animate-in fade-in duration-300 min-w-0"
                >
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 shrink-0 text-[11px] sm:text-xs">
                    <Zap className="size-3 sm:size-3.5 shrink-0" />
                    <span>Instant Delivery</span>
                  </span>
                  <span className="hidden sm:inline text-indigo-300">•</span>
                  <span className="text-indigo-100 truncate text-[11px] sm:text-xs">
                    {content?.announcement?.text || '100% DRM-Free EPUB, PDF & MOBI on all devices'}
                  </span>
                </div>
              ) : (
                <div
                  key="msg-1"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 animate-in fade-in duration-300 min-w-0"
                >
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-300 shrink-0 text-[11px] sm:text-xs">
                    <Gift className="size-3 sm:size-3.5 shrink-0" />
                    <span>Reader Perk</span>
                  </span>
                  <span className="hidden sm:inline text-indigo-300">•</span>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => {
                      if (user) {
                        openAccountDashboard('account')
                      } else {
                        openSignUp()
                      }
                    }}
                    className="font-medium text-white underline underline-offset-2 hover:text-emerald-300 transition cursor-pointer truncate text-[11px] sm:text-xs"
                  >
                    Create free account for 15% off
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <div className="hidden sm:flex items-center gap-1 mr-1">
                <span
                  className={`size-1.5 rounded-full transition-all ${
                    announcementIndex === 0 ? 'bg-emerald-400 w-3' : 'bg-white/30'
                  }`}
                />
                <span
                  className={`size-1.5 rounded-full transition-all ${
                    announcementIndex === 1 ? 'bg-amber-400 w-3' : 'bg-white/30'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => setAnnouncementIndex((prev) => (prev === 0 ? 1 : 0))}
                aria-label="Next announcement"
                suppressHydrationWarning
                className="flex size-6 shrink-0 items-center justify-center rounded text-indigo-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 sm:gap-2.5 transition hover:opacity-90 min-w-0"
            aria-label="SkillScale E-Books Home"
          >
            <span className="relative flex size-8 sm:size-9 items-center justify-center overflow-hidden rounded-xl bg-[#1e1b4b] text-xs font-bold text-white shadow-sm shrink-0">
              <Image
                src="/brand-logo.png"
                alt="SkillScale Logo"
                width={36}
                height={36}
                className="size-full object-cover rounded-xl"
                priority
              />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-primary leading-tight truncate">
                SkillScale
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium tracking-wide uppercase text-muted-foreground -mt-0.5 truncate">
                E-Book Library
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 ml-4 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground/80 hover:bg-muted hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Search bar on desktop */}
          <div className="ml-auto hidden min-w-0 max-w-xs flex-1 md:block">
            <form onSubmit={handleSearchSubmit}>
              <label className="relative block">
                <span className="sr-only">Search e-books</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="search"
                  value={query}
                  suppressHydrationWarning
                  onChange={(e) => {
                    setQuery(e.target.value)
                    if (onSearch) onSearch(e.target.value)
                  }}
                  placeholder="Search e-books, authors, topics..."
                  className="h-9 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </form>
          </div>

          {/* Right Action Controls Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto md:ml-0">
            {/* Reader Account Pill / User Avatar Dropdown */}
            <div className="relative" id="account-pill-wrapper">
              {user ? (
                <div className="relative">
                  <button
                    id="header-user-avatar-button"
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setAccountDropdownOpen((prev) => !prev)}
                    aria-expanded={accountDropdownOpen}
                    aria-haspopup="menu"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 sm:px-2.5 sm:py-1 text-xs font-semibold text-slate-800 shadow-2xs transition hover:bg-slate-50 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#312E81]"
                  >
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[#312E81] text-[11px] font-bold text-white uppercase shrink-0">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </span>
                    <span className="hidden sm:inline-block font-semibold text-slate-800 max-w-[85px] truncate">
                      {user.name ? (user.name.includes('@') ? user.name.split('@')[0] : user.name.split(' ')[0]) : 'Account'}
                    </span>
                    <ChevronDown
                      className={`hidden sm:inline-block size-3.5 text-slate-400 transition-transform duration-150 ${
                        accountDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {accountDropdownOpen && (
                    <div
                      id="user-account-dropdown"
                      role="menu"
                      aria-orientation="vertical"
                      className="absolute right-0 mt-1.5 w-52 sm:w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100 z-50 text-xs"
                    >
                      <div className="border-b border-slate-100 px-2.5 py-2">
                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <button
                        id="menu-item-my-account"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountDropdownOpen(false)
                          openAccountDashboard('account')
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                      >
                        <User className="size-4 text-slate-500" />
                        My Account
                      </button>

                      <button
                        id="menu-item-my-purchases"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountDropdownOpen(false)
                          openAccountDashboard('purchases')
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                      >
                        <Download className="size-4 text-slate-500" />
                        My Purchases & Downloads
                      </button>

                      <button
                        id="menu-item-order-history"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountDropdownOpen(false)
                          openAccountDashboard('orders')
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                      >
                        <ShoppingBag className="size-4 text-slate-500" />
                        Order History
                      </button>

                      <button
                        id="menu-item-wishlist"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountDropdownOpen(false)
                          openAccountDashboard('wishlist')
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Heart className="size-4 text-slate-500" />
                          Wishlist
                        </span>
                        {wishlist.length > 0 && (
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600">
                            {wishlist.length}
                          </span>
                        )}
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        id="menu-item-logout"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setAccountDropdownOpen(false)
                          logout()
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="header-account-button"
                  type="button"
                  suppressHydrationWarning
                  onClick={() => openLogin()}
                  aria-haspopup="dialog"
                  aria-label="Log in to SkillScale"
                  className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-border bg-card px-2 sm:px-3 py-1.5 text-xs font-semibold text-primary shadow-2xs transition hover:bg-muted active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <User className="size-3.5 text-primary shrink-0" />
                  <span className="hidden min-[420px]:inline font-semibold">Account</span>
                  <span className="hidden md:inline-flex rounded-lg bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">
                    15% Off
                  </span>
                </button>
              )}
            </div>

            {/* Cart Trigger */}
            <Button
              type="button"
              variant="ghost"
              className="relative size-9 sm:size-10 p-0"
              onClick={openCart}
              aria-label={`Open shopping cart with ${cartCount} items`}
            >
              <ShoppingBag className="size-4 sm:size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 sm:size-5 items-center justify-center rounded-full bg-success text-[9px] sm:text-[10px] font-bold text-success-foreground shadow">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="flex size-9 sm:size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden cursor-pointer shrink-0"
            >
              {mobileOpen ? <X className="size-4 sm:size-5" /> : <Menu className="size-4 sm:size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            className="border-t border-border bg-background p-4 shadow-xl lg:hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <form onSubmit={handleSearchSubmit} className="mb-3 block">
              <label className="relative block">
                <span className="sr-only">Search e-books on mobile</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="search"
                  value={query}
                  suppressHydrationWarning
                  onChange={(e) => {
                    setQuery(e.target.value)
                    if (onSearch) onSearch(e.target.value)
                  }}
                  placeholder="Search titles, authors, genres..."
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </form>

            <nav className="grid gap-1" aria-label="Mobile navigation links">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                      active
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                )
              })}

              <div className="border-t border-border mt-2 pt-2 space-y-1">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        openAccountDashboard('account')
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <User className="size-4 text-primary" />
                        {user.name} (My Account)
                      </span>
                      <ArrowRight className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        openAccountDashboard('purchases')
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 text-left cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Download className="size-4 text-slate-500" />
                        My Purchases & Downloads
                      </span>
                      <ArrowRight className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <LogOut className="size-4" />
                        Log Out
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      id="mobile-nav-login-button"
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        openLogin()
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-primary hover:bg-muted text-left cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <User className="size-4" />
                        Log In
                      </span>
                      <ArrowRight className="size-4" />
                    </button>
                    <button
                      id="mobile-nav-signup-button"
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        openSignUp()
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-success hover:bg-success/10 text-left cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="size-4" />
                        Sign Up (Get 15% Off)
                      </span>
                      <ArrowRight className="size-4" />
                    </button>
                  </>
                )}

                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <span className="inline-flex items-center gap-2">
                    <Settings className="size-4" />
                    Store Admin & CMS
                  </span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal (Login, Sign Up, Forgot Password, Reset Password) */}
      <AuthModal />

      {/* Reader Account Dashboard Modal */}
      <AccountDashboardModal />
    </>
  )
}
