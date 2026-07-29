'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { FunnelHeader } from './FunnelHeader';
import { useHeader } from '../../contexts/FooterContext';

const ConditionalHeader = () => {
  const { headerType } = useHeader();
  const pathname = usePathname();

  // Editorial-native advertorials render with only their own Masthead — no
  // site chrome. See shared-utils/ADVERTORIAL_SPLIT_TESTING.md.
  //
  // The `/bridge/*` funnel target was retired 2026-07-27; stale links now
  // redirect to `/lp/senior-benefits-2026` via vercel.json, so the /lp/
  // prefix guard covers post-redirect too.
  if (pathname?.startsWith('/lp/')) {
    return null;
  }
  if (headerType === 'none') return null;
  return headerType === 'funnel' ? <FunnelHeader /> : <Header />;
};

export default ConditionalHeader;






