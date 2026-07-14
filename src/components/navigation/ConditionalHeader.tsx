'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { FunnelHeader } from './FunnelHeader';
import { useHeader } from '../../contexts/FooterContext';

const ConditionalHeader = () => {
  const { headerType } = useHeader();
  const pathname = usePathname();

  // Editorial-native advertorials AND their /bridge/* funnel targets
  // render with only their own Masthead — no site chrome. See
  // shared-utils/ADVERTORIAL_SPLIT_TESTING.md.
  if (pathname?.startsWith('/lp/') || pathname?.startsWith('/bridge/')) {
    return null;
  }
  if (headerType === 'none') return null;
  return headerType === 'funnel' ? <FunnelHeader /> : <Header />;
};

export default ConditionalHeader;






