'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  isFEXFunnel,
  isReverseMortgageFunnel,
  META_PIXEL_IDS,
} from '@/lib/meta-pixel-config';

/**
 * Client component to initialize Meta Pixel(s) based on current route
 *
 * This component:
 * - Always initializes the MAIN SeniorSimple pixel + fires PageView
 * - On FEX funnel paths, also initializes the FEX pixel
 * - On reverse-mortgage funnel paths, also initializes the reverse-mortgage
 *   pixel (when NEXT_PUBLIC_META_PIXEL_ID_REVERSE_MORTGAGE is set) so browser
 *   PageView + downstream Lead events land on the SAME pixel the server CAPI
 *   uses. Without this, the RM pixel only ever sees server events → Meta has
 *   no browser signal to triangulate attribution against → Ads Manager shows
 *   zero conversions despite events being received.
 *
 * When the RM env var is not yet set in Vercel, the RM init is silently
 * skipped (with a one-line warning so ops knows). PR is therefore safe to
 * deploy before the env var lands.
 */
export function MetaPixelInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    // Wait for fbq to be available (loaded from layout.tsx)
    const initPixels = () => {
      if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
        // Retry after a short delay if fbq isn't ready
        setTimeout(initPixels, 100);
        return;
      }

      // Handle null pathname
      const currentPath = pathname || '/';
      const isFEX = isFEXFunnel(currentPath);
      const isRM = isReverseMortgageFunnel(currentPath);

      console.log('📊 Meta Pixel Initialization:', {
        pathname: currentPath,
        isFEXFunnel: isFEX,
        isReverseMortgageFunnel: isRM,
        mainPixel: META_PIXEL_IDS.MAIN,
        fexPixel: META_PIXEL_IDS.FEX,
        rmPixel: META_PIXEL_IDS.REVERSE_MORTGAGE || '(unset)',
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

      // Initialize reverse-mortgage pixel if on RM funnel AND env var is set.
      // Otherwise log a one-line warning so the missing env var is obvious.
      if (isRM) {
        if (META_PIXEL_IDS.REVERSE_MORTGAGE) {
          try {
            window.fbq('init', META_PIXEL_IDS.REVERSE_MORTGAGE);
            window.fbq('track', 'PageView');
            console.log('✅ Reverse Mortgage Meta Pixel initialized:', META_PIXEL_IDS.REVERSE_MORTGAGE);
          } catch (error) {
            console.error('❌ Failed to initialize Reverse Mortgage Meta Pixel:', error);
          }
        } else {
          console.warn(
            '⚠️ On reverse-mortgage funnel but NEXT_PUBLIC_META_PIXEL_ID_REVERSE_MORTGAGE is not set — browser pixel will not fire to the RM pixel. Set this env var in Vercel to enable.'
          );
        }
      }
    };

    // Start initialization
    initPixels();
  }, [pathname]);

  return null; // This component doesn't render anything
}

