'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { CaptureKit, CaptureVariant, MagnetId, TopicTag } from '@/lib/capture-kits/types'
import { getMagnet } from '@/lib/capture-kits'
import { trackCaptureEvent } from '@/lib/capture-analytics'
import MagnetCaptureForm from './MagnetCaptureForm'

export interface CaptureUnitProps {
  kit: CaptureKit
  pageSlug: string
  /** 'inline' — always-visible in-content panel. 'tool-gate' — post-result panel. */
  variant: Extract<CaptureVariant, 'inline' | 'tool-gate'>
  magnetId: MagnetId
  topicTag: TopicTag
  resultPayload?: unknown
  abArm?: string
  className?: string
}

/**
 * Full-form capture panel used inline on tool pages (calculators, comparison
 * tools). Article pages don't use this — they get the ResourceAdCard → LP
 * flow via ArticleSidebar. Only two variants survive here:
 *   - 'inline'    → always-visible below the tool
 *   - 'tool-gate' → shown alongside the tool result (with resultPayload)
 *
 * Fires capture_impression when the panel scrolls into view. Everything below
 * (form state, subscribe wiring, submit/confirm analytics, magnet delivery,
 * success-with-download) is delegated to MagnetCaptureForm.
 */
export default function CaptureUnit({
  kit,
  pageSlug,
  variant,
  magnetId,
  topicTag,
  resultPayload,
  abArm,
  className = '',
}: CaptureUnitProps) {
  const magnet = getMagnet(kit, magnetId)
  const hostRef = useRef<HTMLElement | null>(null)

  const fireImpression = useCallback(() => {
    trackCaptureEvent({
      eventName: 'capture_impression',
      vertical: kit.vertical,
      pageSlug,
      variant,
      magnetId,
      topicTag,
      abArm,
    })
  }, [kit.vertical, pageSlug, variant, magnetId, topicTag, abArm])

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

  if (!magnet) return null

  const heading =
    magnetId === 'tool-result'
      ? 'Email me my estimate'
      : `Free ${magnet.title}`
  const subhead =
    magnetId === 'tool-result'
      ? 'Get a copy of your estimate plus a plain-English planning guide. No agent, no sales calls.'
      : `A plain-English guide from ${kit.brand === 'seniorsimple' ? 'SeniorSimple' : kit.brand}. No agent, no sales calls — just the information you asked for.`

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
          kit={kit}
          pageSlug={pageSlug}
          variant={variant}
          magnetId={magnetId}
          topicTag={topicTag}
          resultPayload={resultPayload}
          abArm={abArm}
          theme="gradient"
          sourceDetail={`magnet:${pageSlug}`}
        />
      </div>
    </section>
  )
}
