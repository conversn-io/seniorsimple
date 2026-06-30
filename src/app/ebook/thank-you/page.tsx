import { Suspense } from 'react';
import type { Metadata } from 'next';
import EbookThankYou from '../../../components/pages/EbookThankYou';

export const metadata: Metadata = {
  title: 'Your guide is ready | SeniorSimple',
  description: 'Download your free SeniorSimple retirement guide and worksheets.',
  robots: { index: false, follow: false },
};

export default function EbookThankYouPage() {
  return (
    <Suspense fallback={null}>
      <EbookThankYou />
    </Suspense>
  );
}
