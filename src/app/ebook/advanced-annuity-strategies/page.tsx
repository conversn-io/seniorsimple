import type { Metadata } from 'next';
import EbookFunnel from '../../../components/pages/EbookFunnel';

export const metadata: Metadata = {
  title: 'Advanced Annuity Strategies: Get More From the Same Retirement Dollars | SeniorSimple',
  description:
    'The newer annuity strategies that may help you keep up to 33% more total income — without more market risk. Free guide.',
};

export default function AdvancedAnnuityStrategiesPage() {
  return <EbookFunnel funnel="advanced-annuity-strategies" />;
}
