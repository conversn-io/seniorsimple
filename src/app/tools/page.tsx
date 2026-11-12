import Tools from '../../components/pages/Tools';
import JsonLd, { chassisMetadata } from '@/components/publisher/JsonLd';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/publisher/schema';

// WO-1507 chassis: real title/description (D5) + CollectionPage/Breadcrumb JSON-LD (D1)
const TITLE = 'Free Retirement Tools & Planners for Seniors';
const DESCRIPTION =
  'Free, easy-to-use retirement tools for people 55+: income planners, Medicare cost estimators, reverse mortgage and Social Security calculators.';

export const metadata = chassisMetadata({ title: TITLE, description: DESCRIPTION, path: '/tools' });

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({ path: '/tools', name: TITLE, description: DESCRIPTION }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
          ]),
        ]}
      />
      <Tools />
    </>
  );
}
