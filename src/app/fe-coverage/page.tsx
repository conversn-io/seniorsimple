/**
 * GATEWAY B — "The Brochure" (WO-843 §2B)
 *
 * Mechanism under test: trust / legitimacy, lowest possible friction. No quiz,
 * no form, no interstitial — the call button is available from the first
 * paint and repeated down the page. This is the natural Meta/DG final-URL
 * default because it has the fewest ways to fail.
 *
 * Models: affordablelifeinsurance.org/lg-final-expense
 * Lead capture: none (pure click-to-call).
 *
 * Held constant vs. A and C: offer, destination line, brand skin, tracking,
 * compliance footer. The ONLY variable is this arrangement.
 */

import type { Metadata } from 'next';

import GatewayProvider from '@/components/fe-gateway/GatewayProvider';
import CallButton from '@/components/fe-gateway/CallButton';
import StickyCallBar from '@/components/fe-gateway/StickyCallBar';
import ComplianceFooter from '@/components/fe-gateway/ComplianceFooter';
import {
  AdLabel,
  Masthead,
  ReassuranceStrip,
  CallConsentNote,
} from '@/components/fe-gateway/GatewayChrome';
import { BRAND, OFFER, COMPLIANCE } from '@/lib/fe-gateway/config';

export const metadata: Metadata = {
  title: 'Final Expense Coverage for Seniors | SeniorSimple',
  description:
    'Final expense coverage designed to cover funeral and burial costs. No medical exam — just a few health questions. Speak with a licensed agent.',
  // Paid-traffic lander — never index.
  robots: { index: false, follow: false },
};

/* ------------------------------------------------------------------ *
 * §2B.3 — Key Benefits grid (6 tiles)
 * ------------------------------------------------------------------ */

const BENEFITS = [
  {
    title: 'No medical examº',
    body: 'Coverage is offered on a simplified-issue basis. You answer a short set of health questions on the application — no doctor visit, no lab work.',
  },
  {
    title: 'Benefits paid directly to your family',
    body: 'The death benefit goes to the beneficiary you name, who can use it for funeral costs, outstanding bills, or anything else.',
  },
  {
    title: 'Level premiums**',
    body: 'On level-premium products, your rate does not increase with age for the life of the policy, provided premiums are paid as scheduled.',
  },
  {
    title: 'Coverage that fits a fixed income',
    body: 'Benefit amounts are chosen to match what you can comfortably afford each month, rather than a fixed package.*',
  },
  {
    title: 'Built for ages 45 to 85',
    body: 'Final expense products are underwritten for later-life applicants, so age alone is not a barrier to being considered.',
  },
  {
    title: 'Your policy stays yours',
    body: 'Coverage is not tied to an employer and does not end at retirement. It stays in force as long as premiums are paid.',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Call the number on this page',
    body: 'You reach a licensed insurance agent. There is no form to fill out first and no application to start.',
  },
  {
    n: '2',
    title: 'Answer a few questions',
    body: 'Your age, your state, and a short set of health questions. This is what determines which carriers and benefit amounts you can be considered for.',
  },
  {
    n: '3',
    title: 'See what you qualify for',
    body: 'The agent explains your options, including any graded or limited benefit period that applies, so you can decide with the full picture.',
  },
];

export default function GatewayBPage() {
  return (
    <GatewayProvider gateway="b">
      <div className="min-h-screen pb-28" style={{ background: '#fff', color: BRAND.body }}>
        <AdLabel />
        <Masthead />

        {/* ---------- 1. Hero ---------- */}
        <section className="px-5 py-10" style={{ background: '#fff' }}>
          <div className="mx-auto max-w-3xl">
            <h1
              className="text-[32px] font-bold leading-[1.2] sm:text-[42px]"
              style={{ color: BRAND.ink }}
            >
              Final expense coverage that leaves your family the bill money, not the bill.
            </h1>
            <p className="mt-4 text-[19px] leading-relaxed sm:text-[21px]">
              A funeral is one of the few large costs most families never plan for. Final
              expense coverage is a small life insurance policy meant to cover it — so the
              people you leave behind are not paying for it out of pocket.
            </p>

            <div className="mt-7">
              <CallButton
                placement="hero"
                label="Call {number}"
                subLabel="Licensed agents available now"
              />
              <CallConsentNote className="mt-3 max-w-xl" />
            </div>
          </div>
        </section>

        {/* ---------- 2. Trust badge row ---------- */}
        <ReassuranceStrip />

        {/* ---------- 3. Key Benefits grid ---------- */}
        <section className="px-5 py-12">
          <div className="mx-auto max-w-3xl">
            <h2
              className="text-[26px] font-bold leading-tight sm:text-[32px]"
              style={{ color: BRAND.ink }}
            >
              What final expense coverage actually does
            </h2>
            <ul className="mt-7 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <li key={b.title}>
                  <h3 className="text-[19px] font-semibold" style={{ color: BRAND.primary }}>
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-[17px] leading-relaxed">{b.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- 4. "Why final expense" explainer ---------- */}
        <section className="px-5 py-12" style={{ background: BRAND.sand }}>
          <div className="mx-auto max-w-3xl">
            <h2
              className="text-[26px] font-bold leading-tight sm:text-[32px]"
              style={{ color: BRAND.ink }}
            >
              Why people buy it in their sixties and seventies
            </h2>
            <div className="mt-5 space-y-4 text-[18px] leading-relaxed">
              <p>
                Most term life policies are written to cover the working years — replacing
                an income while there is still a mortgage and children at home. They are
                designed to expire, and for a lot of people they already have.
              </p>
              <p>
                What is left afterwards is a different and much smaller problem: the cost
                of a funeral, the outstanding medical bills, the paperwork someone has to
                settle. Final expense coverage is built for that specific job. The benefit
                amounts are modest by design, which is what makes the premiums manageable
                on a fixed income.
              </p>
              <p>
                It is worth understanding the trade-off honestly. Because these policies
                ask few or no medical questions, many are issued with a{' '}
                <strong>graded or limited benefit period</strong> — if death occurs in the
                first two policy years, the payout is typically the premiums paid plus
                interest rather than the full benefit. A licensed agent can tell you which
                products carry that condition and which do not.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- 5. How it works → repeat Call Now ---------- */}
        <section className="px-5 py-12">
          <div className="mx-auto max-w-3xl">
            <h2
              className="text-[26px] font-bold leading-tight sm:text-[32px]"
              style={{ color: BRAND.ink }}
            >
              How it works
            </h2>
            <ol className="mt-7 space-y-6">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[20px] font-bold text-white"
                    style={{ background: BRAND.primary }}
                    aria-hidden="true"
                  >
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-[19px] font-semibold" style={{ color: BRAND.ink }}>
                      {s.title}
                    </h3>
                    <p className="mt-1 text-[17px] leading-relaxed">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-9">
              <CallButton placement="how_it_works" label="Call {number}" />
            </div>
          </div>
        </section>

        {/* ---------- 6. Second CTA band + reassurance ---------- */}
        <section className="px-5 py-12" style={{ background: BRAND.primary }}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-[26px] font-bold leading-tight text-white sm:text-[32px]">
              Find out what you qualify for
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[18px] leading-relaxed text-white/90">
              {OFFER.underwriting} Ages {OFFER.minAge} to {OFFER.maxAge}. There is no
              obligation and no application to start — it is a conversation.
            </p>
            <div className="mt-7 flex justify-center">
              <CallButton placement="cta_band" label="Call {number}" />
            </div>
            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-white/75">
              {COMPLIANCE.consentByCalling} {COMPLIANCE.callsRecorded}
            </p>
          </div>
        </section>

        {/* ---------- 7. Compliance footer ---------- */}
        <ComplianceFooter />
        <StickyCallBar />
      </div>
    </GatewayProvider>
  );
}
