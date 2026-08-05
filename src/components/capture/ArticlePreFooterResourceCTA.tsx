'use client'

import MagnetCaptureForm from './MagnetCaptureForm'
import { useResolvedMagnet } from './useResolvedMagnet'
import { MAGNETS } from '@/lib/medicare-capture-config'

interface ArticlePreFooterResourceCTAProps {
  /** Article slug — resolves to the pillar-appropriate magnet via useResolvedMagnet. */
  slug: string
}

/**
 * Full-width pre-footer capture section — replaces the old Medicare-hardcoded
 * `NewsletterCaptureCTA` on article pages. Copy is driven by the resolved
 * magnet, so:
 *   - Medicare articles → "Free 2026 Medicare Decision Kit" (etc.)
 *   - FE/burial/life-insurance articles → "Final Expense, Made Simple"
 *   - Everything else → the site-wide default (Decision Kit)
 *
 * Wraps `MagnetCaptureForm` so the subscribe payload + GA4 + magnet delivery
 * all flow through the same contract-v2 path used elsewhere.
 */
export default function ArticlePreFooterResourceCTA({
  slug,
}: ArticlePreFooterResourceCTAProps) {
  const resolved = useResolvedMagnet(slug)
  const magnet = MAGNETS[resolved.magnetId]

  return (
    <section
      className="py-16 px-6"
      aria-labelledby={`pre-footer-cta-${slug}`}
      style={{
        background: 'linear-gradient(135deg, #36596A 0%, #82A6B1 100%)',
      }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2
          id={`pre-footer-cta-${slug}`}
          className="text-3xl font-serif font-semibold text-white mb-3"
        >
          {magnet.adHeadline}
        </h2>
        <p className="text-lg text-white/90 mb-8">{magnet.adSubhead}</p>

        <div className="mx-auto max-w-md">
          <MagnetCaptureForm
            pageSlug={slug}
            surface="magnet"
            variant="inline"
            magnetId={resolved.magnetId}
            topicTag={resolved.topicTag}
            abArm={resolved.abArm}
            theme="gradient"
          />
        </div>
      </div>
    </section>
  )
}
