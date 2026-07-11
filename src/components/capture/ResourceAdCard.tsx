'use client'

import { useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  MAGNETS,
  type MagnetId,
  type TopicTag,
} from '@/lib/medicare-capture-config'
import { trackCaptureEvent } from '@/lib/medicare-capture-analytics'

export interface ResourceAdCardProps {
  magnetId: MagnetId
  /** Slug of the page the card is placed on — for analytics. */
  pageSlug: string
  topicTag: TopicTag
  abArm?: string
  /** Layout preset. Sidebar = tall/narrow; inline = wide/short. */
  layout?: 'sidebar' | 'inline'
  /** Small "AD" label to disclose sponsored slot — hidden on internal cards. */
  showAdLabel?: boolean
  className?: string
}

/**
 * Ad-styled resource card: cover image + headline + CTA that clicks through to
 * /resources/[lpSlug]. The LP owns the capture form and magnet delivery, so we
 * only fire an impression event here — click events fall out naturally when the
 * user lands on the LP and its form's `capture_impression` fires.
 */
export default function ResourceAdCard({
  magnetId,
  pageSlug,
  topicTag,
  abArm,
  layout = 'sidebar',
  showAdLabel = false,
  className = '',
}: ResourceAdCardProps) {
  const magnet = MAGNETS[magnetId]
  const rootRef = useRef<HTMLDivElement | null>(null)

  const fireImpression = useCallback(() => {
    trackCaptureEvent({
      eventName: 'capture_impression',
      pageSlug,
      variant: 'inline',
      magnetId,
      topicTag,
      abArm,
    })
  }, [pageSlug, magnetId, topicTag, abArm])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = rootRef.current
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

  const href = `/resources/${magnet.lpSlug}`

  const trackClick = useCallback(() => {
    // Not a required event per the scoreboard spec, but useful for CTR.
    trackCaptureEvent({
      eventName: 'capture_submit',
      pageSlug,
      variant: 'inline',
      magnetId,
      topicTag,
      abArm,
    })
  }, [pageSlug, magnetId, topicTag, abArm])

  if (layout === 'inline') {
    // Horizontal ad card — cover on left, copy + CTA on right.
    return (
      <div
        ref={rootRef}
        className={`my-10 overflow-hidden rounded-2xl bg-[#F5F5F0] shadow-md ring-1 ring-[#36596A]/10 ${className}`}
      >
        {showAdLabel && (
          <div className="px-5 pt-4 text-[10px] font-medium uppercase tracking-widest text-[#36596A]/50">
            Resource
          </div>
        )}
        <div className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:gap-8 md:p-6">
          <Link
            href={href}
            onClick={trackClick}
            className="mx-auto block w-32 shrink-0 overflow-hidden rounded-md shadow-lg ring-1 ring-black/10 transition-transform hover:-translate-y-0.5 md:w-40"
            aria-label={`Get ${magnet.title}`}
          >
            <img
              src={magnet.coverImagePath}
              alt=""
              width={400}
              height={520}
              className="block h-auto w-full"
            />
          </Link>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-serif font-semibold text-[#36596A]">
              {magnet.adHeadline}
            </h3>
            <p className="mt-2 text-base text-[#36596A]/80">
              {magnet.adSubhead}
            </p>
            <Link
              href={href}
              onClick={trackClick}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#36596A] px-6 py-3 text-base font-medium text-white hover:bg-[#2a4a5a] transition-colors"
            >
              {magnet.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="mt-3 text-xs text-[#36596A]/60">
              No agent, no sales call.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Sidebar layout — vertical, compact.
  return (
    <div
      ref={rootRef}
      className={`overflow-hidden rounded-xl bg-[#F5F5F0] shadow-md ring-1 ring-[#36596A]/10 ${className}`}
    >
      {showAdLabel && (
        <div className="px-4 pt-3 text-[10px] font-medium uppercase tracking-widest text-[#36596A]/50">
          Resource
        </div>
      )}
      <Link
        href={href}
        onClick={trackClick}
        className="block px-5 pt-5"
        aria-label={`Get ${magnet.title}`}
      >
        <div className="mx-auto w-32 overflow-hidden rounded-md shadow-lg ring-1 ring-black/10 transition-transform hover:-translate-y-0.5">
          <img
            src={magnet.coverImagePath}
            alt=""
            width={400}
            height={520}
            className="block h-auto w-full"
          />
        </div>
      </Link>
      <div className="p-5 pt-4 text-center">
        <h3 className="text-lg font-serif font-semibold text-[#36596A]">
          {magnet.adHeadline}
        </h3>
        <p className="mt-2 text-sm text-[#36596A]/80">{magnet.adSubhead}</p>
        <Link
          href={href}
          onClick={trackClick}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#36596A] px-4 py-3 text-sm font-medium text-white hover:bg-[#2a4a5a] transition-colors"
        >
          {magnet.ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <p className="mt-2 text-[11px] text-[#36596A]/60">
          No agent, no sales call.
        </p>
      </div>
    </div>
  )
}
