'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import MagnetCaptureForm from '../capture/MagnetCaptureForm'
import { trackCaptureEvent } from '@/lib/medicare-capture-analytics'
import type { MagnetSpec } from '@/lib/medicare-capture-config'

interface ResourceLandingPageProps {
  magnet: MagnetSpec
}

/**
 * Landing page for a resource magnet. Fires a capture_impression on mount so
 * the LP appears in the scoreboard (variant='inline', source_detail carries the
 * LP slug so it's distinguishable from in-article impressions).
 */
export default function ResourceLandingPage({ magnet }: ResourceLandingPageProps) {
  const pageSlug = `resource:${magnet.lpSlug}`

  useEffect(() => {
    trackCaptureEvent({
      eventName: 'capture_impression',
      pageSlug,
      variant: 'inline',
      magnetId: magnet.id,
      topicTag: 'open-enrollment',
    })
    // topicTag on LPs is a placeholder — LPs aren't scoped to a specific
    // article topic. We could plumb through the referring page's topic later
    // via querystring if we want per-source LP CTR.
  }, [magnet.id, magnet.lpSlug, pageSlug])

  return (
    <div className="min-h-screen bg-white">
      {/* Slim breadcrumb / back link */}
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <Link
          href="/content"
          className="inline-flex items-center gap-2 text-sm text-[#36596A]/70 hover:text-[#36596A]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to SeniorSimple
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 md:grid-cols-2 md:gap-16 md:py-20">
        {/* Cover + benefits (left on desktop) */}
        <div className="order-2 md:order-1">
          <div className="mx-auto max-w-xs">
            <div className="overflow-hidden rounded-lg shadow-2xl ring-1 ring-black/10">
              <img
                src={magnet.coverImagePath}
                alt={`${magnet.title} cover`}
                width={400}
                height={520}
                className="block h-auto w-full"
              />
            </div>
          </div>

          <ul className="mx-auto mt-8 max-w-md space-y-3">
            {magnet.lpBullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-3 text-base text-[#36596A]"
              >
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E4CDA1]/40">
                  <Check className="h-3.5 w-3.5 text-[#36596A]" aria-hidden />
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form (right on desktop) */}
        <div className="order-1 md:order-2">
          <div className="mx-auto max-w-md md:sticky md:top-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#36596A]/60">
              Free resource
            </p>
            <h1 className="text-3xl font-serif font-semibold text-[#36596A] md:text-4xl">
              {magnet.lpHeadline}
            </h1>
            <p className="mt-4 text-lg text-[#36596A]/80">{magnet.lpSubhead}</p>

            <div className="mt-8 rounded-2xl bg-[#F5F5F0] p-6 shadow-md ring-1 ring-[#36596A]/10 md:p-8">
              <MagnetCaptureForm
                pageSlug={pageSlug}
                variant="inline"
                magnetId={magnet.id}
                topicTag="open-enrollment"
                source="lp"
                theme="light"
              />
            </div>

            <p className="mt-4 text-center text-xs text-[#36596A]/60">
              You&apos;re signing up for the SeniorSimple newsletter. No agent
              will contact you. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Trust footer */}
      <section className="border-t border-[#36596A]/10 bg-[#F5F5F0]/60">
        <div className="mx-auto max-w-4xl px-6 py-10 text-center">
          <p className="text-sm text-[#36596A]/70">
            SeniorSimple is an independent education resource. We don&apos;t
            sell insurance. We publish plain-English guides so seniors can make
            informed decisions.
          </p>
        </div>
      </section>
    </div>
  )
}
