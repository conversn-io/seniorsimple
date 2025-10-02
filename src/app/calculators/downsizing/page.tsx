import { Metadata } from 'next';
import CalculatorWrapper from '@/components/calculators/CalculatorWrapper';
import DownsizingCalculator from '@/components/calculators/DownsizingCalculator';

export const metadata: Metadata = {
  title: 'Downsizing Calculator | SeniorSimple',
  description: 'Calculate the financial benefits of downsizing your home. Get personalized estimates of costs, savings, and potential proceeds from selling your current home.',
  keywords: 'downsizing calculator, senior housing, home downsizing, retirement housing, senior living, housing options',
  openGraph: {
    title: 'Downsizing Calculator | SeniorSimple',
    description: 'Calculate the financial benefits of downsizing your home.',
    type: 'website',
  },
};

export default function DownsizingCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <CalculatorWrapper
          title="Downsizing Calculator"
          description="Calculate the financial benefits of downsizing your home. Get personalized estimates of costs, savings, and potential proceeds from selling your current home."
          component={<DownsizingCalculator />}
          relatedContent={[
            {
              title: "Downsizing Strategy Guide",
              description: "Complete guide to downsizing for seniors",
              href: "/content/downsizing-strategy-guide"
            },
            {
              title: "Senior Housing Options",
              description: "Explore different housing options for seniors",
              href: "/content/senior-housing-options"
            },
            {
              title: "Aging in Place Guide",
              description: "Learn how to age in place successfully",
              href: "/content/aging-in-place-guide"
            }
          ]}
          ctaText="Get Personalized Housing Planning"
          ctaHref="/quiz"
        />
      </div>
    </div>
  );
}
