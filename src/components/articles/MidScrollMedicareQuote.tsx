'use client'

// MidScrollMedicareQuote — elevated Medicare quote form inserted between the
// article body and the calculator (P0.6). Wraps MedicareLeadForm in a
// prominent single-column card so the highest-value action (phone-eligible
// quote request) sits where readers actually are, not at the article foot.
//
// KEEPS:
//   * Foot: MedicareCostCalculator (which still shows MedicareLeadForm below its
//           result panel — the calculator flow remains intact).
//   * Foot: NewsletterCaptureCTA (GUIDE — low-friction email hook that
//           produced the 13 organic subs we already have; do NOT touch).
// REPLACES:
//   * Mid-scroll: was InterstitialCTABanner (phone-only sticky-style banner).
//     Quote form is a strictly better mid-scroll CTA because it (a) captures
//     the phone number directly, and (b) can convert a reader who won't call
//     but will fill a 5-field form.
//
// Attribution: passes `slug` through so submissions land as
//   Publishare source='article', source_detail=`quote:<slug>`
//   CRM leads.site_key='seniorsimple', landing_page=<article URL>.
// See v_page_captures / v_money_in_motion_queue for the downstream view.

import MedicareLeadForm from '@/components/calculators/MedicareLeadForm'

interface MidScrollMedicareQuoteProps {
  slug: string
  phoneNumber?: string | null
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  if (digits.length === 11 && digits[0] === '1') return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  return phone
}

export default function MidScrollMedicareQuote({ slug, phoneNumber }: MidScrollMedicareQuoteProps) {
  const formattedPhone = phoneNumber ? formatPhone(phoneNumber) : null

  return (
    <div className="my-10 -mx-4 sm:mx-0">
      <div className="bg-gradient-to-br from-[#36596A] to-[#2a4a5a] rounded-none sm:rounded-xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-white/15 text-white text-xs font-semibold uppercase tracking-wider rounded-full mb-3">
            Free · No Obligation
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Get a personalized Medicare quote
          </h2>
          <p className="text-white/80 text-sm sm:text-base">
            Licensed advisor · quote in minutes · covers all 50 states
          </p>
          {formattedPhone && (
            <p className="mt-3 text-white/90 text-sm">
              Prefer to talk now?{' '}
              <a
                href={`tel:${phoneNumber?.replace(/\D/g, '') ?? ''}`}
                className="underline font-semibold hover:text-white"
              >
                Call {formattedPhone}
              </a>
            </p>
          )}
        </div>
        {/* MedicareLeadForm renders its own white card; sits on the gradient. */}
        <MedicareLeadForm slug={slug} compact />
      </div>
    </div>
  )
}
