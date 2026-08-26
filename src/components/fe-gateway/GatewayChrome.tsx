/**
 * WO-843 — shared, non-interactive page furniture.
 *
 * Server components, deliberately: the masthead and trust strips sit on the
 * LCP path and must not wait on hydration.
 *
 * These are the "brand skin" half of the held-constant column — all three
 * gateways render the same masthead, the same reassurance wording, the same
 * ad label. Only the ARRANGEMENT differs between A, B and C.
 */

import { BRAND, COMPLIANCE, OFFER } from '@/lib/fe-gateway/config';

/* ------------------------------------------------------------------ */

export function AdLabel() {
  return (
    <div
      className="px-4 py-2 text-center text-[13px] tracking-wide"
      style={{ background: '#EFEFE8', color: '#6B7A82' }}
    >
      Advertisement · {COMPLIANCE.advertisement}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Masthead() {
  return (
    <header className="px-5 py-4" style={{ background: '#fff', borderBottom: '1px solid #E9E9E0' }}>
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <span className="text-[22px] font-bold tracking-tight" style={{ color: BRAND.primary }}>
          Senior<span style={{ color: BRAND.accentDeep }}>Simple</span>
        </span>
        <span className="text-[14px] font-medium" style={{ color: '#6B7A82' }}>
          Final Expense
        </span>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */

const REASSURANCE = [
  { title: `${OFFER.underwriting.replace(' — just a few health questions.', '')}º`, body: 'Just a few health questions on the application.' },
  { title: 'Speak with a licensed agent', body: 'Appointed to sell in your state.' },
  { title: 'No obligation', body: 'A conversation, not an application.' },
];

/**
 * The reassurance strip. Wording is fixed across gateways — only placement
 * moves (A puts it after the reveal, B in the hero, C after the VSL).
 */
export function ReassuranceStrip() {
  return (
    <div className="px-5 py-8" style={{ background: BRAND.sand }}>
      <ul className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
        {REASSURANCE.map((item) => (
          <li key={item.title} className="flex gap-3 sm:flex-col sm:gap-1.5">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={BRAND.cta}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <div>
              <p className="text-[17px] font-semibold" style={{ color: BRAND.ink }}>
                {item.title}
              </p>
              <p className="text-[15px]" style={{ color: '#5B6A72' }}>
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Consent line for the click-to-call gateways (A and B). Gateway C uses the
 * express written TCPA block above its submit instead.
 */
export function CallConsentNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[14px] leading-relaxed ${className}`} style={{ color: '#6B7A82' }}>
      {COMPLIANCE.consentByCalling}
    </p>
  );
}
