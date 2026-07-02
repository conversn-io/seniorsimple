'use client';

import { useEffect } from 'react';
import { useFooter, useHeader } from '../contexts/FooterContext';

export const useFunnelLayout = () => {
  const { setFooterType } = useFooter();
  const { setHeaderType } = useHeader();

  useEffect(() => {
    setFooterType('funnel');
    setHeaderType('funnel');
    return () => {
      setFooterType('standard');
      setHeaderType('standard');
    };
  }, [setFooterType, setHeaderType]);
};

// For pages that ship their own nav + footer (e.g. self-contained landing pages
// imported from Claude Design) and need the global chrome suppressed entirely.
export const useStandaloneLayout = () => {
  const { setFooterType } = useFooter();
  const { setHeaderType } = useHeader();

  useEffect(() => {
    setFooterType('none');
    setHeaderType('none');
    return () => {
      setFooterType('standard');
      setHeaderType('standard');
    };
  }, [setFooterType, setHeaderType]);
};

// Keep the old hook for backward compatibility
export const useFunnelFooter = () => {
  const { setFooterType } = useFooter();

  useEffect(() => {
    setFooterType('funnel');
    return () => setFooterType('standard');
  }, [setFooterType]);
};
