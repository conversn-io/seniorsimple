import type { Metadata } from 'next';
import { SalesLetterPage } from '@/components/family-peace-plan/SalesLetterPage';
import { gateFamilyPeacePlan } from '@/components/family-peace-plan/_lib/featureFlag';

export const metadata: Metadata = {
  title: 'Simple Estate Prep™ — Get organized before you hire a specialist · SeniorSimple',
  description:
    'Simple Estate Prep™, featuring The Family Peace Plan™: gather the information your family, attorney, or advisor may one day need — in one calm Sunday afternoon.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Simple Estate Prep™ — one calm Sunday afternoon',
    description:
      'Get your affairs in order the calm way. A guided path, not a pile of pages — built so finishing finally feels simple.',
    type: 'website',
  },
};

export default function FamilyPeacePlanLetterPage() {
  gateFamilyPeacePlan();
  return <SalesLetterPage />;
}
