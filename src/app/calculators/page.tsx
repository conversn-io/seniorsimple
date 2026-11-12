import Calculators from '../../components/pages/Calculators';
import JsonLd, { chassisMetadata } from '@/components/publisher/JsonLd';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/publisher/schema';

// WO-1507 chassis: real title/description (D5) + CollectionPage/Breadcrumb JSON-LD (D1)
const TITLE = 'Free Retirement Calculators';
const DESCRIPTION =
  'Run the numbers on retirement savings, Social Security, Medicare costs, life insurance, downsizing, and reverse mortgages — free, private, no sign-up.';

export const metadata = chassisMetadata({ title: TITLE, description: DESCRIPTION, path: '/calculators' });

export default function CalculatorsPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({ path: '/calculators', name: TITLE, description: DESCRIPTION }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Calculators', path: '/calculators' },
          ]),
        ]}
      />
      <Calculators />
    </>
  );
}
