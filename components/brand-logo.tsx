'use client'

import React from 'react'
import Image from 'next/image'

interface BrandLogoProps {
  className?: string
  size?: number | 'sm' | 'md' | 'lg' | 'xl'
  alt?: string
}

export function BrandLogo({ className = '', size = 'md', alt = 'SkillScale Logo' }: BrandLogoProps) {
  let dimensionClass = 'size-9'
  let pxSize = 36

  if (typeof size === 'number') {
    dimensionClass = `size-[${size}px]`
    pxSize = size
  } else if (size === 'sm') {
    dimensionClass = 'size-7'
    pxSize = 28
  } else if (size === 'md') {
    dimensionClass = 'size-9'
    pxSize = 36
  } else if (size === 'lg') {
    dimensionClass = 'size-10'
    pxSize = 40
  } else if (size === 'xl') {
    dimensionClass = 'size-12'
    pxSize = 48
  }

  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-[#1e1b4b] text-white shadow-sm shrink-0 ${dimensionClass} ${className}`}
      title={alt}
    >
      <Image
        src="/brand-logo.png"
        alt={alt}
        width={pxSize * 2}
        height={pxSize * 2}
        className="size-full object-cover rounded-xl"
        priority
      />
    </span>
  )
}
