/**
 * GATEWAY C — "The Niche Hook" (WO-843 §2C)
 *
 * Mechanism under test: specificity + lead capture. The hook is templated per
 * segment (?seg=diabetes / tobacco / heart / no-coverage), and unlike A and B
 * this page captures contact details — so a visitor who never dials, or whose
 * call does not connect, still becomes a callback list.
 *
 * Models: compare.legacyfamilylife.com/diabetes-e7a8b0 (Heyflow)
 * Lead capture: YES — express written TCPA consent required above the submit.
 *
 * What we refused (§1): "Guaranteed Acceptance", "Instant Approval",
 * "cannot be denied", and any framing where a health condition implies
 * automatic eligibility. The segment hooks state the true, narrow claim: a
 * condition that disqualifies you from fully underwritten life insurance does
 * not automatically disqualify you here.
 */

import type { Metadata } from 'next';

import GatewayProvider from '@/components/fe-gateway/GatewayProvider';
import StickyCallBar from '@/components/fe-gateway/StickyCallBar';
import ComplianceFooter from '@/components/fe-gateway/ComplianceFooter';
import { AdLabel, Masthead, ReassuranceStrip } from '@/components/fe-gateway/GatewayChrome';
import { BRAND, OFFER } from '@/lib/fe-gateway/config';
import { resolveSegment } from '@/lib/fe-gateway/segments';
import QualifyFlow from './QualifyFlow';

// ?seg= is read per-request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  // Root layout applies the `%s | SeniorSimple` template.
  title: 'See If You Qualify for Final Expense Coverage',
  description:
    'Answer a few questions to see whether there is final expense coverage available in your state. No medical exam — just a few health questions.',
  robots: { index: false, follow: false },
};

/** §2C.6 — compliant FAQ rewrites. */
const FAQ = [
  {
    q: 'Do I need a medical exam?',
    a: 'No. These are simplified-issue products — instead of an exam, the application asks a short set of health questions.º Your answers affect eligibility, the benefit amount you can be considered for, and your premium.',
  },
  {
    q: 'Can I be turned down?',
    // Deliberately avoids the literal banned phrasing even in refutation —
    // an automated compliance scan or a Meta reviewer skimming a fragment
    // should not have to parse a negation to clear this page.
    a: 'Yes. Not all applicants qualify, and eligibility depends on your health answers, your age, your state and the carrier. Any advertisement promising that no applicant is ever turned down is not describing these products accurately.',
  },
  {
    q: 'What is a graded or limited benefit period?',
    a: 'On many final expense policies, if death occurs within the first two policy years, the amount paid is typically the premiums you paid plus interest rather than the full benefit. Some products do not carry this condition. Ask the agent which applies to anything you are offered.',
  },
  {
    q: 'How much coverage can I get?',
    a: 'Benefit amounts are modest by design — enough to cover a funeral and final bills. The specific amount available to you depends on your age, health answers, state and the carrier, so it is determined on the call rather than in advance.*',
  },
  {
    q: 'What does the call cost, and am I committing to anything?',
    a: 'The call is free and there is no obligation. Nothing is applied for on the call — a licensed agent explains what you qualify for so you can decide.',
  },
  {
    q: 'Who am I speaking with?',
    a: 'A licensed insurance agent appointed to sell products in your state. SeniorSimple is a marketing organization, not an insurance carrier, and does not make eligibility or underwriting decisions.',
  },
];

interface PageProps {
  searchParams: Promise<{ seg?: string }>;
}

export default async function GatewayCPage({ searchParams }: PageProps) {
  const { seg } = await searchParams;
  const segment = resolveSegment(seg);

  return (
    <GatewayProvider gateway="c" extraTags={{ ss_segment: segment.id }}>
      <div className="min-h-screen pb-28" style={{ background: '#fff', color: BRAND.body }}>
        <AdLabel />
        <Masthead />

        {/* ---------- 1. Hero — niche-templated ---------- */}
        <section className="px-5 pb-8 pt-9">
          <div className="mx-auto max-w-2xl">
            <h1
              className="text-[31px] font-bold leading-[1.2] sm:text-[38px]"
              style={{ color: BRAND.ink }}
            >
              {segment.headline}
            </h1>
            <p className="mt-4 text-[19px] leading-relaxed sm:text-[20px]">{segment.subhead}</p>
            <p className="mt-3 text-[17px]" style={{ color: '#6B7A82' }}>
              Ages {OFFER.minAge} to {OFFER.maxAge}. Takes about a minute.
            </p>
          </div>
        </section>

        {/* ---------- 2–5. Form → pre-qual → VSL → call ---------- */}
        <section className="px-5 pb-10" style={{ background: BRAND.sand, paddingTop: '2rem' }}>
          <div className="mx-auto max-w-2xl">
            <QualifyFlow segment={segment} />
          </div>
        </section>

        {/* ---------- 6. Trust strip + FAQ ---------- */}
        <ReassuranceStrip />

        <section className="px-5 py-12">
          <div className="mx-auto max-w-2xl">
            <h2
              className="text-[26px] font-bold leading-tight sm:text-[31px]"
              style={{ color: BRAND.ink }}
            >
              Straight answers
            </h2>
            <dl className="mt-7 space-y-6">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="text-[19px] font-semibold" style={{ color: BRAND.primary }}>
                    {item.q}
                  </dt>
                  <dd className="mt-1.5 text-[17px] leading-relaxed">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------- 7. Compliance footer + explicit consent disclosure ---------- */}
        <ComplianceFooter withExpressConsent />
        <StickyCallBar />
      </div>
    </GatewayProvider>
  );
}
