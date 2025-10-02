import { Metadata } from 'next';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import InvestmentGrowthCalculator from '@/components/calculators/InvestmentGrowthCalculator';

export const metadata: Metadata = {
  title: 'Investment Growth Calculator | SeniorSimple',
  description: 'See how your investments could grow over time with compound interest. Calculate different investment scenarios and growth projections.',
  keywords: 'investment growth calculator, compound interest, investment calculator, retirement investing, portfolio growth, investment planning',
  openGraph: {
    title: 'Investment Growth Calculator | SeniorSimple',
    description: 'See how your investments could grow over time with compound interest.',
    type: 'website',
  },
};

export default function InvestmentGrowthCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CalculatorWrapper
          title="Investment Growth Calculator"
          description="See how your investments could grow over time with compound interest. Calculate different investment scenarios and growth projections for your retirement planning."
          component={<InvestmentGrowthCalculator />}
          relatedContent={[
            {
              title: "Retirement Investment Guide",
              description: "Learn about retirement investment strategies",
              href: "/content/retirement-investment-guide"
            },
            {
              title: "Tax-Efficient Withdrawals",
              description: "Optimize your retirement withdrawals",
              href: "/content/tax-efficient-withdrawals"
            },
            {
              title: "Retirement Savings Calculator",
              description: "Calculate your retirement savings needs",
              href: "/calculators/retirement-savings"
            }
          ]}
          ctaText="Get Personalized Investment Planning"
          ctaHref="/quiz"
        />
      </div>
    </div>
  );
}
