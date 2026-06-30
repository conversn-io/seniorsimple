import type { Metadata } from 'next';
import EbookFunnel from '../../../components/pages/EbookFunnel';

export const metadata: Metadata = {
  title: 'Retirement Made Simple — Structure Your Retirement With Annuities | SeniorSimple',
  description:
    'Structure your retirement with annuities to receive up to 33% more income. Two free guides plus the worksheets to put them to work.',
};

export default function RetirementRescueKitPage() {
  return <EbookFunnel funnel="retirement-rescue-kit" />;
}
