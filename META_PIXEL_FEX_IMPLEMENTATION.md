# Meta Pixel FEX Implementation

## Overview
This document outlines the implementation of the SeniorSimple-FEX Meta Pixel (`1963989871164856`) for tracking Final Expense funnel traffic.

## Architecture

### Dual Pixel Strategy
- **Main SeniorSimple Pixel**: `24221789587508633` (always active)
- **FEX Pixel**: `1963989871164856` (active on FEX funnel pages only)

### Implementation Approach

1. **Script Loading** (`layout.tsx`)
   - Meta Pixel script (`fbevents.js`) is loaded once globally
   - No pixel initialization happens in the script loader
   - Both noscript fallbacks are included for SEO/bot tracking

2. **Route-Based Initialization** (`MetaPixelInitializer.tsx`)
   - Client component that detects current route using `usePathname()`
   - Initializes appropriate pixel(s) based on route:
     - **FEX Funnel Pages**: Both main + FEX pixels
     - **Other Pages**: Main pixel only
   - Includes bot detection to prevent false tracking

3. **FEX Funnel Detection** (`meta-pixel-config.ts`)
   - Utility functions to identify FEX funnel pages
   - Centralized configuration for pixel IDs
   - Easy to extend for future funnels

## FEX Funnel Pages

The following pages trigger FEX pixel initialization:
- `/free-burial-life-insurance-guide`
- `/final-expense-quote` (and subpaths)
- `/insurance-guide-confirmation`
- `/custom-quote-confirmation`
- `/appointmentconfirmation`
- `/new-burial-life-insurance-quote`
- `/appointment-follow-up`
- `/burial-insurance-guide`

## Event Tracking

### How It Works
When multiple pixels are initialized, Meta Pixel's `fbq('track', ...)` API automatically sends events to **all initialized pixels**. This means:

- **On FEX pages**: Events are tracked to both main and FEX pixels
- **On other pages**: Events are tracked only to main pixel

### Tracking Functions

#### Standard Tracking
```typescript
import { trackMetaPixelEvent } from '@/lib/temp-tracking';

// Track with funnel context
trackMetaPixelEvent('Lead', {
  content_name: 'Final Expense Quote',
  value: 0,
  currency: 'USD'
}, 'final-expense-quote');
```

#### Automatic Tracking
All existing tracking calls using `fbq('track', ...)` will automatically work with both pixels when on FEX pages.

## Benefits

1. **Attribution**: FEX traffic is tracked to the dedicated FEX pixel
2. **Cross-Tracking**: Main pixel also receives FEX events for overall analytics
3. **Flexibility**: Easy to add more pixels or funnels in the future
4. **Performance**: Single script load, conditional initialization
5. **Bot Protection**: Prevents false tracking from crawlers

## Testing

### Verify Pixel Initialization
1. Open browser console on FEX funnel page
2. Look for logs:
   ```
   📊 Meta Pixel Initialization: {
     pathname: '/free-burial-life-insurance-guide',
     isFEXFunnel: true,
     mainPixel: '24221789587508633',
     fexPixel: '1963989871164856'
   }
   ✅ Main Meta Pixel initialized: 24221789587508633
   ✅ FEX Meta Pixel initialized: 1963989871164856
   ```

### Verify Event Tracking
1. Use Facebook Pixel Helper browser extension
2. Navigate through FEX funnel
3. Verify events appear in both pixels (on FEX pages)

### Verify Non-FEX Pages
1. Navigate to `/annuity-quote` or other non-FEX pages
2. Check console - should only see main pixel initialization
3. Verify events only go to main pixel

## Environment Variables

No new environment variables needed. Pixel IDs are hardcoded in `meta-pixel-config.ts` for reliability.

## Future Enhancements

1. **UTM-Based Pixel Selection**: Could initialize pixels based on UTM parameters
2. **Pixel Priority**: Could track to specific pixel only (requires custom implementation)
3. **Event Filtering**: Could filter which events go to which pixel
4. **Analytics Dashboard**: Track pixel performance separately

## Files Modified

1. `src/app/layout.tsx` - Updated script loader, added MetaPixelInitializer
2. `src/components/tracking/MetaPixelInitializer.tsx` - New client component
3. `src/lib/meta-pixel-config.ts` - New configuration utility
4. `src/lib/temp-tracking.ts` - Added `trackMetaPixelEvent` helper

## Notes

- Meta Pixel API doesn't support tracking to a specific pixel ID after initialization
- All initialized pixels receive all events
- This is by design and allows for cross-attribution
- If pixel-specific tracking is needed, would require separate script loads (not recommended)

