import type { Metadata } from 'next';
import { OfferPage } from '@/components/family-peace-plan/OfferPage';
import { gateFamilyPeacePlan } from '@/components/family-peace-plan/_lib/featureFlag';
import { resolvePriceBucket } from '@/components/family-peace-plan/_lib/priceBucket';

export const metadata: Metadata = {
  title: 'The Family Peace Plan™ — End the Guessing · SeniorSimple',
  description:
    'A guided, watch-anytime system that helps you finish organizing everything your family would ever need — in one calm Sunday afternoon.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'The Family Peace Plan™',
    description: 'Get it done this Sunday afternoon — the guided system that closes the Guessing Gap.',
    type: 'website',
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FamilyPeacePlanPage({ searchParams }: PageProps) {
  gateFamilyPeacePlan();
  const params = await searchParams;
  const priceBucket = resolvePriceBucket(params);
  const bandParam = params.band;
  const bandSlug = Array.isArray(bandParam) ? bandParam[0] : bandParam;
  return <OfferPage priceBucket={priceBucket} bandSlug={bandSlug} />;
}
