import { Metadata } from 'next';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import SocialSecurityCalculator from '@/components/calculators/SocialSecurityCalculator';

export const metadata: Metadata = {
  title: 'Social Security Benefits Calculator | SeniorSimple',
  description: 'Calculate your Social Security benefits and find the optimal claiming strategy. Get personalized estimates based on your earnings history and retirement timeline.',
  keywords: 'social security calculator, social security benefits, retirement planning, social security claiming strategy, retirement income',
  openGraph: {
    title: 'Social Security Benefits Calculator | SeniorSimple',
    description: 'Calculate your Social Security benefits and find the optimal claiming strategy.',
    type: 'website',
  },
};

export default function SocialSecurityCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CalculatorWrapper
          title="Social Security Benefits Calculator"
          description="Estimate your Social Security benefits and discover the optimal claiming strategy for your retirement timeline. Get personalized projections based on your earnings history."
          component={<SocialSecurityCalculator />}
          relatedContent={[
            {
              title: "Social Security Strategy Guide",
              description: "Learn the best strategies for claiming Social Security benefits",
              href: "/content/social-security-strategy-guide"
            },
            {
              title: "Retirement Planning Guide", 
              description: "Complete guide to retirement planning for seniors",
              href: "/content/retirement-planning-guide"
            },
            {
              title: "Tax Planning for Retirement",
              description: "Optimize your retirement tax strategy",
              href: "/content/tax-planning-strategy"
            }
          ]}
          ctaText="Get Personalized Retirement Planning"
          ctaHref="/quiz"
        />
      </div>
    </div>
  );
}
