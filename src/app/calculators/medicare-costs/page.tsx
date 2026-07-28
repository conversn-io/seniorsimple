import { Metadata } from 'next';
import Calculator from '@/components/calculators/Calculator';
import SimpleLifeStickyBar from '@/components/capture/SimpleLifeStickyBar';
import EducationalFacts from '@/components/articles/EducationalFacts';
import { medicareKit } from '@/lib/capture-kits/medicare';

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
        <Calculator vertical="medicare" title="Medicare Cost Calculator" subtitle="Estimate your Medicare costs and compare plan options" />
        <EducationalFacts vertical="medicare" />
      </div>
      <SimpleLifeStickyBar pageSlug="calculators/medicare-costs" />
    </div>
  );
}
