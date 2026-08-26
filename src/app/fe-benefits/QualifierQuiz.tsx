'use client';

/**
 * GATEWAY A quiz — WO-843 §2A steps 3–4.
 *
 * Three questions: age range · purpose · existing coverage. Then an HONEST
 * interstitial and a soft-qualified reveal.
 *
 * Compliance firewall (§1) — what this deliberately does NOT do:
 *   - no "Prequalification accepted!" / "You qualify for $25,000!" verdict
 *   - no spot counters, no fabricated scarcity, no countdown
 *   - the interstitial says what it is actually doing, and is short
 *   - out-of-range ages get a polite DQ and NO call CTA — we do not send a
 *     caller the licensed line cannot write
 *
 * The micro-commitment mechanism is preserved (three taps before the number),
 * which is the thing under test. The manufactured certainty is not.
 */

import { useEffect, useRef, useState } from 'react';

import CallButton from '@/components/fe-gateway/CallButton';
import { useGateway } from '@/components/fe-gateway/GatewayProvider';
import { CallConsentNote } from '@/components/fe-gateway/GatewayChrome';
import { BRAND, OFFER } from '@/lib/fe-gateway/config';

interface Question {
  id: 'age_range' | 'purpose' | 'existing_coverage';
  prompt: string;
  options: { value: string; label: string; hint?: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'age_range',
    prompt: 'What is your age?',
    options: [
      { value: 'under_45', label: 'Under 45' },
      { value: '45_54', label: '45 to 54' },
      { value: '55_64', label: '55 to 64' },
      { value: '65_74', label: '65 to 74' },
      { value: '75_85', label: '75 to 85' },
      { value: 'over_85', label: 'Over 85' },
    ],
  },
  {
    id: 'purpose',
    prompt: 'What would the coverage be for?',
    options: [
      { value: 'funeral', label: 'Funeral and burial costs' },
      { value: 'bills', label: 'Leaving my family something for final bills' },
      { value: 'replace', label: 'Replacing a policy that ended or got expensive' },
      { value: 'unsure', label: "I'm not sure yet — I'm looking into it" },
    ],
  },
  {
    id: 'existing_coverage',
    prompt: 'Do you have any life insurance right now?',
    options: [
      { value: 'none', label: 'No, none at all' },
      { value: 'small', label: 'Yes, but I do not think it is enough' },
      { value: 'work', label: 'Only through a job or former employer' },
      { value: 'yes', label: 'Yes, and I think it covers it' },
    ],
  },
];

/** Ages the licensed line cannot write — politely exit, no call CTA. */
const DQ_AGES = new Set(['under_45', 'over_85']);

type Phase = 'quiz' | 'checking' | 'reveal' | 'dq';

export default function QualifierQuiz() {
  const { track, setDisqualified } = useGateway();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>('quiz');
  const startedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const q = QUESTIONS[step];

  // Move focus to the new question on advance so screen-reader and
  // keyboard users are not stranded at the top of the page.
  useEffect(() => {
    if (phase === 'quiz' && startedRef.current) headingRef.current?.focus();
  }, [step, phase]);

  function choose(value: string) {
    if (!startedRef.current) {
      startedRef.current = true;
      track('quiz_start', { question: q.id });
    }

    const next = { ...answers, [q.id]: value };
    setAnswers(next);

    if (q.id === 'age_range' && DQ_AGES.has(value)) {
      setPhase('dq');
      // Also pull the sticky call bar — otherwise the page tells them not to
      // call while still showing a Call button.
      setDisqualified(true);
      track('quiz_complete', { outcome: 'dq', reason: 'age_out_of_range', ...next });
      return;
    }

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }

    setPhase('checking');
    track('quiz_complete', { outcome: 'qualified', ...next });

    // Honest interstitial — short, and it names what it is doing.
    window.setTimeout(() => setPhase('reveal'), 1400);
  }

  /* ---------------- DQ ---------------- */

  if (phase === 'dq') {
    return (
      <div className="rounded-2xl border p-7" style={{ borderColor: '#E3E3DA', background: '#fff' }}>
        <h2 className="text-[23px] font-bold" style={{ color: BRAND.ink }}>
          Thank you for answering.
        </h2>
        <p className="mt-3 text-[18px] leading-relaxed">
          The final expense products the agents on this line are appointed to sell are
          written for applicants aged {OFFER.minAge} to {OFFER.maxAge}. Outside that
          range there is not a product we could put in front of you, so we will not
          take up your time with a call.
        </p>
        <p className="mt-3 text-[18px] leading-relaxed">
          If you are looking on behalf of a parent or relative who is within that age
          range, they are welcome to start this on their own.
        </p>
      </div>
    );
  }

  /* ---------------- Interstitial ---------------- */

  if (phase === 'checking') {
    return (
      <div
        className="rounded-2xl border p-9 text-center"
        style={{ borderColor: '#E3E3DA', background: '#fff' }}
        role="status"
        aria-live="polite"
      >
        <div
          className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-solid"
          style={{ borderColor: '#E3E3DA', borderTopColor: BRAND.primary }}
          aria-hidden="true"
        />
        <p className="mt-4 text-[19px] font-semibold" style={{ color: BRAND.ink }}>
          Checking which coverage options are available in your state…
        </p>
      </div>
    );
  }

  /* ---------------- Soft reveal ---------------- */

  if (phase === 'reveal') {
    return (
      <div
        className="rounded-2xl border-2 p-7"
        style={{ borderColor: BRAND.accentDeep, background: '#fff' }}
      >
        <h2 className="text-[25px] font-bold leading-tight" style={{ color: BRAND.ink }}>
          Based on your answers, there are final expense options you may be eligible for.
        </h2>
        <p className="mt-3 text-[18px] leading-relaxed">
          Nothing has been decided — eligibility, benefit amount and price all depend on
          your state, your age and the health questions on the application. The next step
          is a short call with a licensed agent to confirm what you actually qualify for.
        </p>

        <ul className="mt-5 space-y-2.5 text-[17px]">
          {[
            `${OFFER.underwriting}º`,
            'Speak with a licensed agent appointed in your state',
            'No obligation — nothing is applied for on this call',
          ].map((line) => (
            <li key={line} className="flex gap-2.5">
              <svg
                width="21"
                height="21"
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
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <CallButton
            placement="quiz_reveal"
            label="Call {number}"
            subLabel="Speak with a licensed agent"
          />
          <CallConsentNote className="mt-3" />
        </div>
      </div>
    );
  }

  /* ---------------- Questions ---------------- */

  return (
    <div className="rounded-2xl border p-6 sm:p-7" style={{ borderColor: '#E3E3DA', background: '#fff' }}>
      <p className="text-[15px] font-semibold uppercase tracking-wide" style={{ color: BRAND.accentDeep }}>
        Question {step + 1} of {QUESTIONS.length}
      </p>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-[24px] font-bold leading-tight outline-none sm:text-[27px]"
        style={{ color: BRAND.ink }}
      >
        {q.prompt}
      </h2>

      <div className="mt-6 grid gap-3">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => choose(opt.value)}
            className="w-full rounded-xl border-2 px-5 py-4 text-left text-[18px] font-medium transition-colors hover:border-current active:scale-[0.99]"
            style={{ borderColor: '#DDDDD2', color: BRAND.ink, background: '#FCFCFA' }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Progress — honest, no fake momentum. */}
      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full" style={{ background: '#EBEBE2' }}>
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${(step / QUESTIONS.length) * 100}%`, background: BRAND.primary }}
        />
      </div>
    </div>
  );
}
