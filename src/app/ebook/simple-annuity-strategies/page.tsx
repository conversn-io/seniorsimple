import type { Metadata } from 'next';
import EbookFunnel from '../../../components/pages/EbookFunnel';

export const metadata: Metadata = {
  title: 'Simple Annuity Strategies: Get More From the Same Retirement Dollars | SeniorSimple',
  description:
    'The newer annuity strategies that may help you keep up to 33% more total income — without more market risk. Free guide.',
};

export default function SimpleAnnuityStrategiesPage() {
  return <EbookFunnel funnel="simple-annuity-strategies" />;
}
