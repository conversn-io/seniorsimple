import { Metadata } from 'next';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import RetirementSavingsCalculator from '@/components/calculators/RetirementSavingsCalculator';

export const metadata: Metadata = {
  title: 'Retirement Savings Calculator | SeniorSimple',
  description: 'Calculate how much you need to save for retirement and track your progress. Get personalized recommendations for your retirement savings goals.',
  keywords: 'retirement savings calculator, retirement planning, retirement goals, savings calculator, retirement income, financial planning',
  openGraph: {
    title: 'Retirement Savings Calculator | SeniorSimple',
    description: 'Calculate how much you need to save for retirement and track your progress.',
    type: 'website',
  },
};

export default function RetirementSavingsCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CalculatorWrapper
          title="Retirement Savings Calculator"
          description="Calculate how much you need to save for retirement and track your progress. Get personalized recommendations based on your current savings, income, and retirement goals."
          component={<RetirementSavingsCalculator />}
          relatedContent={[
            {
              title: "Retirement Planning Guide",
              description: "Complete guide to retirement planning",
              href: "/content/retirement-planning-guide"
            },
            {
              title: "Social Security Strategy",
              description: "Optimize your Social Security benefits",
              href: "/content/social-security-strategy"
            },
            {
              title: "Investment Growth Calculator",
              description: "See how your investments could grow",
              href: "/calculators/investment-growth"
            }
          ]}
          ctaText="Get Personalized Retirement Planning"
          ctaHref="/quiz"
        />
      </div>
    </div>
  );
}
