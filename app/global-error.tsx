'use client'

import React from 'react'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center font-sans">
        <h2 className="text-2xl font-bold text-slate-800">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-600">An unexpected error occurred.</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded-lg bg-indigo-900 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
