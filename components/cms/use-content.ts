'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import {
  defaultContent,
  getCmsState,
  subscribeToPublishedContent,
  subscribeToCmsState,
  type CmsState,
} from '@/lib/cms/storage'
import type { SiteContent } from '@/lib/cms/content'

const CMS_KEY = 'skillscale-cms-state'

export function useCmsState(options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false
  const swr = useSWR<CmsState>(enabled ? CMS_KEY : null, getCmsState, {
    revalidateOnFocus: true,
  })

  useEffect(() => {
    if (!enabled) return
    // Real-time listener for CMS administrative state
    const unsubscribe = subscribeToCmsState((nextState) => {
      swr.mutate(nextState, false)
    })
    return () => unsubscribe()
  }, [enabled, swr])

  return swr
}

/**
 * Hook to access real-time storefront content.
 * Subscribes directly to Supabase realtime updates so ANY change published by the admin
 * is immediately reflected across all browser sessions in real-time.
 */
export function useStorefrontContent(preview = false) {
  // Only invoke draft state subscriber if preview mode is explicitly active
  const cmsState = useCmsState({ enabled: preview })
  const [livePublished, setLivePublished] = useState<SiteContent>(() => {
    return defaultContent
  })
  const [isLiveConnected, setIsLiveConnected] = useState(false)

  useEffect(() => {
    if (preview) {
      // In preview mode, use the draft from CMS state
      return
    }

    const unsubscribe = subscribeToPublishedContent((updatedContent) => {
      setLivePublished(updatedContent)
      setIsLiveConnected(true)
    })

    return () => unsubscribe()
  }, [preview])

  const content = preview
    ? cmsState.data?.draft ?? defaultContent
    : livePublished

  return {
    content,
    isLoading: preview ? cmsState.isLoading : false,
    isLive: isLiveConnected,
  }
}

export function cmsCacheKey() {
  return CMS_KEY
}

