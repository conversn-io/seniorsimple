'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FunnelLayout } from './FunnelLayout';
import { ComplianceFooter } from './ComplianceFooter';
import { CtaButton } from './CtaButton';
import { fppAnalytics } from './_lib/analytics';
import { BANDS, QUIZ_MAX_SCORE, QUIZ_QUESTIONS, bandForScore, bandSlug } from './_lib/questions';
import type { Band } from './_lib/analytics';
import { extractUTMParameters, getStoredUTMParameters, hasUTMParameters, storeUTMParameters } from '@/utils/utm-utils';

const OFFER_HREF = '/the-simple-life/family-peace-plan';

type Step =
  | { kind: 'intro' }
  | { kind: 'question'; index: number }
  | { kind: 'capture' }
  | { kind: 'result'; band: Band; score: number; fname: string };

export function QuizFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ kind: 'intro' });
  const [answers, setAnswers] = useState<Array<0 | 1 | 2 | null>>(
    () => Array(QUIZ_QUESTIONS.length).fill(null),
  );
  const [fname, setFname] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const captureViewFired = useRef(false);

  // Persist UTM on first load so we can echo it to the offer route.
  useEffect(() => {
    const utm = extractUTMParameters();
    if (hasUTMParameters(utm)) storeUTMParameters(utm);
  }, []);

  // Scroll to top on step change (matches prototype).
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, [step]);

  // Fire capture-view once when we hit the capture screen.
  useEffect(() => {
    if (step.kind === 'capture' && !captureViewFired.current) {
      captureViewFired.current = true;
      fppAnalytics.quizCaptureView();
    }
  }, [step]);

  // Fire result-view when the result screen is shown.
  useEffect(() => {
    if (step.kind === 'result') {
      fppAnalytics.quizResultView(step.band, step.score);
    }
  }, [step]);

  const totalSlots = QUIZ_QUESTIONS.length + 1; // questions + capture
  const doneSlots =
    step.kind === 'intro' ? 0 :
    step.kind === 'question' ? step.index :
    step.kind === 'capture' ? QUIZ_QUESTIONS.length :
    totalSlots;
  const progressPct = step.kind === 'intro' ? 0 : Math.min(100, (doneSlots / totalSlots) * 100);
  const countLabel =
    step.kind === 'question' ? `Question ${step.index + 1} of ${QUIZ_QUESTIONS.length}` : '';

  const currentQ = step.kind === 'question' ? QUIZ_QUESTIONS[step.index] : null;

  function start() {
    fppAnalytics.quizStart();
    setStep({ kind: 'question', index: 0 });
  }

  function answer(value: 0 | 1 | 2) {
    if (step.kind !== 'question') return;
    const idx = step.index;
    const next = [...answers];
    next[idx] = value;
    setAnswers(next);
    fppAnalytics.quizQuestionAnswered(idx, value);
    if (idx < QUIZ_QUESTIONS.length - 1) {
      setStep({ kind: 'question', index: idx + 1 });
    } else {
      setStep({ kind: 'capture' });
    }
  }

  function back() {
    if (step.kind === 'question') {
      if (step.index === 0) setStep({ kind: 'intro' });
      else setStep({ kind: 'question', index: step.index - 1 });
    } else if (step.kind === 'capture') {
      setStep({ kind: 'question', index: QUIZ_QUESTIONS.length - 1 });
    }
  }

  async function submitCapture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const trimmedFname = fname.trim();
    const trimmedEmail = email.trim();
    if (!trimmedFname || !trimmedEmail) return;

    const score = answers.reduce<number>((a, b) => a + (b ?? 0), 0);
    const band = bandForScore(score);

    setSubmitting(true);
    setSubmitError(null);

    // The existing /api/subscribe route stores {source, source_detail, tags}.
    // We encode score/band/answers into `tags[]` for segmentation without a
    // schema change. Welcome sequence can branch on the `fpp-band-*` tag.
    const tags = [
      'family-peace-plan-funnel',
      `fpp-band-${bandSlug(band.name)}`,
      `fpp-score-${score}`,
    ];

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          first_name: trimmedFname,
          source: 'family-readiness-quiz',
          source_detail: band.name,
          tags,
        }),
      });
      // Non-2xx is logged but we still show the result — the score+band come
      // from the client and don't depend on the subscribe row existing.
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.warn('[FPP] /api/subscribe non-2xx:', res.status, data);
        setSubmitError(
          res.status === 429
            ? 'A lot of readers are checking right now — try again in a minute.'
            : null,
        );
      }
    } catch (err) {
      console.warn('[FPP] /api/subscribe failed:', err);
    } finally {
      setSubmitting(false);
      fppAnalytics.quizOptinSubmit(band.name, score);
      setStep({ kind: 'result', band: band.name, score, fname: trimmedFname });
    }
  }

  // Build the offer URL with band as a query param so the offer page can
  // optionally personalize + tag analytics.
  const offerHref = useMemo(() => {
    if (step.kind !== 'result') return OFFER_HREF;
    const utm = getStoredUTMParameters() || {};
    const p = new URLSearchParams();
    p.set('band', bandSlug(step.band));
    for (const [k, v] of Object.entries(utm)) if (v) p.set(k, v);
    return `${OFFER_HREF}?${p.toString()}`;
  }, [step]);

  return (
    <>
      <FunnelLayout topBar="SeniorSimple · The Simple Life" width="narrow">
        <div className="fpp-inner fpp-inner--narrow fpp-quiz">
          <div className="fpp-brandrow">
            <span className="fpp-brand">The Family Readiness Check</span>
            <span className="fpp-count">{countLabel}</span>
          </div>
          <div className="fpp-progress" aria-hidden>
            <div className="fpp-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          {step.kind === 'intro' && (
            <section>
              <h1>How ready is your family — really?</h1>
              <p className="fpp-dek">
                Six quick questions. Sixty seconds. You&apos;ll see exactly where your family&apos;s
                &ldquo;Guessing Gap&rdquo; is — the space between the things you&apos;ve got handled and
                the things they&apos;d have to guess about — plus a simple plan to close it.
              </p>
              <CtaButton onFire={start} onClick={start} aria-label="Start the free Family Readiness Check">
                Start the Free Check →
              </CtaButton>
              <div className="fpp-trust">
                <span>✓ 100% free</span>
                <span>✓ 60 seconds</span>
                <span>✓ No obligation, ever</span>
              </div>
            </section>
          )}

          {step.kind === 'question' && currentQ && (
            <section>
              <div className="fpp-q">{currentQ.text}</div>
              <div className="fpp-why">Why we ask: {currentQ.why}</div>
              <div className="fpp-opts" role="radiogroup" aria-label={currentQ.text}>
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className="fpp-opt"
                    onClick={() => answer(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="fpp-nav">
                <button type="button" className="fpp-back" onClick={back}>
                  ← Back
                </button>
                <span />
              </div>
            </section>
          )}

          {step.kind === 'capture' && (
            <section>
              <div className="fpp-capwrap">
                <div className="fpp-lock">🔒 Your answers are ready</div>
                <h1>Where should we send your results?</h1>
                <p className="fpp-dek">
                  We&apos;ll show your Family Readiness Score on the next screen and email you a copy —
                  along with your free <b>Family Map&trade; Starter</b> and The Simple Life weekly letter.
                </p>
              </div>
              <form onSubmit={submitCapture}>
                <div className="fpp-field">
                  <label htmlFor="fpp-fname">First name</label>
                  <input
                    id="fpp-fname"
                    name="fname"
                    type="text"
                    autoComplete="given-name"
                    required
                    placeholder="Carol"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                  />
                </div>
                <div className="fpp-field">
                  <label htmlFor="fpp-email">Email address</label>
                  <input
                    id="fpp-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="fpp-capwrap">
                  <button type="submit" className="fpp-cta" disabled={submitting}>
                    {submitting ? 'Sending…' : 'See My Results →'}
                  </button>
                </div>
                {submitError && (
                  <p style={{ color: '#B15A3C', textAlign: 'center', fontSize: 14, marginTop: 8 }}>
                    {submitError}
                  </p>
                )}
                <p className="fpp-consent">
                  By continuing you&apos;ll join The Simple Life (50,000+ readers) and receive your result
                  and free Family Map&trade; Starter. Unsubscribe anytime in one click. We never sell your
                  information. This is a free educational self-assessment — not legal, financial, or medical advice.
                </p>
              </form>
              <div className="fpp-nav">
                <button type="button" className="fpp-back" onClick={back}>
                  ← Back
                </button>
                <span />
              </div>
            </section>
          )}

          {step.kind === 'result' && (
            <QuizResult
              band={step.band}
              score={step.score}
              fname={step.fname}
              offerHref={offerHref}
              onOfferClick={() => router.push(offerHref)}
            />
          )}
        </div>
      </FunnelLayout>
      <div className="fpp">
        <ComplianceFooter width="narrow">
          The Family Readiness Check is a free educational self-assessment offered by SeniorSimple. It is not
          legal, financial, tax, or medical advice, and the Family Peace Plan is not a
          will or a substitute for one. Any resources referenced connect you with SeniorSimple&apos;s help line
          at no cost and with no obligation. © SeniorSimple.
        </ComplianceFooter>
      </div>
    </>
  );
}

function QuizResult({
  band,
  score,
  fname,
  offerHref,
  onOfferClick,
}: {
  band: Band;
  score: number;
  fname: string;
  offerHref: string;
  onOfferClick: () => void;
}) {
  const def = BANDS.find((b) => b.name === band) ?? BANDS[BANDS.length - 1];
  const pct = Math.round((score / QUIZ_MAX_SCORE) * 100);

  return (
    <section>
      <div className="fpp-checkmsg">
        ✓ You&apos;re in — check your inbox for your free Family Map&trade; Starter.
      </div>
      <h1>{fname ? `${fname}, here's your Family Readiness Score` : 'Your Family Readiness Score'}</h1>
      <div className="fpp-scorecard">
        <div className="fpp-band" style={{ color: def.color }}>{def.name}</div>
        <div className="fpp-meter" aria-hidden>
          <div
            className="fpp-meter-fill"
            style={{ width: `${pct}%`, background: def.color }}
          />
        </div>
        <div className="fpp-scoreline">
          Score: {score} of {QUIZ_MAX_SCORE} — {pct}% ready
        </div>
      </div>
      <p style={{ fontSize: 19, color: '#3d4a53' }}>{def.body}</p>
      <div className="fpp-offer-card">
        <div className="k">Your next step</div>
        <div className="ttl">The Family Peace Plan&trade;</div>
        <div className="sub">{def.offerSub}</div>
        <CtaButton
          href={offerHref}
          onFire={() => {
            /* offer_view fires on the destination page; we don't double-count here */
          }}
          onClick={(e) => {
            // Let Next handle client-side nav for perceived speed.
            e.preventDefault();
            onOfferClick();
          }}
        >
          Close My Guessing Gap →
        </CtaButton>
      </div>
      <p style={{ fontSize: 14, color: 'var(--fpp-muted)', textAlign: 'center' }}>
        Or watch your inbox — your free Family Map&trade; Starter is on its way, and this week&apos;s Simple
        Life letter lands soon.
      </p>
    </section>
  );
}
