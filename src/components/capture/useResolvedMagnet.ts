'use client'

import { useEffect, useState } from 'react'
import type { CaptureKit, MagnetId, TopicTag } from '@/lib/capture-kits/types'
import { getPageConfig, resolvePageMagnet } from '@/lib/capture-kits'

export interface ResolvedMagnet {
  magnetId: MagnetId
  topicTag: TopicTag
  abArm?: string
}

/**
 * Resolve a page slug to the magnet + A/B arm that should be shown in every
 * ad placement on that page (sidebar + mobile-inline). If the slug isn't in
 * the kit's pageConfigs, falls back to the kit's defaultSidebar* values.
 *
 * Client-only (touches sessionStorage inside resolvePageMagnet). Returns null
 * on the first render, then the resolved value once the effect fires, so
 * consumers should conditionally render.
 */
export function useResolvedMagnet(kit: CaptureKit, slug: string): ResolvedMagnet | null {
  const [resolved, setResolved] = useState<ResolvedMagnet | null>(null)

  useEffect(() => {
    const config = getPageConfig(kit, slug)
    if (!config) {
      setResolved({
        magnetId: kit.defaultSidebarMagnetId,
        topicTag: kit.defaultSidebarTopicTag,
      })
      return
    }
    const { magnetId, abArm } = resolvePageMagnet(config)
    setResolved({ magnetId, topicTag: config.topicTag, abArm })
  }, [kit, slug])

  return resolved
}
