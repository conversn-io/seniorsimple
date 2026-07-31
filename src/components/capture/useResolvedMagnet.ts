'use client'

import { useEffect, useState } from 'react'
import {
  getCaptureConfig,
  resolveCaptureMagnet,
  resolveDefaultForSlug,
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
 * ad placement on that page (sidebar + mobile-inline). Resolution order:
 *   1. Exact match in MEDICARE_CAPTURE_CONFIG → use configured magnet + A/B
 *   2. Otherwise pattern-match via resolveDefaultForSlug → pillar-appropriate
 *      default (FE-family slugs → fe-buyers-guide; everything else → decision-kit)
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
      const fallback = resolveDefaultForSlug(slug)
      setResolved({
        magnetId: fallback.magnetId,
        topicTag: fallback.topicTag,
      })
      return
    }
    const { magnetId, abArm } = resolveCaptureMagnet(config)
    setResolved({ magnetId, topicTag: config.topicTag, abArm })
  }, [slug])

  return resolved
}
