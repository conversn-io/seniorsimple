// §7-E directive (2026-07-23): phone-required intake moves off content pages.
// This is the vertical-scoped destination: /get-help/medicare, /get-help/annuity,
// /get-help/final-expense, etc. The article template routes "talk to an advisor"
// intent here via internal links.
//
// Contract with the write path (packet §5 / §7-E acceptance):
//   - Server-computed hem_sha256 on submit (never trust client)
//   - Writes CRM lead AND mirrors to newsletter_subscribers (identity bridge)
//   - source='get_help', source_detail='<vertical>'
//   - quiz_bucket carries through if the user came from a resolved quiz
//     (query param ?bucket=<value>)

import { notFound } from 'next/navigation'
import GetHelpForm from './GetHelpForm'
import { getMedicareComplianceDisclaimer, getMedicareEducationalNotice } from '@/lib/compliance'

interface GetHelpPageProps {
  params: Promise<{ vertical: string }>
  searchParams: Promise<{ bucket?: string; slug?: string }>
}

// Whitelist of verticals. Add here as new destinations come online.
const VERTICALS: Record<string, {
  label: string
  headline: string
  subheadline: string
  ctaLabel: string
  showMedicareDisclaimer: boolean
}> = {
  medicare: {
    label: 'Medicare',
    headline: 'Talk to a licensed Medicare advisor',
    subheadline:
      'Share your ZIP and phone, and a licensed advisor will call you to walk through the plans available in your area. No obligation, no cost.',
    ctaLabel: 'Request a callback',
    showMedicareDisclaimer: true,
  },
  annuity: {
    label: 'Annuities',
    headline: 'Talk to a licensed annuity specialist',
    subheadline:
      'Share your ZIP and phone, and a licensed specialist will call you to walk through your options. No obligation, no cost.',
    ctaLabel: 'Request a callback',
    showMedicareDisclaimer: false,
  },
  'final-expense': {
    label: 'Final Expense',
    headline: 'Talk to a licensed final expense agent',
    subheadline:
      'Share your ZIP and phone, and a licensed agent will call to walk through affordable options. No obligation, no cost.',
    ctaLabel: 'Request a callback',
    showMedicareDisclaimer: false,
  },
}

export const dynamic = 'force-dynamic'

export default async function GetHelpPage({ params, searchParams }: GetHelpPageProps) {
  const { vertical } = await params
  const { bucket, slug } = await searchParams
  const config = VERTICALS[vertical]
  if (!config) notFound()

  const disclaimer = config.showMedicareDisclaimer
    ? (getMedicareComplianceDisclaimer() ?? getMedicareEducationalNotice())
    : null

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[#36596A] text-white text-xs font-semibold uppercase tracking-wider">
            {config.label} — Talk to an advisor
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#36596A] mb-3">{config.headline}</h1>
          <p className="text-gray-700 mb-6">{config.subheadline}</p>

          <GetHelpForm
            vertical={vertical}
            ctaLabel={config.ctaLabel}
            quizBucket={bucket ?? null}
            sourceSlug={slug ?? null}
          />

          {disclaimer && (
            <p className="text-xs text-gray-500 border-t border-gray-200 pt-3 mt-6">
              {disclaimer}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
