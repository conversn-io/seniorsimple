'use client';

import Footer from './Footer';
import FunnelFooter from './FunnelFooter';
import MinimalFunnelFooter from './MinimalFunnelFooter';
import { useFooter } from '../contexts/FooterContext';

const ConditionalFooter = () => {
  const { footerType } = useFooter();
  
  if (footerType === 'minimal') {
    return <MinimalFunnelFooter />;
  }
  
  return footerType === 'funnel' ? <FunnelFooter /> : <Footer />;
};

export default ConditionalFooter;






