import type { Metadata } from 'next';
import { AdvertorialPage } from '@/components/family-peace-plan/AdvertorialPage';
import { gateFamilyPeacePlan } from '@/components/family-peace-plan/_lib/featureFlag';

export const metadata: Metadata = {
  title: 'The One Question That Made Me Finally Get Organized — SeniorSimple',
  description:
    'For years our whole life lived in three drawers, a shoebox, and my memory. Here’s the simple idea that changed it — and gave my kids something more valuable than money.',
  robots: { index: false, follow: false }, // feature-flagged / draft — remove when Keenan signs off
  openGraph: {
    title: 'The One Question That Made Me Finally Get Organized',
    description:
      'A SeniorSimple story about closing the Guessing Gap — the space between your documents and what your family actually needs to find.',
    type: 'article',
  },
};

export default function FamilyPeacePlanStoryPage() {
  gateFamilyPeacePlan();
  return <AdvertorialPage />;
}
