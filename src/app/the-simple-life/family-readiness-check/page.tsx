import type { Metadata } from 'next';
import { QuizPageClient } from '@/components/family-peace-plan/QuizPageClient';
import { gateFamilyPeacePlan } from '@/components/family-peace-plan/_lib/featureFlag';

export const metadata: Metadata = {
  title: 'The Family Readiness Check — SeniorSimple',
  description:
    'Six quick questions to see where your family’s Guessing Gap is — and a simple plan to close it. Free · 60 seconds · no obligation.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'How ready is your family — really?',
    description: 'Take the free Family Readiness Check and find out where your Guessing Gap is.',
    type: 'website',
  },
};

export default function FamilyReadinessCheckPage() {
  gateFamilyPeacePlan();
  return <QuizPageClient />;
}
