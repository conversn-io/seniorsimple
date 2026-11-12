import Resources from '../../components/pages/Resources';
import JsonLd, { chassisMetadata } from '@/components/publisher/JsonLd';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/publisher/schema';

// WO-1507 chassis: real title/description (D5) + CollectionPage/Breadcrumb JSON-LD (D1)
const TITLE = 'Retirement Resources, Guides & Checklists';
const DESCRIPTION =
  'Free retirement guides, checklists, and planning resources for seniors — Medicare, estate planning, annuities, taxes, and housing in plain English.';

export const metadata = chassisMetadata({ title: TITLE, description: DESCRIPTION, path: '/resources' });

export default function ResourcesPage() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({ path: '/resources', name: TITLE, description: DESCRIPTION }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Resources', path: '/resources' },
          ]),
        ]}
      />
      <Resources />
    </>
  );
}
