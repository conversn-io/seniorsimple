// Medicare Bucket Quiz — internal preview.
// Purpose: let Keenan (and CoS) review the full flow before we wire the quiz
// into article pages and the calculator.
//
// What it shows:
//   1. Standalone variant (as it would appear mid-article)
//   2. Bridge variant with prefill (as it would appear under the calculator)
//   3. Bucket sanity-check panel — the four resolved-bucket result views so
//      compliance/design can see all four label + blurb combos without
//      completing four flows end-to-end.
//
// Kit-driven since Phase 4 — the same shape works for any vertical with a
// quiz in its kit. Swap medicareKit for another kit to preview that vertical.

'use client'

import BucketQuiz from '@/components/quiz/BucketQuiz'
import { medicareKit } from '@/lib/capture-kits/medicare'

const kit = medicareKit
const DISCLAIMER_LINE =
  kit.compliance.disclaimer ?? kit.compliance.educationalNotice

export default function MedicareQuizPreviewPage() {
  const buckets = kit.quiz?.buckets ?? []
  const resultCards = kit.quiz?.resultCards ?? []

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="bg-white rounded-lg shadow p-6">
          <div className="inline-block px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded mb-2">
            INTERNAL PREVIEW — not linked from nav, not indexed
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Medicare Bucket Quiz — review</h1>
          <p className="text-gray-600 mt-2">
            Two entry points, one component. Review both flows plus the four bucket
            result views.
          </p>
          <ul className="mt-4 text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li><strong>Standalone</strong>: as it appears mid-article on Medicare pages</li>
            <li><strong>Bridge</strong>: as it appears under the cost calculator (prefilled)</li>
            <li><strong>Bucket panel</strong>: the resolved-result cards side-by-side</li>
          </ul>
        </header>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
            1. Standalone variant (article mount)
          </h2>
          <BucketQuiz vertical={kit.vertical} slug="preview-standalone" variant="standalone" />
        </section>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
            2. Bridge variant (calculator mount)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Prefilled with a plausible calculator state — bridge skips steps whose values
            are already provided.
          </p>
          <BucketQuiz
            vertical={kit.vertical}
            slug="preview-bridge"
            variant="bridge"
            prefill={{
              ageBand: '65_69',
              incomeTier: 'middle',
              rxLevel: 'few',
              zip: '90210',
            }}
          />
        </section>

        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
            3. Bucket result panel — all resolved buckets
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {resultCards.map((card) => {
              const meta = buckets.find((b) => b.id === card.bucketId)
              return (
                <div
                  key={card.bucketId}
                  className="bg-white rounded-xl border-2 border-[#36596A] shadow p-6"
                >
                  <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[#36596A] text-white text-xs font-semibold uppercase tracking-wider">
                    {card.bucketId}
                  </div>
                  <h3 className="text-xl font-bold text-[#36596A] mb-2">
                    {card.headline}
                  </h3>
                  {card.subhead && <p className="text-gray-700 mb-4">{card.subhead}</p>}

                  <div className="bg-[#F3F6F8] rounded-lg p-3 mb-4">
                    <h4 className="text-xs font-semibold text-[#36596A] uppercase tracking-wider mb-2">
                      What to look for
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {card.bullets.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-[#36596A] mr-2 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-sm text-gray-600 mb-6">
                    A licensed advisor will follow up shortly.
                    {meta && ` In the meantime, we'll send you educational resources about ${meta.label}.`}
                  </p>
                  <p className="text-xs text-gray-500 border-t border-gray-200 pt-3">
                    {DISCLAIMER_LINE}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
