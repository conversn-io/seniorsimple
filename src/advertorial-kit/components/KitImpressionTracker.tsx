'use client'

/**
 * KitImpressionTracker — Position-Optimization Phase 2 (SPEC 2026-07-29).
 *
 * Fires one impression per (session_id, item_id) when a rendered advertorial
 * item enters the viewport. Writes go to /api/advertorial-impressions in
 * batches (single POST per flush) — the reader never waits on the fetch,
 * and page nav doesn't drop the batch (sendBeacon on unload + keepalive
 * on visibilitychange).
 *
 * How items are discovered: ComponentSwitch stamps every rendered item
 * with `data-advertorial-item-id`, `data-advertorial-rank`,
 * `data-advertorial-position`, `data-advertorial-component-type`, and
 * `data-advertorial-variant-key`. This component scans the DOM under the
 * KitCtaShell root for those attributes, attaches an IntersectionObserver
 * with `threshold: 0.5`, and records each item exactly once per mount.
 *
 * Dedup happens at two layers: client-side Set (prevents re-observation
 * from generating duplicates) + server-side unique index on
 * (session_id, item_id). Refresh, back-tap, and re-render all safe.
 */

import { useEffect, useRef } from 'react'

import {
  getOrCreateSessionId,
  SITE_KEY,
} from '@/advertorial-kit/lib/analytics'

interface KitImpressionTrackerProps {
  advertorialId: string
  chosenVariant: string | null
  /** Root element selector to scan under (defaults to `[data-advertorial]`). */
  rootSelector?: string
}

interface PendingImpression {
  advertorial_id: string
  slot_id: string | null
  item_id: string
  rank: number
  position: number | null
  component_type: string | null
  variant_key: string | null
  chosen_variant: string | null
  site_id: string
  session_id: string
  ts: string
}

const INTERSECTION_THRESHOLD = 0.5
// Flush every 5s of idle OR on the next batch trigger, whichever hits first.
// Small enough that a reader who bounces before scrolling still gets counted.
const IDLE_FLUSH_MS = 5_000
// Trigger a flush the moment we hit this many pending — avoids a 200+ item
// long-scroll piling up in memory.
const MAX_PENDING_BEFORE_FLUSH = 20

export function KitImpressionTracker({
  advertorialId,
  chosenVariant,
  rootSelector = '[data-advertorial]',
}: KitImpressionTrackerProps) {
  const observedRef = useRef<Set<string>>(new Set())
  const pendingRef = useRef<PendingImpression[]>([])
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flushedInFlightRef = useRef<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (typeof IntersectionObserver === 'undefined') return

    const sessionId = getOrCreateSessionId()
    if (!sessionId) return

    const scheduleFlush = () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current)
      flushTimerRef.current = setTimeout(flush, IDLE_FLUSH_MS)
    }

    const flush = (opts: { beacon?: boolean } = {}) => {
      if (pendingRef.current.length === 0) return
      const batch = pendingRef.current
      pendingRef.current = []
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current)
        flushTimerRef.current = null
      }
      const body = JSON.stringify({ impressions: batch })
      // sendBeacon wins on page-unload paths — it's queued by the browser
      // and delivered even after the page is torn down. Fetch keepalive
      // is the fallback for browsers that decline sendBeacon (some corp
      // proxies strip it) or when we're not in an unload scenario.
      const beacon =
        opts.beacon &&
        typeof navigator !== 'undefined' &&
        typeof navigator.sendBeacon === 'function'
      if (beacon) {
        try {
          const blob = new Blob([body], { type: 'application/json' })
          const ok = navigator.sendBeacon('/api/advertorial-impressions', blob)
          if (ok) return
        } catch {
          // fall through to fetch
        }
      }
      // fetch with keepalive — survives an in-flight navigation on the
      // click side too (same guarantee W2 uses on lp_cta_click).
      try {
        flushedInFlightRef.current = true
        void fetch('/api/advertorial-impressions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body,
        })
          .catch(() => {
            /* non-blocking */
          })
          .finally(() => {
            flushedInFlightRef.current = false
          })
      } catch {
        /* non-blocking */
      }
    }

    const enqueue = (el: Element) => {
      const dataset = (el as HTMLElement).dataset ?? {}
      const itemId = dataset['advertorialItemId']
      if (!itemId) return
      if (observedRef.current.has(itemId)) return
      observedRef.current.add(itemId)

      const rankStr = dataset['advertorialRank']
      const rank = rankStr ? parseInt(rankStr, 10) : NaN
      if (!Number.isFinite(rank) || rank < 1) return

      const positionStr = dataset['advertorialPosition']
      const position = positionStr ? parseInt(positionStr, 10) : NaN

      const slotId = dataset['advertorialSlotId'] ?? null
      const componentType = dataset['advertorialComponentType'] ?? null
      const variantKey = dataset['advertorialVariantKey'] ?? null

      pendingRef.current.push({
        advertorial_id: advertorialId,
        slot_id: slotId && slotId.length > 0 ? slotId : null,
        item_id: itemId,
        rank,
        position: Number.isFinite(position) ? position : null,
        component_type: componentType,
        variant_key: variantKey && variantKey.length > 0 ? variantKey : null,
        chosen_variant: chosenVariant,
        site_id: SITE_KEY,
        session_id: sessionId,
        ts: new Date().toISOString(),
      })

      if (pendingRef.current.length >= MAX_PENDING_BEFORE_FLUSH) {
        flush()
      } else {
        scheduleFlush()
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= INTERSECTION_THRESHOLD) {
            enqueue(entry.target)
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: [INTERSECTION_THRESHOLD] },
    )

    // Scan for items under the advertorial root. Attach observer to any
    // element carrying data-advertorial-item-id (stamped by ComponentSwitch).
    const root =
      (document.querySelector(rootSelector) as HTMLElement | null) ??
      document.body
    const targets = root.querySelectorAll<HTMLElement>('[data-advertorial-item-id]')
    targets.forEach((el) => observer.observe(el))

    // Also handle late-mounted items (Suspense boundaries, hydration
    // deltas). MutationObserver picks up any newly-added items carrying
    // the attribute and attaches the intersection observer to them.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement
          if (el.dataset && el.dataset['advertorialItemId']) {
            observer.observe(el)
          }
          // Also check descendants.
          el.querySelectorAll?.<HTMLElement>('[data-advertorial-item-id]').forEach(
            (child) => observer.observe(child),
          )
        })
      }
    })
    mo.observe(root, { childList: true, subtree: true })

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush({ beacon: true })
    }
    const onPageHide = () => flush({ beacon: true })

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', onPageHide)
    // beforeunload is the belt-and-suspenders — some browsers fire
    // pagehide but not visibilitychange during hard navigations.
    window.addEventListener('beforeunload', onPageHide)

    return () => {
      // Final flush before teardown (React strict-mode double-mount, or
      // route change within the SPA). beacon:false because the page is
      // still alive.
      flush()
      observer.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', onPageHide)
      window.removeEventListener('beforeunload', onPageHide)
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current)
    }
  }, [advertorialId, chosenVariant, rootSelector])

  return null
}
