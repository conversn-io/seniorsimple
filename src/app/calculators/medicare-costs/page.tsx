import { Metadata } from 'next';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import MedicareCostCalculator from '@/components/calculators/MedicareCostCalculator';

export const metadata: Metadata = {
  title: 'Medicare Cost Calculator | SeniorSimple',
  description: 'Calculate your Medicare costs including premiums, deductibles, and out-of-pocket expenses. Get personalized estimates for your healthcare budget.',
  keywords: 'medicare cost calculator, medicare costs, medicare premiums, medicare deductibles, healthcare costs, senior healthcare',
  openGraph: {
    title: 'Medicare Cost Calculator | SeniorSimple',
    description: 'Calculate your Medicare costs including premiums, deductibles, and out-of-pocket expenses.',
    type: 'website',
  },
};

export default function MedicareCostCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CalculatorWrapper
          title="Medicare Cost Calculator"
          description="Calculate your Medicare costs including premiums, deductibles, and out-of-pocket expenses. Get personalized estimates to help you budget for healthcare in retirement."
          component={<MedicareCostCalculator />}
          relatedContent={[
            {
              title: "Medicare Made Simple",
              description: "Complete guide to understanding Medicare",
              href: "/content/medicare-made-simple"
            },
            {
              title: "Medicare Enrollment Guide",
              description: "Step-by-step Medicare enrollment process",
              href: "/content/medicare-enrollment-guide"
            },
            {
              title: "Healthcare Cost Planning",
              description: "Plan for healthcare costs in retirement",
              href: "/content/healthcare-cost-planning"
            }
          ]}
          ctaText="Get Personalized Healthcare Planning"
          ctaHref="/quiz"
        />
      </div>
    </div>
  );
}
