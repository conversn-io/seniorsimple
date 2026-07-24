import { Metadata } from 'next';
import MedicareCostCalculator from '@/components/calculators/MedicareCostCalculator';
import ScrollRevealedEmailButton from '@/components/articles/ScrollRevealedEmailButton';
import MedicareEducationalFacts from '@/components/articles/MedicareEducationalFacts';

// §8-C directive (2026-07-23): phone CTAs removed from the calculator page.
// The InterstitialCTABanner (inline phone) and ScrollRevealedCallButton
// (sticky phone) mounts are gone. Phone lives at /get-help/medicare — the
// calculator's own bridge quiz result view links there when the user resolves
// to a bucket. The sticky Simple Life Newsletter is the only bottom-locked
// surface (parallels the article template behavior).

export const metadata: Metadata = {
  title: 'Medicare Cost Calculator | SeniorSimple',
  description: 'Calculate your Medicare costs and compare different plan options. Get personalized estimates for premiums, deductibles, and out-of-pocket expenses.',
  keywords: 'medicare cost calculator, medicare costs, medicare premiums, healthcare costs, senior healthcare',
  openGraph: {
    title: 'Medicare Cost Calculator | SeniorSimple',
    description: 'Calculate your Medicare costs and compare different plan options.',
    type: 'website',
  },
};

export default function MedicareCostCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <MedicareCostCalculator />
        {/* §8-E educational body content — was inside the calculator until it
            was extracted so guide-archetype articles (quiz-mounted) don't
            lose it. Mounted here explicitly since this route doesn't go
            through the article template. */}
        <MedicareEducationalFacts />
      </div>
      <ScrollRevealedEmailButton slug="calculators/medicare-costs" category="Medicare" />
    </div>
  );
}
