'use client';

/**
 * GATEWAY C flow — WO-843 §2C steps 2–5.
 *
 * Multi-step: segment qualifier → age → state → gender → name → cell →
 * email → current coverage → beneficiary. Progress bar throughout. Express
 * written TCPA consent sits directly above the submit.
 *
 * After submit: soft pre-qual reveal ("you may be eligible", never
 * "approved") → VSL → call CTA. The captured lead is what makes this
 * architecture different — a no-connect still leaves a callback list.
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import CallButton from '@/components/fe-gateway/CallButton';
import { useGateway } from '@/components/fe-gateway/GatewayProvider';
import { BRAND, COMPLIANCE, OFFER } from '@/lib/fe-gateway/config';
import type { Segment } from '@/lib/fe-gateway/segments';
import { US_STATES } from '@/lib/fe-gateway/states';
import VslBlock from './VslBlock';

type FieldKind = 'choice' | 'text' | 'tel' | 'email' | 'select';

interface Step {
  id: string;
  kind: FieldKind;
  prompt: string;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Returns an error string, or null when valid. */
  validate?: (v: string) => string | null;
}

const AGE_OPTIONS = [
  { value: 'under_45', label: 'Under 45' },
  { value: '45_54', label: '45 to 54' },
  { value: '55_64', label: '55 to 64' },
  { value: '65_74', label: '65 to 74' },
  { value: '75_85', label: '75 to 85' },
  { value: 'over_85', label: 'Over 85' },
];

const DQ_AGES = new Set(['under_45', 'over_85']);

function buildSteps(segment: Segment): Step[] {
  return [
    {
      id: 'segment_qualifier',
      kind: 'choice',
      prompt: segment.qualifier.prompt,
      options: segment.qualifier.options,
    },
    { id: 'age_range', kind: 'choice', prompt: 'What is your age?', options: AGE_OPTIONS },
    {
      id: 'state',
      kind: 'select',
      prompt: 'Which state do you live in?',
      help: 'Products and benefit amounts vary by state.',
      options: US_STATES.map((s) => ({ value: s.code, label: s.name })),
      validate: (v) => (v ? null : 'Please choose your state.'),
    },
    {
      id: 'gender',
      kind: 'choice',
      prompt: 'What is your gender?',
      help: 'Rates are calculated separately for men and women.',
      options: [
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
      ],
    },
    {
      id: 'current_coverage',
      kind: 'choice',
      prompt: 'Do you currently have any life insurance?',
      options: [
        { value: 'none', label: 'No, none at all' },
        { value: 'small', label: 'Yes, but not enough' },
        { value: 'work', label: 'Only through an employer' },
        { value: 'yes', label: 'Yes, I think it covers it' },
      ],
    },
    {
      id: 'beneficiary',
      kind: 'choice',
      prompt: 'Who would the coverage be for?',
      options: [
        { value: 'spouse', label: 'My spouse or partner' },
        { value: 'children', label: 'My children' },
        { value: 'family', label: 'My family generally' },
        { value: 'other', label: 'Someone else' },
      ],
    },
    {
      id: 'firstName',
      kind: 'text',
      prompt: 'What is your first name?',
      placeholder: 'First name',
      validate: (v) => (v.trim().length >= 2 ? null : 'Please enter your first name.'),
    },
    {
      id: 'lastName',
      kind: 'text',
      prompt: 'And your last name?',
      placeholder: 'Last name',
      validate: (v) => (v.trim().length >= 2 ? null : 'Please enter your last name.'),
    },
    {
      id: 'phone',
      kind: 'tel',
      prompt: 'What is the best number to reach you?',
      help: 'A licensed agent uses this to call you back if you do not reach us first.',
      placeholder: '(555) 555-5555',
      validate: (v) => {
        const d = v.replace(/\D/g, '');
        const ten = d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
        if (ten.length !== 10) return 'Please enter a 10-digit US phone number.';
        if (/^[01]/.test(ten) || /^[01]/.test(ten.slice(3)))
          return 'That does not look like a valid US number.';
        return null;
      },
    },
    {
      id: 'email',
      kind: 'email',
      prompt: 'Finally, your email address',
      help: 'Used to send confirmation and coverage information.',
      placeholder: 'you@example.com',
      validate: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'Please enter a valid email address.',
    },
  ];
}

type Phase = 'form' | 'submitting' | 'reveal' | 'dq';

export default function QualifyFlow({ segment }: { segment: Segment }) {
  const { track, bundle, setDisqualified } = useGateway();

  const steps = useMemo(() => buildSteps(segment), [segment]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>('form');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const startedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const step = steps[idx];
  const isLast = idx === steps.length - 1;

  useEffect(() => {
    if (phase === 'form' && startedRef.current) headingRef.current?.focus();
  }, [idx, phase]);

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    track('quiz_start', { segment: segment.id, question: step.id });
  }

  function advance(value: string) {
    const next = { ...answers, [step.id]: value };
    setAnswers(next);
    setDraft('');
    setError(null);

    if (step.id === 'age_range' && DQ_AGES.has(value)) {
      setPhase('dq');
      setDisqualified(true);
      track('quiz_complete', { outcome: 'dq', reason: 'age_out_of_range', segment: segment.id });
      return;
    }

    if (!isLast) {
      setIdx(idx + 1);
      return;
    }

    void submit(next);
  }

  async function submit(final: Record<string, string>) {
    if (!consent) {
      setError('Please check the consent box to continue.');
      return;
    }

    setPhase('submitting');
    setSubmitError(null);

    track('quiz_complete', { outcome: 'complete', segment: segment.id });

    try {
      const res = await fetch('/api/fe-gateway/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: bundle?.visitorId,
          segment: segment.id,
          answers: {
            segment_qualifier: final.segment_qualifier,
            age_range: final.age_range,
            gender: final.gender,
            current_coverage: final.current_coverage,
            beneficiary: final.beneficiary,
          },
          contact: {
            firstName: final.firstName,
            lastName: final.lastName,
            phone: final.phone,
            email: final.email,
            state: final.state,
          },
          consent: true,
          consentText: COMPLIANCE.tcpaExpress,
          params: bundle?.params ?? {},
          landingUrl: bundle?.landingUrl,
          referrer: bundle?.referrer,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; leadId?: string; error?: string };

      if (!res.ok || !data.ok) {
        setSubmitError(
          data.error === 'invalid_phone'
            ? 'That phone number does not look valid. Please go back and check it.'
            : 'Something went wrong saving your details. You can still call us directly below.',
        );
        // Still show the reveal — the call CTA is the real conversion and must
        // not be gated behind a storage failure.
        setPhase('reveal');
        return;
      }

      // lead_submit is its own conversion event (§3B) and reconciles to the
      // ledger by the shared eventId.
      track(
        'lead_submit',
        { segment: segment.id, lead_id: data.leadId },
        {
          firstName: final.firstName,
          lastName: final.lastName,
          email: final.email,
          phone: final.phone,
          state: final.state,
        },
      );

      setPhase('reveal');
    } catch {
      setSubmitError('Something went wrong. You can still call us directly below.');
      setPhase('reveal');
    }
  }

  function submitText() {
    const err = step.validate?.(draft) ?? null;
    if (err) {
      setError(err);
      return;
    }
    if (isLast && !consent) {
      setError('Please check the consent box to continue.');
      return;
    }
    markStarted();
    advance(draft.trim());
  }

  /* ---------------- DQ ---------------- */

  if (phase === 'dq') {
    return (
      <div className="rounded-2xl border p-7" style={{ borderColor: '#E3E3DA', background: '#fff' }}>
        <h2 className="text-[23px] font-bold" style={{ color: BRAND.ink }}>
          Thank you for your answers.
        </h2>
        <p className="mt-3 text-[18px] leading-relaxed">
          The final expense products available through this line are written for applicants
          aged {OFFER.minAge} to {OFFER.maxAge}. Outside that range there is not a policy we
          could put in front of you, so we will not ask for your details or take up your
          time with a call.
        </p>
      </div>
    );
  }

  /* ---------------- Submitting ---------------- */

  if (phase === 'submitting') {
    return (
      <div
        className="rounded-2xl border p-9 text-center"
        style={{ borderColor: '#E3E3DA', background: '#fff' }}
        role="status"
        aria-live="polite"
      >
        <div
          className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px]"
          style={{ borderColor: '#E3E3DA', borderTopColor: BRAND.primary }}
          aria-hidden="true"
        />
        <p className="mt-4 text-[19px] font-semibold" style={{ color: BRAND.ink }}>
          Checking coverage options in your state…
        </p>
      </div>
    );
  }

  /* ---------------- Soft pre-qual reveal → VSL → call ---------------- */

  if (phase === 'reveal') {
    return (
      <div className="space-y-7">
        <div
          className="rounded-2xl border-2 p-7"
          style={{ borderColor: BRAND.accentDeep, background: '#fff' }}
        >
          <h2 className="text-[25px] font-bold leading-tight" style={{ color: BRAND.ink }}>
            Thank you{answers.firstName ? `, ${answers.firstName}` : ''} — based on your
            answers, you may be eligible for final expense coverage.
          </h2>
          <p className="mt-3 text-[18px] leading-relaxed">
            This is not an approval and nothing has been decided. Eligibility, benefit
            amount and price depend on the health questions on the application, your state
            and the carrier. The next step is a short call with a licensed agent to confirm
            what you actually qualify for.
          </p>

          {submitError && (
            <p
              className="mt-4 rounded-lg px-4 py-3 text-[16px]"
              style={{ background: '#FDF3E7', color: '#8A5A1B' }}
              role="alert"
            >
              {submitError}
            </p>
          )}

          <div className="mt-6">
            <CallButton
              placement="prequal_reveal"
              label="Call {number}"
              subLabel="Speak with a licensed agent now"
            />
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: '#6B7A82' }}>
              {COMPLIANCE.callsRecorded} If we do not hear from you, a licensed agent may
              call you at the number you provided.
            </p>
          </div>
        </div>

        <VslBlock />

        <div className="rounded-2xl p-7 text-center" style={{ background: BRAND.primary }}>
          <p className="text-[19px] font-semibold text-white">
            Ready to find out what you qualify for?
          </p>
          <div className="mt-5 flex justify-center">
            <CallButton placement="post_vsl" label="Call {number}" />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Form ---------------- */

  const progress = (idx / steps.length) * 100;

  return (
    <div className="rounded-2xl border p-6 sm:p-7" style={{ borderColor: '#E3E3DA', background: '#fff' }}>
      {/* Progress bar (§2C.2) */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-[14px] font-medium" style={{ color: '#6B7A82' }}>
          <span>
            Step {idx + 1} of {steps.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: '#EBEBE2' }}>
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${progress}%`, background: BRAND.primary }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Form progress"
          />
        </div>
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-[23px] font-bold leading-tight outline-none sm:text-[26px]"
        style={{ color: BRAND.ink }}
      >
        {step.prompt}
      </h2>
      {step.help && (
        <p className="mt-1.5 text-[16px]" style={{ color: '#6B7A82' }}>
          {step.help}
        </p>
      )}

      {/* --- Choice --- */}
      {step.kind === 'choice' && (
        <div className="mt-6 grid gap-3">
          {step.options!.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                markStarted();
                advance(opt.value);
              }}
              className="w-full rounded-xl border-2 px-5 py-4 text-left text-[18px] font-medium active:scale-[0.99]"
              style={{ borderColor: '#DDDDD2', color: BRAND.ink, background: '#FCFCFA' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* --- Select --- */}
      {step.kind === 'select' && (
        <div className="mt-6">
          <label htmlFor={step.id} className="sr-only">
            {step.prompt}
          </label>
          <select
            id={step.id}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
            }}
            className="w-full rounded-xl border-2 px-4 py-4 text-[18px]"
            style={{ borderColor: '#DDDDD2', color: BRAND.ink, background: '#FCFCFA' }}
          >
            <option value="">Choose your state…</option>
            {step.options!.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={submitText}
            className="mt-4 w-full rounded-xl px-6 py-4 text-[19px] font-bold text-white active:scale-[0.99]"
            style={{ background: BRAND.primary }}
          >
            Continue
          </button>
        </div>
      )}

      {/* --- Text / tel / email --- */}
      {(step.kind === 'text' || step.kind === 'tel' || step.kind === 'email') && (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            submitText();
          }}
        >
          <label htmlFor={step.id} className="sr-only">
            {step.prompt}
          </label>
          <input
            id={step.id}
            type={step.kind === 'text' ? 'text' : step.kind}
            inputMode={step.kind === 'tel' ? 'tel' : undefined}
            autoComplete={
              step.id === 'firstName'
                ? 'given-name'
                : step.id === 'lastName'
                  ? 'family-name'
                  : step.kind === 'tel'
                    ? 'tel'
                    : step.kind === 'email'
                      ? 'email'
                      : 'off'
            }
            value={draft}
            placeholder={step.placeholder}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(null);
              markStarted();
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${step.id}-error` : undefined}
            className="w-full rounded-xl border-2 px-4 py-4 text-[18px]"
            style={{ borderColor: error ? '#C0392B' : '#DDDDD2', color: BRAND.ink, background: '#FCFCFA' }}
          />

          {/* Express written TCPA consent — directly above the submit (§2C.2). */}
          {isLast && (
            <div
              className="mt-5 rounded-xl border p-4"
              style={{ borderColor: '#DDDDD2', background: BRAND.sand }}
            >
              <label className="flex cursor-pointer gap-3 text-[13px] leading-relaxed" style={{ color: '#4A5A63' }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setError(null);
                  }}
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-describedby="tcpa-text"
                />
                <span id="tcpa-text">{COMPLIANCE.tcpaExpress}</span>
              </label>
            </div>
          )}

          {error && (
            <p id={`${step.id}-error`} className="mt-3 text-[16px] font-medium" style={{ color: '#C0392B' }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-4 w-full rounded-xl px-6 py-4 text-[19px] font-bold text-white active:scale-[0.99]"
            style={{ background: isLast ? BRAND.cta : BRAND.primary }}
          >
            {isLast ? 'See my options' : 'Continue'}
          </button>
        </form>
      )}
    </div>
  );
}
