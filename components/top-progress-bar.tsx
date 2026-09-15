'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'

/**
 * TopProgressBar provides instant visual feedback when navigating between pages.
 * By using standard Next.js Link prefetching combined with this sleek top loading bar,
 * route transitions feel immediate and responsive without layout lag.
 */
export function TopProgressBar() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    // When pathname finishes changing, turn off the loading bar immediately
    setLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href) return

      // Ignore external links, hash anchors, mailto, tel, downloads
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('http') ||
        target.getAttribute('target') === '_blank' ||
        target.hasAttribute('download')
      ) {
        return
      }

      // Check if it's the current path
      const targetUrl = new URL(href, window.location.href)
      if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
        return
      }

      // Trigger instant top progress bar
      startTransition(() => {
        setLoading(true)
      })
    }

    document.addEventListener('click', handleAnchorClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true })
    }
  }, [])

  if (!loading) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-transparent"
    >
      <div className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-progress" />
    </div>
  )
}
