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
  }, [pathname]);

  return null; // This component doesn't render anything
}

