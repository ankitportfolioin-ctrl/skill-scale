'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function ProductRedirectClient({ slug }: { slug: string }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/ebooks/${slug}`)
  }, [router, slug])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <meta httpEquiv="refresh" content={`0;url=/ebooks/${slug}`} />
      <div className="size-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-4" />
      <p className="text-sm font-medium text-slate-700">Redirecting to e-book details...</p>
      <Link
        href={`/ebooks/${slug}`}
        className="mt-3 text-xs text-indigo-600 underline hover:text-indigo-800"
      >
        Click here if not redirected automatically
      </Link>
    </div>
  )
}
