'use client';

import { useEffect } from 'react';
import { useFooter, useHeader } from '../contexts/FooterContext';

/**
 * useMinimalFunnelLayout - Hook for lead generation funnels
 * 
 * Sets footer to 'minimal' (limited footer with only required lead gen/disclosure content)
 * and header to 'funnel' for conversion-focused pages.
 * 
 * Used on:
 * - Reverse mortgage calculator
 * - Annuity quiz
 * - Final expense quiz
 * - RMD quiz
 * 
 * These pages need minimal distraction while maintaining required legal/compliance content.
 */
export const useMinimalFunnelLayout = () => {
  const { setFooterType } = useFooter();
  const { setHeaderType } = useHeader();

  useEffect(() => {
    setFooterType('minimal');
    setHeaderType('funnel');
    return () => {
      setFooterType('standard');
      setHeaderType('standard');
    };
  }, [setFooterType, setHeaderType]);
};
