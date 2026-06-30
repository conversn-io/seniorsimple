import type { Metadata } from 'next';
import EbookFunnel from '../../../components/pages/EbookFunnel';

export const metadata: Metadata = {
  title: "Annuity Do's & Don'ts Every Baby Boomer Should Read First | SeniorSimple",
  description:
    'The avoidable annuity mistakes that can quietly cost you up to 33% of your retirement income — plus the checklist to sidestep every one. Free guide.',
};

export default function AnnuityDosDontsPage() {
  return <EbookFunnel funnel="annuity-dos-donts" />;
}
