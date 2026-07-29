'use client';

/**
 * Dev-only preview of every interactive advertorial-kit primitive.
 *
 * Wrapped in KitCtaShell so the primitives resolve `advertorial_root` CSS
 * variables (--cta / --blue / --band / --rule / --sel) exactly as they do
 * on a live /lp/[slug] render.
 *
 * Handy for CSS-scope regressions, component API changes, and verifying
 * tap-to-navigate hrefs. Not linked anywhere in the app.
 */

import {
  ImageQuiz,
  MultiSelectQuiz,
  SavingsCalculator,
  StateMap,
  StateSelector,
} from '@/components/advertorial-library';
import KitCtaShell from '@/advertorial-kit/components/KitCtaShell';

const IMAGE_QUIZ_OPTIONS = [
  { value: 'dining', label: 'Dining', icon: '🍽️' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
];

const MULTI_OPTIONS = [
  { value: 'weekly', label: 'Every week' },
  { value: 'few', label: 'A few times a month' },
  { value: 'monthly', label: 'Once a month' },
  { value: 'rarely', label: 'Rarely' },
];

const STATE_OPTIONS = [
  { value: 'CA', label: 'California' },
  { value: 'FL', label: 'Florida' },
  { value: 'TX', label: 'Texas' },
  { value: 'NY', label: 'New York' },
];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: 18,
          margin: '0 0 4px',
          color: '#111',
        }}
      >
        {title}
      </h2>
      {hint ? (
        <p
          style={{
            fontFamily: 'Arial, sans-serif',
            fontSize: 12,
            color: '#64748b',
            margin: '0 0 12px',
          }}
        >
          {hint}
        </p>
      ) : null}
      <div style={{ border: '1px dashed #cbd5e1', padding: 16, background: '#fff' }}>
        {children}
      </div>
    </section>
  );
}

export default function PreviewClient() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>
        Advertorial-kit interactives
      </h1>
      <p style={{ color: '#475569', marginBottom: 24 }}>
        Rendered inside <code>KitCtaShell</code> so CSS variables cascade
        and the interactive components resolve their brand palette. Tap any
        tile / pill / state to see the outbound URL Vercel would open (a
        new tab will open pointed at <code>/lp/preview?…</code>).
      </p>

      <KitCtaShell slug="preview" siteId="seniorsimple.org" variant={null}>
        <Section
          title="D4 · StateMap (NEW — tap-to-navigate)"
          hint="Real geographic US map. Tap any state OR chip → /out with sub7=<state>."
        >
          <StateMap
            selectionKey="state"
            ctaLabel="Select Your State"
            prompt="Tap your state to see what you qualify for."
            stepLabel="Step 1 · Your state"
            step2Label="Step 2 · See what you qualify for"
          />
        </Section>

        <Section
          title="D1 · ImageQuiz (tap-to-navigate)"
          hint="Tapping a tile navigates on the first click. No submit button."
        >
          <ImageQuiz
            question="What do you spend the most on?"
            selectionKey="spend_focus"
            options={IMAGE_QUIZ_OPTIONS}
          />
        </Section>

        <Section
          title="D2 · MultiSelectQuiz (tap-to-navigate)"
          hint="Tapping a pill navigates on the first click. No submit button."
        >
          <MultiSelectQuiz
            question="How often do you eat out?"
            selectionKey="spend_focus"
            options={MULTI_OPTIONS}
          />
        </Section>

        <Section
          title="D3 · StateSelector (legacy dropdown — retained for existing rows)"
          hint="Kept until PS-00 swaps live state_selector rows to state_map."
        >
          <StateSelector
            selectionKey="state"
            options={STATE_OPTIONS}
            prompt="Which state are you in?"
            ctaLabel="See the Discounts in My State »"
          />
        </Section>

        <Section title="H1 · SavingsCalculator" hint="Numeric-only inputs; single submit CTA.">
          <SavingsCalculator />
        </Section>
      </KitCtaShell>
    </main>
  );
}
