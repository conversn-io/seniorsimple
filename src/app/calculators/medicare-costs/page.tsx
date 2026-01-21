import { Metadata } from 'next';
import MedicareCostCalculator from '@/components/calculators/MedicareCostCalculator';
import InterstitialCTABanner from '@/components/articles/InterstitialCTABanner';
import ScrollRevealedCallButton from '@/components/articles/ScrollRevealedCallButton';

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
  // Resolve phone number from environment variable
  const phoneNumber = process.env.NEXT_PUBLIC_DEFAULT_PHONE_NUMBER || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <MedicareCostCalculator />
        
        {/* Interstitial CTA Banner - appears mid-content */}
        {phoneNumber && (
          <div className="mt-12">
            <InterstitialCTABanner
              phoneNumber={phoneNumber}
              serviceName="Medicare Services"
              headline="Need Help with Medicare?"
              subheadline="Speak with a licensed Medicare advisor today"
              variant="friendly"
              dismissible={true}
            />
          </div>
        )}
      </div>

      {/* Scroll-Revealed Call Button */}
      {phoneNumber && (
        <ScrollRevealedCallButton
          phoneNumber={phoneNumber}
          serviceName="Medicare Services"
        />
      )}
    </div>
  );
}