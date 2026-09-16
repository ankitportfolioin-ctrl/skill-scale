'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { formatGoogleDriveImageUrl, extractGoogleDriveFileId } from '@/lib/cms/drive'

export interface ProductCoverImageProps {
  src?: string
  alt: string
  title?: string
  author?: string
  category?: string
  variant?: 'card' | 'detail' | 'modal' | 'thumb'
  priority?: boolean
  unoptimized?: boolean
  className?: string
  sizes?: string
  badge?: string
  onLoadStatus?: (status: 'loading' | 'loaded' | 'error') => void
  showPlaceholderNotice?: boolean
  children?: React.ReactNode
}

// Category palette mappings for stylized fallback book covers
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

/**
 * Standardized Product Cover Image Component
 *
 * Enforces a consistent 4:5 portrait aspect ratio across all views
 * (product cards, catalog grid, product detail showcase, and quick-view modals).
 * Always uses object-fit: cover and object-position: center to guarantee
 * identical relative crop and zoom regardless of viewport or container width.
 */
export function ProductCoverImage({
  src,
  alt,
  title,
  author,
  category,
  variant = 'card',
  priority = false,
  unoptimized = true,
  className = '',
  sizes,
  badge,
  onLoadStatus,
  showPlaceholderNotice = false,
  children,
}: ProductCoverImageProps) {
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

    // Otherwise show stylized fallback cover
    setHasError(true)
    onLoadStatus?.('error')
  }

  const categoryStyle = (category && CATEGORY_GRADIENTS[category]) || {
    bg: 'from-slate-900 via-indigo-950 to-slate-950',
    accent: 'text-indigo-400 border-indigo-500/30',
  }

  // Variant-specific responsive size hints for Next.js image optimization
  const resolvedSizes =
    sizes ||
    (variant === 'detail'
      ? '(max-width: 1024px) 100vw, 650px'
      : variant === 'modal'
        ? '(max-width: 1024px) 100vw, 450px'
        : variant === 'thumb'
          ? '80px'
          : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px')

  return (
    <div
      className={`group/cover relative aspect-[4/5] w-full overflow-hidden bg-muted ${className}`}
    >
      {hasError || !currentSrc ? (
        // Stylized Fallback Cover (maintains exact 4:5 aspect ratio)
        <div
          className={`relative flex size-full flex-col justify-between overflow-hidden bg-gradient-to-br ${categoryStyle.bg} p-5 text-white select-none`}
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
              <span
                className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${categoryStyle.accent}`}
              >
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
      ) : (
        // Standard Next.js Image with strict object-fit: cover and object-position: center
        <Image
          src={currentSrc}
          alt={alt || title || 'Product cover image'}
          fill
          sizes={resolvedSizes}
          priority={priority}
          unoptimized={unoptimized}
          onLoad={() => {
            setHasError(false)
            onLoadStatus?.('loaded')
          }}
          onError={handleError}
          className="object-cover object-center transition-transform duration-300 group-hover/cover:scale-[1.02]"
        />
      )}

      {/* Optional Badge */}
      {badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-highlight px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-highlight-foreground shadow-sm">
          {badge}
        </span>
      )}

      {/* Children for hover overlays, buttons, etc. */}
      {children}
    </div>
  )
}
