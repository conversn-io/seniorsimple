/**
 * GATEWAY A — "The Qualifier" (WO-843 §2A)
 *
 * Mechanism under test: manufactured qualification + micro-commitment. The
 * visitor answers three questions before the number is revealed, so by the
 * time they see the CTA they have already invested three taps and framed
 * themselves as someone looking for coverage.
 *
 * Models: benefits.seniorfinal-expense.com/v2b-fex-25k
 * Lead capture: none (pure click-to-call).
 *
 * What we took from the inspiration: advertorial tone, the qualifier, the
 * interstitial, the reveal-then-call sequence.
 * What we refused (§1): "BREAKING", the gov-benefit framing, the "born
 * 1945–1975" entitlement hook, live spot counters, and the
 * "Prequalification accepted — you qualify for $25,000" verdict.
 */

import type { Metadata } from 'next';

import GatewayProvider from '@/components/fe-gateway/GatewayProvider';
import StickyCallBar from '@/components/fe-gateway/StickyCallBar';
import ComplianceFooter from '@/components/fe-gateway/ComplianceFooter';
import { AdLabel, Masthead, ReassuranceStrip } from '@/components/fe-gateway/GatewayChrome';
import { BRAND, OFFER } from '@/lib/fe-gateway/config';
import QualifierQuiz from './QualifierQuiz';

export const metadata: Metadata = {
  // Root layout applies the `%s | SeniorSimple` template.
  title: 'Final Expense Coverage Many Seniors Never Find Out About',
  description:
    'Many adults between 45 and 85 qualify for final expense coverage and never find out. Answer three questions to see whether it is worth a conversation.',
  robots: { index: false, follow: false },
};

export default function GatewayAPage() {
  return (
    <GatewayProvider gateway="a">
      <div className="min-h-screen pb-28" style={{ background: '#fff', color: BRAND.body }}>
        <AdLabel />
        <Masthead />

        {/* ---------- 1. Hero — advertorial tone ---------- */}
        <article className="px-5 pt-9">
          <div className="mx-auto max-w-2xl">
            <p
              className="text-[15px] font-semibold uppercase tracking-wide"
              style={{ color: BRAND.accentDeep }}
            >
              Final expense · What to know
            </p>
            <h1
              className="mt-2 text-[31px] font-bold leading-[1.2] sm:text-[40px]"
              style={{ color: BRAND.ink }}
            >
              Many seniors between {OFFER.minAge} and {OFFER.maxAge} qualify for final
              expense coverage — and never find out.
            </h1>
            <p className="mt-4 text-[19px] leading-relaxed sm:text-[21px]">
              Not because they were turned down. Because nobody ever told them the option
              existed, or they assumed a medical exam and a rejection were waiting at the
              end of it.
            </p>
          </div>
        </article>

        {/* ---------- 2. Problem / agitation — empathetic, plain ---------- */}
        <article className="px-5 py-8">
          <div className="mx-auto max-w-2xl space-y-4 text-[18px] leading-relaxed">
            <p>
              Here is the part most families do not see coming. A funeral is not a small
              expense, and it arrives at the exact moment nobody is in a state to deal with
              money. It lands on whoever is closest — usually an adult child — and it
              lands within about a week.
            </p>
            <p>
              The policies that were supposed to cover this often are not there anymore.
              Term policies bought in the working years expire on schedule. Coverage
              through an employer usually ends with the job. What is left is a bill and a
              conversation nobody wanted to have.
            </p>
            <p>
              Final expense coverage exists for this one job. Benefit amounts are modest by
              design, which is what keeps the premium manageable on a fixed income, and the
              products are underwritten for later-life applicants — so being in your
              seventies is not by itself a reason you would be turned down.
            </p>
            <p>
              The honest catch is worth stating up front: because these policies ask few
              health questions, many are issued with a{' '}
              <strong>graded or limited benefit period</strong>, meaning the full benefit
              may not be payable in the first two years. Which products carry that
              condition, and which do not, is exactly the kind of thing worth asking a
              licensed agent directly.
            </p>
          </div>
        </article>

        {/* ---------- 3–4. Qualifier → interstitial → soft reveal → call ---------- */}
        <section className="px-5 py-8" style={{ background: BRAND.sand }}>
          <div className="mx-auto max-w-2xl">
            <h2 className="text-[24px] font-bold leading-tight sm:text-[29px]" style={{ color: BRAND.ink }}>
              Three questions to see whether this is worth a conversation
            </h2>
            <p className="mb-6 mt-2 text-[17px] leading-relaxed">
              No name, no email, no application. The answers only determine whether there
              is a product an agent could actually put in front of you.
            </p>
            <QualifierQuiz />
          </div>
        </section>

        {/* ---------- 5. Reassurance strip ---------- */}
        <ReassuranceStrip />

        {/* ---------- 6. Compliance footer ---------- */}
        <ComplianceFooter />
        <StickyCallBar />
      </div>
    </GatewayProvider>
  );
}
