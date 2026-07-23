// §2 Medicare Bucket Quiz — internal preview.
// Purpose: let Keenan (and CoS) review the full flow before we wire the quiz
// into the 10 article pages and the calculator. Packet order: build → REVIEW
// → wire. This page is the review surface.
//
// What it shows:
//   1. Standalone variant (as it would appear mid-article)
//   2. Bridge variant with prefill (as it would appear under the calculator)
//   3. Bucket sanity-check panel — the four resolved-bucket result views so
//      compliance/design can see all four label + blurb combos without
//      completing four flows end-to-end.
//
// Not wired to any article page. Not linked from nav. Access by direct URL.
// Kept out of sitemap by robots (this is under /preview, not /articles).

'use client'

import MedicareBucketQuiz, {
  MedicareBucket,
} from '@/components/quiz/MedicareBucketQuiz'

const COMPLIANCE_DISCLAIMER_PLACEHOLDER =
  '[PLACEHOLDER — awaiting compliance sign-off] We do not offer every plan available in your area. Any information we provide is limited to those plans we do offer in your area. Please contact Medicare.gov or 1-800-MEDICARE to get information on all your options.'

const BUCKET_PREVIEW: Array<{ bucket: MedicareBucket; label: string; blurb: string }> = [
  {
    bucket: 'advantage',
    label: 'Medicare Advantage',
    blurb:
      'All-in-one plans that often include dental, vision, and prescription coverage. Frequently $0-premium.',
  },
  {
    bucket: 'medigap',
    label: 'Medigap + Part D',
    blurb:
      'Original Medicare plus a supplement — see any doctor that accepts Medicare, predictable out-of-pocket costs.',
  },
  {
    bucket: 'dual',
    label: 'Dual-Eligible (Medicaid + Medicare)',
    blurb:
      'Special programs for people with limited income and resources. May cover premiums and reduce out-of-pocket costs.',
  },
  {
    bucket: 'working',
    label: 'Still Working, 65+',
    blurb:
      'You may be able to delay Part B without penalty if your employer coverage qualifies. Timing matters.',
  },
]

export default function MedicareQuizPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="bg-white rounded-lg shadow p-6">
          <div className="inline-block px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded mb-2">
            INTERNAL PREVIEW — not linked from nav, not indexed
          </div>
          <h1 className="text-2xl font-bold text-gray-900">§2 Medicare Bucket Quiz — review</h1>
          <p className="text-gray-600 mt-2">
            Two entry points, one component. Review both flows plus the four bucket
            result views. Compliance disclaimer below every step is a placeholder — awaiting
            sign-off before we ship.
          </p>
          <ul className="mt-4 text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li><strong>Standalone</strong>: as it appears mid-article on the 10 Medicare pages</li>
            <li><strong>Bridge</strong>: as it appears under the cost calculator (prefilled)</li>
            <li><strong>Bucket panel</strong>: the four resolved-result cards side-by-side</li>
          </ul>
        </header>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
            1. Standalone variant (article mount)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            No prefill — the user answers all four questions.
          </p>
          <MedicareBucketQuiz slug="preview-standalone" variant="standalone" />
        </section>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
            2. Bridge variant (calculator mount)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Prefilled with a plausible calculator state — ageBand=65_69, incomeTier=middle. Zip
            and current-coverage steps still ask (calculator doesn't collect either).
          </p>
          <MedicareBucketQuiz
            slug="preview-bridge"
            variant="bridge"
            prefill={{
              ageBand: '65_69',
              incomeTier: 'middle',
            }}
          />
        </section>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
            3. Bucket result panel — all four
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            The label + blurb + follow-up copy each resolved bucket renders on
            submit. Reviewing all four here so compliance and design don't have
            to complete four flows to see them.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {BUCKET_PREVIEW.map(({ bucket, label, blurb }) => (
              <div
                key={bucket}
                className="bg-white rounded-xl border-2 border-[#36596A] shadow p-6"
              >
                <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[#36596A] text-white text-xs font-semibold uppercase tracking-wider">
                  {bucket}
                </div>
                <h3 className="text-xl font-bold text-[#36596A] mb-2">{label}</h3>
                <p className="text-gray-700 mb-4">{blurb}</p>
                <p className="text-sm text-gray-600 mb-6">
                  A licensed advisor will follow up shortly with plan options in your area. In the
                  meantime, we'll send you educational resources about {label} to the email you
                  provided.
                </p>
                <p className="text-xs text-gray-500 border-t border-gray-200 pt-3">
                  {COMPLIANCE_DISCLAIMER_PLACEHOLDER}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="bg-white rounded-lg shadow p-4 text-sm text-gray-600">
          <p>
            <strong>Next steps after review:</strong> compliance sign-off on TPMO
            disclaimer copy → replace the placeholder → wire quiz mount into the 10
            zero-capture Medicare articles + the calculator bridge (already wired
            here in preview only).
          </p>
        </footer>
      </div>
    </div>
  )
}
