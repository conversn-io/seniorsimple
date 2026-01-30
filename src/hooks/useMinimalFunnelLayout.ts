'use client';

import { useEffect } from 'react';
import { useFooter, useHeader } from '../contexts/FooterContext';

interface MinimalFunnelLayoutOptions {
  /** Footer variant: 'insurance' (default) or 'mortgage' for appropriate disclaimers */
  variant?: 'insurance' | 'mortgage';
}

/**
 * useMinimalFunnelLayout - Hook for lead generation funnels
 * 
 * Sets footer to 'minimal' (limited footer with only required lead gen/disclosure content)
 * and header to 'funnel' for conversion-focused pages.
 * 
 * Used on:
 * - Reverse mortgage calculator (variant: 'mortgage')
 * - Annuity quiz (variant: 'insurance')
 * - Final expense quiz (variant: 'insurance')
 * - RMD quiz (variant: 'insurance')
 * 
 * These pages need minimal distraction while maintaining required legal/compliance content.
 * 
 * @param options.variant - 'insurance' (default) or 'mortgage' for appropriate disclaimers
 */
export const useMinimalFunnelLayout = (options: MinimalFunnelLayoutOptions = {}) => {
  const { variant = 'insurance' } = options;
  const { setFooterType, setFooterVariant } = useFooter();
  const { setHeaderType } = useHeader();

  useEffect(() => {
    setFooterType('minimal');
    setFooterVariant(variant);
    setHeaderType('funnel');
    return () => {
      setFooterType('standard');
      setFooterVariant('insurance');
      setHeaderType('standard');
    };
  }, [setFooterType, setFooterVariant, setHeaderType, variant]);
};
