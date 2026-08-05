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
 * Deterministic magnet resolution for a page slug. Runs in a `useState`
 * initializer so the value is available on the FIRST render (server-safe) —
 * critical so the sidebar / inline ad card appears in server HTML instead of
 * empty-until-hydration.
 *
 * Resolution order:
 *   1. Exact match in MEDICARE_CAPTURE_CONFIG → use its magnetId + topicTag
 *   2. Otherwise pattern-match via `resolveDefaultForSlug` → pillar-appropriate
 *      default (FE-family slugs → fe-buyers-guide; everything else → decision-kit)
 *
 * A/B arm assignment is deferred to a client-side effect since it needs
 * `sessionStorage` — only meaningful for tool-page configs that carry `abTest`.
 * For article pages (which don't have A/B) the effect is a no-op and the
 * synchronous initial value is the final value.
 */
function computeInitial(slug: string): ResolvedMagnet {
  const config = getCaptureConfig(slug)
  if (!config) {
    const fallback = resolveDefaultForSlug(slug)
    return { magnetId: fallback.magnetId, topicTag: fallback.topicTag }
  }
  return { magnetId: config.magnetId, topicTag: config.topicTag }
}

export function useResolvedMagnet(slug: string): ResolvedMagnet {
  // Lazy initializer runs once on mount (server + client) — same value both places.
  const [resolved, setResolved] = useState<ResolvedMagnet>(() =>
    computeInitial(slug),
  )

  // Client-only A/B arm resolution. Only fires for configs with `abTest` set;
  // article pages don't have A/B so this is a no-op there.
  useEffect(() => {
    const config = getCaptureConfig(slug)
    if (!config?.abTest) return
    const { magnetId, abArm } = resolveCaptureMagnet(config)
    setResolved({ magnetId, topicTag: config.topicTag, abArm })
  }, [slug])

  return resolved
}
