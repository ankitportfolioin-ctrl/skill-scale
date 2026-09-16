'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { formatGoogleDriveImageUrl, extractGoogleDriveFileId } from '@/lib/cms/drive'

interface BookCoverImageProps {
  src?: string
  alt: string
  title?: string
  author?: string
  category?: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  unoptimized?: boolean
  portrait?: boolean
  onLoadStatus?: (status: 'loading' | 'loaded' | 'error') => void
  showPlaceholderNotice?: boolean
}

// Category palette mappings for stylized book covers
const CATEGORY_GRADIENTS: Record<string, { bg: string; accent: string }> = {
  'AI & Prompting': {
    bg: 'from-violet-950 via-indigo-900 to-slate-950',
    accent: 'text-violet-400 border-violet-500/30',
  },
  'Design & Tokens': {
    bg: 'from-amber-950 via-orange-900 to-stone-950',
    accent: 'text-amber-400 border-amber-500/30',
  },
  'Systems & DevOps': {
    bg: 'from-emerald-950 via-teal-900 to-slate-950',
    accent: 'text-emerald-400 border-emerald-500/30',
  },
  'Technical Guides': {
    bg: 'from-blue-950 via-sky-900 to-slate-950',
    accent: 'text-sky-400 border-sky-500/30',
  },
  'Self-Help': {
    bg: 'from-rose-950 via-amber-950 to-slate-950',
    accent: 'text-rose-400 border-rose-500/30',
  },
  'Speculative': {
    bg: 'from-fuchsia-950 via-purple-900 to-slate-950',
    accent: 'text-fuchsia-400 border-fuchsia-500/30',
  },
}

export function BookCoverImage({
  src,
  alt,
  title,
  author,
  category,
  fill = true,
  width,
  height,
  className = '',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px',
  priority = false,
  unoptimized = true,
  portrait = true,
  onLoadStatus,
  showPlaceholderNotice = false,
}: BookCoverImageProps) {
  const [hasError, setHasError] = useState(false)
  const [triedFallback, setTriedFallback] = useState(false)
  const [currentSrc, setCurrentSrc] = useState<string>('')

  // Compute resolved initial URL
  useEffect(() => {
    const formatted = formatGoogleDriveImageUrl(src)
    setCurrentSrc(formatted)
    setHasError(false)
    setTriedFallback(false)
    if (formatted) {
      onLoadStatus?.('loading')
    }
  }, [src, onLoadStatus])

  const handleError = () => {
    // If it's a Google Drive link, try thumbnail endpoint as second attempt
    const fileId = extractGoogleDriveFileId(src || '')
    if (fileId && !triedFallback) {
      setTriedFallback(true)
      setCurrentSrc(`https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`)
      return
    }

    // Otherwise show beautiful fallback cover instead of broken image icon
    setHasError(true)
    onLoadStatus?.('error')
  }

  const categoryStyle = (category && CATEGORY_GRADIENTS[category]) || {
    bg: 'from-slate-900 via-indigo-950 to-slate-950',
    accent: 'text-indigo-400 border-indigo-500/30',
  }

  // Fallback stylized cover
  if (hasError || !currentSrc) {
    return (
      <div
        className={`relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br ${categoryStyle.bg} p-4 text-white shadow-inner select-none ${
          fill ? 'size-full' : ''
        } ${className}`}
      >
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"
          aria-hidden="true"
        />

        {showPlaceholderNotice && (
          <div className="absolute top-2 right-2 z-20 rounded bg-black/80 px-2 py-0.5 text-[9px] font-medium text-amber-300 border border-amber-400/40 shadow-sm backdrop-blur">
            Image Inaccessible (Fallback)
          </div>
        )}

        {/* Top bar: Imprint & Category */}
        <div className="relative z-10 flex items-center justify-between gap-1 text-[10px] uppercase tracking-wider font-semibold opacity-90">
          <span className="flex items-center gap-1">
            <BookOpen className="size-3" /> SkillScale
          </span>
          {category && (
            <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${categoryStyle.accent}`}>
              {category}
            </span>
          )}
        </div>

        {/* Center: Title & Author */}
        <div className="relative z-10 my-auto py-3">
          <h4 className="font-heading font-bold text-sm sm:text-base leading-snug line-clamp-3 text-white tracking-tight drop-shadow-sm">
            {title || alt || 'SkillScale Edition'}
          </h4>
          {author && (
            <p className="mt-1 text-xs text-white/70 font-medium line-clamp-1">
              by {author}
            </p>
          )}
        </div>

        {/* Bottom bar: Format stamp */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2 text-[9px] text-white/60 font-mono">
          <span>DRM-FREE</span>
          <span>EPUB · PDF</span>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={currentSrc}
      alt={alt || title || 'Book cover'}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onLoad={() => {
        setHasError(false)
        onLoadStatus?.('loaded')
      }}
      onError={handleError}
      className={`${portrait ? 'object-contain' : 'object-cover'} ${className}`}
    />
  )
}
