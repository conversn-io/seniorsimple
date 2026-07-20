'use client';

import {
  CtaProvider,
  ImageQuiz,
  MultiSelectQuiz,
  StateSelector,
  SavingsCalculator,
  type CtaSubs,
} from '@/components/advertorial-library';
import KitCtaShell from '@/advertorial-kit/components/KitCtaShell';
import libStyles from '@/components/advertorial-library/advertorial.module.css';

const SUBS: CtaSubs = {
  source_id: 'kit-preview',
  sub1: '',
  sub2: '',
  sub3: '',
  sub4: '',
  sub5: 'preview',
};

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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: 18, marginBottom: 8, color: '#111' }}>
        {title}
      </h2>
      <div style={{ border: '1px dashed #cbd5e1', padding: 16, background: '#fff' }}>
        {children}
      </div>
    </section>
  );
}

function AllFour({ label }: { label: string }) {
  return (
    <>
      <Panel title={`${label} — ImageQuiz (submitVariant blue)`}>
        <ImageQuiz
          question="What do you spend the most on?"
          selectionKey="spend_focus"
          options={IMAGE_QUIZ_OPTIONS}
          submitLabel="See My Discounts →"
          submitVariant="blue"
        />
      </Panel>
      <Panel title={`${label} — MultiSelectQuiz (submitVariant green)`}>
        <MultiSelectQuiz
          question="How often do you eat out?"
          selectionKey="dine_frequency"
          options={MULTI_OPTIONS}
          submitLabel="See My Savings →"
          submitVariant="green"
        />
      </Panel>
      <Panel title={`${label} — StateSelector`}>
        <StateSelector
          selectionKey="state"
          options={STATE_OPTIONS}
          prompt="Which state are you in?"
          ctaLabel="See the Discounts in My State »"
        />
      </Panel>
      <Panel title={`${label} — SavingsCalculator`}>
        <SavingsCalculator />
      </Panel>
    </>
  );
}

export default function PreviewClient() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Advertorial-kit interactives — CSS scope preview</h1>
      <p style={{ color: '#475569', marginBottom: 24 }}>
        Left column matches the current kit render (no <code>.root</code> wrapper). Right column
        matches the legacy LpPage wrap (<code>.root</code> wrapper active, CSS variables resolve).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: '#dc2626' }}>
            RAW kit (no .root — pre-fix)
          </h2>
          <CtaProvider base="/lp/preview" subs={SUBS}>
            <AllFour label="Raw" />
          </CtaProvider>
        </div>
        <div>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: '#2563eb' }}>
            KitCtaShell (post-fix)
          </h2>
          <KitCtaShell slug="preview" siteId="seniorsimple.org" variant={null}>
            <AllFour label="Shell" />
          </KitCtaShell>
        </div>
        <div className={libStyles.root}>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: '#059669' }}>LEGACY (.root ref)</h2>
          <CtaProvider base="/lp/preview" subs={SUBS}>
            <AllFour label="Legacy" />
          </CtaProvider>
        </div>
      </div>
    </main>
  );
}
