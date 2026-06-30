import type { Metadata } from 'next';
import EbookFunnel from '../../../components/pages/EbookFunnel';

export const metadata: Metadata = {
  title: 'The Retirement Rescue Kit — What to Do and Avoid With Your Retirement Income | SeniorSimple',
  description:
    'Both guides in one free kit: stop the leaks that drain your income, and apply the strategies that may help you keep up to 33% more of it.',
};

export default function RetirementRescueKitPage() {
  return <EbookFunnel funnel="retirement-rescue-kit" />;
}
