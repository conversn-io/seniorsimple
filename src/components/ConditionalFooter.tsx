'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';
import FunnelFooter from './FunnelFooter';
import MinimalFunnelFooter from './MinimalFunnelFooter';
import { useFooter } from '../contexts/FooterContext';

const ConditionalFooter = () => {
  const { footerType, footerVariant } = useFooter();
  const pathname = usePathname();

  // Editorial-native advertorials AND their /bridge/* funnel targets
  // render their own inline DisclosureFooter (with the material-
  // connection disclosure + SMN copyright). No site footer here.
  if (pathname?.startsWith('/lp/') || pathname?.startsWith('/bridge/')) {
    return null;
  }
  if (footerType === 'none') return null;
  if (footerType === 'minimal') {
    return <MinimalFunnelFooter variant={footerVariant} />;
  }

  return footerType === 'funnel' ? <FunnelFooter /> : <Footer />;
};

export default ConditionalFooter;






