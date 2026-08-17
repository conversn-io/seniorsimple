'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  MAGNETS,
  type CaptureVariant,
  type MagnetId,
  type TopicTag,
} from '@/lib/medicare-capture-config'
import { trackCaptureEvent } from '@/lib/medicare-capture-analytics'
import MagnetCaptureForm from './MagnetCaptureForm'

export interface MedicareCaptureUnitProps {
  pageSlug: string
  /** 'inline' — always-visible in-content panel. 'tool-gate' — post-result panel. */
  variant: Extract<CaptureVariant, 'inline' | 'tool-gate'>
  magnetId: MagnetId
  topicTag: TopicTag
  resultPayload?: unknown
  abArm?: string
  className?: string
  /**
   * Override the panel copy. Defaults derive from the magnet (tool pages want
   * "Email me my Medicare estimate"); article placements pass topic-matched
   * copy so the offer reads as an upgrade of the piece being read.
   */
  heading?: string
  subhead?: string
}

/**
 * Full-form capture panel. Two variants survive here:
 *   - 'inline'    → always-visible in-content panel
 *   - 'tool-gate' → shown alongside the tool result (with resultPayload)
 *
 * Used by the two tool pages (calculator + comparison tool) and, via
 * `ArticleInlineMagnetCTA`, in-body on the high-dwell article pages (WO-666).
 * Articles also keep the ResourceAdCard → LP flow in the sidebar; this panel is
 * the on-page capture that credits `magnet:<slug>` directly.
 *
 * Fires capture_impression when the panel scrolls into view. Everything below
 * that (form state, subscribe wiring, analytics for submit/confirm, magnet
 * delivery, success-with-download) is delegated to MagnetCaptureForm.
 */
export default function MedicareCaptureUnit({
  pageSlug,
  variant,
  magnetId,
  topicTag,
  resultPayload,
  abArm,
  className = '',
  heading: headingOverride,
  subhead: subheadOverride,
}: MedicareCaptureUnitProps) {
  const magnet = MAGNETS[magnetId]
  const hostRef = useRef<HTMLElement | null>(null)

  const fireImpression = useCallback(() => {
    trackCaptureEvent({
      eventName: 'capture_impression',
      pageSlug,
      variant,
      magnetId,
      topicTag,
      abArm,
    })
  }, [pageSlug, variant, magnetId, topicTag, abArm])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = hostRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      fireImpression()
      return
    }

    let fired = false
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !fired) {
            fired = true
            fireImpression()
            io.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [fireImpression])

  const heading =
    headingOverride ??
    (magnetId === 'tool-result'
      ? 'Email me my Medicare estimate'
      : `Free ${magnet.title}`)
  const subhead =
    subheadOverride ??
    (magnetId === 'tool-result'
      ? 'Get a copy of your estimate plus a plain-English Medicare planning guide. No agent, no sales calls.'
      : 'A plain-English guide from SeniorSimple. No agent, no sales calls — just the information you asked for.')

  return (
    <section
      ref={hostRef as React.RefObject<HTMLElement>}
      className={`my-12 py-12 px-6 rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, #36596A 0%, #82A6B1 100%)',
      }}
      aria-labelledby={`capture-heading-${pageSlug}-${variant}`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2
            id={`capture-heading-${pageSlug}-${variant}`}
            className="text-3xl font-serif font-semibold text-white mb-3"
          >
            {heading}
          </h2>
          <p className="text-lg text-white/90">{subhead}</p>
        </div>
        <MagnetCaptureForm
          pageSlug={pageSlug}
          surface="magnet"
          variant={variant}
          magnetId={magnetId}
          topicTag={topicTag}
          resultPayload={resultPayload}
          abArm={abArm}
          theme="gradient"
        />
      </div>
    </section>
  )
}
