'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';
import FunnelFooter from './FunnelFooter';
import MinimalFunnelFooter from './MinimalFunnelFooter';
import { useFooter } from '../contexts/FooterContext';

const ConditionalFooter = () => {
  const { footerType, footerVariant } = useFooter();
  const pathname = usePathname();

  // Editorial-native advertorials render their own inline DisclosureFooter
  // (with the material-connection disclosure + SMN copyright). No site
  // footer here.
  //
  // The `/bridge/*` funnel target was retired 2026-07-27 (calculator now
  // renders inline on the listicle with social proof carried forward). Any
  // stale `/bridge/...` links redirect to `/lp/senior-benefits-2026` via
  // vercel.json — so if someone lands there, the /lp/ prefix guard below
  // still hides the site footer correctly.
  if (pathname?.startsWith('/lp/')) {
    return null;
  }
  if (footerType === 'none') return null;
  if (footerType === 'minimal') {
    return <MinimalFunnelFooter variant={footerVariant} />;
  }

  return footerType === 'funnel' ? <FunnelFooter /> : <Footer />;
};

export default ConditionalFooter;






