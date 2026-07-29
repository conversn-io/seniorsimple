'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isFEXFunnel, META_PIXEL_IDS } from '@/lib/meta-pixel-config';

/**
 * Client component to initialize Meta Pixel(s) based on current route
 * 
 * This component:
 * - Detects if we're on a FEX funnel page
 * - Initializes the appropriate pixel(s)
 * - Ensures both pixels can be tracked if needed for attribution
 */
export function MetaPixelInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    // Wait for fbq to be available (loaded from layout.tsx). We cap retries so
    // ad-blocker / corporate-proxy visitors (very common for the 55+ audience)
    // don't get stuck in an unbounded setTimeout loop that keeps the main
    // thread + microtask queue busy forever — that loop was preventing
    // `document_idle` from firing on the FPP letter and hurting INP.
    let attempts = 0;
    const MAX_ATTEMPTS = 30;   // ~3s total ceiling — enough for slow connections
    const RETRY_MS = 100;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const initPixels = () => {
      if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
        if (attempts++ >= MAX_ATTEMPTS) {
          console.warn('📊 Meta Pixel: fbq never became available (likely blocked); giving up');
          return;
        }
        timeoutId = setTimeout(initPixels, RETRY_MS);
        return;
      }

      // Handle null pathname
      const currentPath = pathname || '/';
      const isFEX = isFEXFunnel(currentPath);
      
      console.log('📊 Meta Pixel Initialization:', {
        pathname: currentPath,
        isFEXFunnel: isFEX,
        mainPixel: META_PIXEL_IDS.MAIN,
        fexPixel: META_PIXEL_IDS.FEX,
      });

      // Bot detection
      const isBot = typeof navigator !== 'undefined' && 
        /bot|crawler|spider|crawling|facebookexternalhit|Googlebot|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebot|ia_archiver/i.test(navigator.userAgent || '');

      if (isBot) {
        console.log('🤖 Bot detected - skipping pixel tracking');
        return;
      }

      // Always initialize main SeniorSimple pixel
      try {
        window.fbq('init', META_PIXEL_IDS.MAIN);
        window.fbq('track', 'PageView');
        console.log('✅ Main Meta Pixel initialized:', META_PIXEL_IDS.MAIN);
      } catch (error) {
        console.error('❌ Failed to initialize main Meta Pixel:', error);
      }

      // Initialize FEX pixel if on FEX funnel
      if (isFEX) {
        try {
          window.fbq('init', META_PIXEL_IDS.FEX);
          window.fbq('track', 'PageView');
          console.log('✅ FEX Meta Pixel initialized:', META_PIXEL_IDS.FEX);
        } catch (error) {
          console.error('❌ Failed to initialize FEX Meta Pixel:', error);
        }
      }
    };

    // Start initialization
    initPixels();

    return () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}

