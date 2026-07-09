import type { Metadata } from 'next';
import { SalesLetterPage } from '@/components/family-peace-plan/SalesLetterPage';
import { gateFamilyPeacePlan } from '@/components/family-peace-plan/_lib/featureFlag';

export const metadata: Metadata = {
  title: 'The Family Peace Plan™ — End the Guessing · SeniorSimple',
  description:
    'The greatest gift you may ever give your family isn’t more money. It’s the certainty they’ll never have to guess. A simple, guided plan for one quiet afternoon.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'The Family Peace Plan™ — one quiet afternoon',
    description:
      'A simple, guided way to gather everything your family would one day need to find, into one calm place.',
    type: 'website',
  },
};

export default function FamilyPeacePlanLetterPage() {
  gateFamilyPeacePlan();
  return <SalesLetterPage />;
}
