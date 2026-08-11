import type { Metadata } from 'next'

const CANONICAL = 'https://seniorsimple.org/life-insurance-webinar/watch'
const TITLE = 'Watch the Life Insurance Webinar Series'

export const metadata: Metadata = {
  title: TITLE,
  description:
    'Five short videos that explain how life insurance works later in life — in plain language, at your pace.',
  alternates: { canonical: CANONICAL },
  // Post-optin destination — don't index the delivery page.
  robots: { index: false, follow: false },
}

// Vimeo IDs from the ParentSimple 5-part series (ship spec §4). Order matters.
const VIDEO_IDS = [
  '1213427905',
  '1213427907',
  '1213427908',
  '1213427906',
  '1213427951',
] as const

export default function WatchWebinarPage() {
  return (
    <div className="w-full">
      {/* Header band */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#36596A] to-[#2a4a5a]" />
        <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#E4CDA1]">
            You&rsquo;re in · The webinar series
          </p>
          <h1 className="mb-4 font-serif text-4xl font-bold leading-tight text-white md:text-5xl">
            Understand Life Insurance — Five Short Videos
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/85">
            Watch in order or jump around. No jargon, no pressure to buy
            anything.
          </p>
        </div>
      </section>

      {/* Video grid */}
      <section className="bg-[#F5F5F0]">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="space-y-10">
            {VIDEO_IDS.map((id, i) => (
              <div key={id}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#36596A]/70">
                  Part {i + 1} of {VIDEO_IDS.length}
                </p>
                <div
                  className="relative w-full overflow-hidden rounded-lg bg-black shadow-md"
                  style={{ paddingTop: '56.25%' }}
                >
                  <iframe
                    src={`https://player.vimeo.com/video/${id}`}
                    title={`Life insurance webinar — part ${i + 1}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance footer */}
      <section className="border-t border-[#E7E1D2] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-xs leading-relaxed text-gray-500">
            Educational content only. Nothing here is investment, tax, or legal
            advice. Coverage availability, eligibility, and pricing depend on
            your circumstances, the state you live in, and the carrier&rsquo;s
            underwriting. SeniorSimple is an educational publisher; insurance
            products are offered through licensed professionals and are not
            available in all states. No coverage is guaranteed and no
            guaranteed-issue product is being marketed here.
          </p>
        </div>
      </section>
    </div>
  )
}
