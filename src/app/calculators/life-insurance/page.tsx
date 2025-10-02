import { Metadata } from 'next';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import LifeInsuranceCalculator from '@/components/calculators/LifeInsuranceCalculator';

export const metadata: Metadata = {
  title: 'Life Insurance Calculator | SeniorSimple',
  description: 'Calculate the right amount of life insurance coverage for your family. Get personalized recommendations based on your financial situation and goals.',
  keywords: 'life insurance calculator, life insurance coverage, life insurance needs, insurance planning, family protection, estate planning',
  openGraph: {
    title: 'Life Insurance Calculator | SeniorSimple',
    description: 'Calculate the right amount of life insurance coverage for your family.',
    type: 'website',
  },
};

export default function LifeInsuranceCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CalculatorWrapper
          title="Life Insurance Calculator"
          description="Calculate the right amount of life insurance coverage for your family. Get personalized recommendations based on your financial situation, debts, and future needs."
          component={<LifeInsuranceCalculator />}
          relatedContent={[
            {
              title: "Life Insurance Guide",
              description: "Complete guide to life insurance for seniors",
              href: "/content/life-insurance-guide"
            },
            {
              title: "Estate Planning Essentials",
              description: "Learn the basics of estate planning",
              href: "/content/estate-planning-essentials"
            },
            {
              title: "Beneficiary Planning",
              description: "Plan for your beneficiaries and heirs",
              href: "/content/beneficiary-planning-guide"
            }
          ]}
          ctaText="Get Personalized Insurance Planning"
          ctaHref="/life-insurance-quiz"
        />
      </div>
    </div>
  );
}
