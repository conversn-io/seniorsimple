'use client';

/**
 * H1 · SavingsCalculator — advertorial → personalized savings → checkout.
 *
 * Rebuild of APC's own Savings Estimator as our quiz funnel. Each input
 * contributes value × weekly_multiplier × frequency_per_year to a live
 * yearly total. Typical profile ≈ $1,775/yr per APC's estimator.
 *
 * Attribution: on any input touch, calls useSetCtaSelection('click_source',
 * 'calc') → sub10=calc so Prismique can attribute conversions that came
 * through the calculator vs. straight CTA clicks. sub6 (spend_focus) is
 * untouched, so a calc + quiz combo carries BOTH signals.
 *
 * COMPLIANCE (guide §5.2 + label rule):
 *   * Label the total "estimated" — never a promise.
 *   * Copy under the total explains the $120/yr cost transparently.
 *   * Never claim guaranteed savings.
 *
 * TODO — multipliers. The 4 defaults are from the reference demo. Pull
 * APC's real per-input multipliers from perks_lp_optimization_v2_calculator.md
 * and consider expanding to ~9 high-value inputs (add: groceries, flights,
 * gym visits, prescriptions, oil changes) once sourced.
 */

import { useCallback, useMemo, useState } from 'react';
import styles from '../advertorial.module.css';
import { useCtaHref, useSetCtaSelection } from './CtaContext';

export interface SavingsInput {
  label: string;
  /** Per-instance dollar multiplier — sourced from APC's own estimator. */
  weight: number;
  /** How many instances / year. Weekly=52, monthly=12, yearly=1. */
  frequencyPerYear: number;
  /** Optional starting value (default 0). */
  defaultValue?: number;
}

interface SavingsCalculatorProps {
  /** Input rows shown to the user. Order matters — first row is the anchor. */
  inputs?: SavingsInput[];
  /** Callback CTA label. */
  ctaLabel?: React.ReactNode;
  /** Monthly membership cost — $9.99/mo is APC's stated price. */
  monthlyCost?: number;
}

const DEFAULT_INPUTS: SavingsInput[] = [
  // TODO: replace weights with sourced APC estimator multipliers.
  { label: 'Dinners out / week', weight: 5, frequencyPerYear: 52 },
  { label: 'Movie tickets / month', weight: 4, frequencyPerYear: 12 },
  { label: 'Hotel nights / year', weight: 25, frequencyPerYear: 1 },
  { label: 'Theme-park tickets / year', weight: 20, frequencyPerYear: 1 },
];

const YEARLY_COST = 120; // $9.99 × 12 = $119.88, round up.

function formatDollars(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export default function SavingsCalculator({
  inputs = DEFAULT_INPUTS,
  ctaLabel = <>See My Member Discounts →</>,
  monthlyCost = 9.99,
}: SavingsCalculatorProps) {
  const [values, setValues] = useState<number[]>(() =>
    inputs.map((i) => i.defaultValue ?? 0)
  );

  const ctaHref = useCtaHref();
  const setSelection = useSetCtaSelection();

  const yearlyTotal = useMemo(
    () =>
      values.reduce(
        (sum, v, i) => sum + (v || 0) * inputs[i].weight * inputs[i].frequencyPerYear,
        0
      ),
    [values, inputs]
  );

  const handleChange = useCallback(
    (index: number, raw: string) => {
      const parsed = Math.max(0, parseFloat(raw) || 0);
      setValues((prev) => {
        if (prev[index] === parsed) return prev;
        const next = [...prev];
        next[index] = parsed;
        return next;
      });
      // Mark the calc as engaged so downstream conversions attribute correctly.
      setSelection('click_source', 'calc');
    },
    [setSelection]
  );

  const above = yearlyTotal >= YEARLY_COST;
  const above120Delta = above ? yearlyTotal - YEARLY_COST : 0;
  const yearlyCostLabel = `$${monthlyCost.toFixed(2)}/mo ($${YEARLY_COST}/yr)`;

  return (
    <section className={styles.calc} aria-label="Estimated yearly savings calculator">
      <div className={styles.calcResult}>
        <div className={styles.calcKicker}>Your estimated yearly savings</div>
        <div className={styles.calcTotal}>{formatDollars(yearlyTotal)}</div>
        <div className={styles.calcHint}>
          {above ? (
            <>
              That&apos;s <b>{formatDollars(above120Delta)}</b> more than the{' '}
              {yearlyCostLabel} membership.
            </>
          ) : (
            <>Membership is {yearlyCostLabel}.</>
          )}
        </div>
        <a
          className={`${styles.cta} ${styles.ctaBlue} ${styles.ctaFull}`}
          href={ctaHref}
          rel="sponsored nofollow noopener"
          target="_blank"
          style={{ marginTop: 10 }}
        >
          {ctaLabel}
        </a>
      </div>

      <div className={styles.calcInputs}>
        {inputs.map((input, i) => (
          <label key={input.label} className={styles.calcRow}>
            <span>{input.label}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={values[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              className={styles.calcInput}
            />
          </label>
        ))}
      </div>
      <div className={styles.calcNote}>
        Estimated only — actual savings vary by location and use. Membership
        pricing at $9.99/mo ($120/yr).
      </div>
    </section>
  );
}
