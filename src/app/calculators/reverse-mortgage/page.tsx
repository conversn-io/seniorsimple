import { Metadata } from 'next';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import ReverseMortgageCalculator from '@/components/calculators/ReverseMortgageCalculator';

export const metadata: Metadata = {
  title: 'Reverse Mortgage Calculator | SeniorSimple',
  description: 'Calculate how much you could receive from a reverse mortgage. Get personalized estimates based on your home value, age, and location.',
  keywords: 'reverse mortgage calculator, reverse mortgage, home equity, senior housing, retirement income, home equity loan',
  openGraph: {
    title: 'Reverse Mortgage Calculator | SeniorSimple',
    description: 'Calculate how much you could receive from a reverse mortgage.',
    type: 'website',
  },
};

export default function ReverseMortgageCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CalculatorWrapper
          title="Reverse Mortgage Calculator"
          description="Determine how much you could receive from a reverse mortgage based on your home value, age, and location. Get personalized estimates and understand the costs involved."
          component={<ReverseMortgageCalculator />}
          relatedContent={[
            {
              title: "Reverse Mortgage Guide",
              description: "Complete guide to understanding reverse mortgages",
              href: "/content/reverse-mortgage-guide"
            },
            {
              title: "Senior Housing Options",
              description: "Explore different housing options for seniors",
              href: "/content/senior-housing-options"
            },
            {
              title: "Home Equity Strategies",
              description: "Learn how to leverage your home equity in retirement",
              href: "/content/home-equity-strategies"
            }
          ]}
          ctaText="Get Personalized Housing Planning"
          ctaHref="/quiz"
        />
      </div>
    </div>
  );
}
