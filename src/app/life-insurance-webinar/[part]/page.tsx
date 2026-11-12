import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CirclePlay } from 'lucide-react'

// Vimeo IDs from the ParentSimple 5-part series (ship spec §4). Order matters.
const VIDEO_IDS = [
  '1213427905', // 1
  '1213427907', // 2
  '1213427908', // 3
  '1213427906', // 4
  '1213427951', // 5
] as const

const TOTAL = VIDEO_IDS.length
const QUOTE_HREF = '/final-expense-quote'
const CANONICAL_BASE = 'https://www.seniorsimple.org/life-insurance-webinar'

interface Params {
  part: string
}

export function generateStaticParams(): Params[] {
  return VIDEO_IDS.map((_, i) => ({ part: String(i + 1) }))
}

function parsePart(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null
  const n = Number(raw)
  return n >= 1 && n <= TOTAL ? n : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { part } = await params
  const n = parsePart(part)
  if (!n) return {}
  return {
    title: `Part ${n} · Life Insurance Webinar`,
    description:
      'A free, plain-language video series that explains how life insurance works at this stage of life — watch at your own pace, no obligation.',
    alternates: { canonical: `${CANONICAL_BASE}/${n}` },
    // Post-optin delivery pages — don't index.
    robots: { index: false, follow: false },
  }
}

export default async function WebinarPartPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { part } = await params
  const n = parsePart(part)
  if (!n) notFound()

  const vimeoId = VIDEO_IDS[n - 1]
  const otherParts = [1, 2, 3, 4, 5].filter((p) => p !== n).slice(0, 3)

  return (
    <div className="w-full bg-[#F5F5F0]">
      {/* Breadcrumb + H1 + video */}
      <section className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B08E4E]">
          Part {n} of {TOTAL}
        </p>
        <h1 className="mb-6 font-serif text-3xl font-bold leading-tight text-[#36596A] md:text-4xl">
          Part {n}: Life Insurance Webinar
        </h1>
        <div
          className="relative w-full overflow-hidden rounded-xl bg-black shadow-md"
          style={{ paddingTop: '56.25%' }}
        >
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={`Part ${n} — Life Insurance Webinar`}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            allowFullScreen
            loading="eager"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </section>

      {/* CTA — Get My Free Quote */}
      <section className="mx-auto max-w-4xl px-4 pt-12 text-center sm:px-6 lg:px-8 lg:pt-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#B08E4E]">
          Ready when you are
        </p>
        <h2 className="mx-auto mb-8 max-w-2xl font-serif text-2xl font-semibold leading-tight text-[#36596A] md:text-3xl lg:text-4xl">
          Now that you understand how life insurance works, see what fits
          your situation.
        </h2>
        <div className="flex flex-col items-center">
          <Link
            href={QUOTE_HREF}
            className="group inline-flex items-center gap-3 rounded-xl bg-[#36596A] px-10 py-5 text-xl font-semibold text-white shadow-lg transition-colors hover:bg-[#2a4a5a] md:px-14 md:py-6 md:text-2xl"
          >
            Get My Free Quote
            <ArrowRight
              className="h-6 w-6 transition-transform group-hover:translate-x-0.5 md:h-7 md:w-7"
              aria-hidden
            />
          </Link>
          <p className="mt-4 text-sm leading-snug text-gray-600 md:text-base">
            Takes about 60 seconds.
            <br />
            Free · no obligation · licensed agents only.
          </p>
        </div>
      </section>

      {/* More in this series */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <p className="mb-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-[#B08E4E]">
          More in this series
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {otherParts.map((p) => (
            <Link
              key={p}
              href={`/life-insurance-webinar/${p}`}
              className="group block rounded-xl border border-[#E7E1D2] bg-white/60 p-3 transition-all hover:border-[#36596A]/25 hover:bg-white hover:shadow-sm"
            >
              <div className="mb-2.5 flex aspect-video items-center justify-center rounded-lg bg-gray-200/70 transition-colors group-hover:bg-[#2a4a5a]">
                <CirclePlay
                  className="h-8 w-8 text-gray-400 transition-colors group-hover:text-[#E4CDA1]"
                  aria-hidden
                />
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 transition-colors group-hover:text-[#B08E4E]">
                Part {p}
              </div>
              <div className="font-serif text-sm font-semibold text-[#36596A]">
                Part {p}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Compliance footer */}
      <section className="border-t border-[#E7E1D2] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-xs leading-relaxed text-gray-500">
            Educational content only. Not investment, tax, or legal advice.
            Insurance products are offered through licensed professionals and
            are not available in all states. No coverage is guaranteed and no
            guaranteed-issue product is being marketed here. SeniorSimple is
            an educational publisher.
          </p>
        </div>
      </section>
    </div>
  )
}
