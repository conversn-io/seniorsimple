'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_SIDEBAR_MAGNET_ID,
  DEFAULT_SIDEBAR_TOPIC_TAG,
  getCaptureConfig,
  resolveCaptureMagnet,
  type MagnetId,
  type TopicTag,
} from '@/lib/medicare-capture-config'

export interface ResolvedMagnet {
  magnetId: MagnetId
  topicTag: TopicTag
  abArm?: string
}

/**
 * Resolve a page slug to the magnet + A/B arm that should be shown in every
 * ad placement on that page (sidebar + mobile-inline). If the slug isn't in
 * the Medicare capture config, falls back to the site-wide default magnet.
 *
 * Client-only (touches sessionStorage inside resolveCaptureMagnet). Returns
 * null on the first render, then the resolved value once the effect fires,
 * so consumers should conditionally render.
 */
export function useResolvedMagnet(slug: string): ResolvedMagnet | null {
  const [resolved, setResolved] = useState<ResolvedMagnet | null>(null)

  useEffect(() => {
    const config = getCaptureConfig(slug)
    if (!config) {
      setResolved({
        magnetId: DEFAULT_SIDEBAR_MAGNET_ID,
        topicTag: DEFAULT_SIDEBAR_TOPIC_TAG,
      })
      return
    }
    const { magnetId, abArm } = resolveCaptureMagnet(config)
    setResolved({ magnetId, topicTag: config.topicTag, abArm })
  }, [slug])

  return resolved
}
