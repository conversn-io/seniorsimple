# Medicare Calculator Optimization Summary

## Overview

This document summarizes the implementation of Medicare calculator optimization for SeniorSimple article pages, including call CTAs, lead generation, and integration with Publishare for AEO/SEO optimization.

## ✅ What Was Implemented

### 1. Call CTA Components (Similar to HomeSimple)

#### **InterstitialCTABanner** (`src/components/articles/InterstitialCTABanner.tsx`)
- Full-width banner that appears at 50% scroll depth
- Service-specific messaging for Medicare articles
- Dismissible with localStorage persistence
- Mobile-optimized touch targets (min 64px height)
- Analytics tracking on impression and click
- Uses SeniorSimple brand colors (`#36596A`)

#### **ScrollRevealedCallButton** (`src/components/articles/ScrollRevealedCallButton.tsx`)
- Sticky bottom button that appears after 30% scroll
- Desktop: Shows QR code modal for easy scanning
- Mobile: Direct click-to-call button
- Smooth slide-up animation
- Analytics tracking on reveal and click

#### **useScrollPosition Hook** (`src/hooks/useScrollPosition.ts`)
- Custom hook for scroll position tracking
- Supports threshold-based triggers
- Optimized with requestAnimationFrame throttling

### 2. Medicare Calculator Integration

#### **MedicareCostCalculator** (Enhanced)
- Existing calculator component enhanced with lead generation
- Now includes `MedicareLeadForm` component after results are shown
- Calculator results are passed to the lead form for personalized messaging

#### **MedicareLeadForm** (`src/components/calculators/MedicareLeadForm.tsx`)
- Contact form that appears after calculator results
- Collects: firstName, lastName, email, phone, zipCode, preferredContact
- Displays estimated annual cost from calculator results
- Routes to thank you page after successful submission
- Includes analytics tracking

### 3. Article Page Updates

#### **Article Page** (`src/app/articles/[slug]/page.tsx`)
- Added phone number resolution logic (article → domain → default)
- Integrated `InterstitialCTABanner` component (appears mid-content)
- Integrated `ScrollRevealedCallButton` component (sticky bottom)
- Automatic Medicare calculator integration for Medicare-related articles
- Detection logic checks title, category, tags, and slug for "medicare"

#### **Article Library** (`src/lib/articles.ts`)
- Updated `getArticle` function to fetch phone numbers
- Added `phone_number` field to article interface
- Added `domain` relationship to fetch domain-level phone numbers

### 4. API Route for Lead Submission

#### **Medicare Calculator Lead API** (`src/app/api/leads/medicare-calculator/route.ts`)
- Handles lead submission from Medicare calculator form
- Upserts contacts and leads in CallReady database
- Sends webhook to GoHighLevel (GHL)
- Includes UTM parameter tracking
- No OTP required (verified by default)

## 📋 Dependencies Added

- `qrcode`: ^1.5.3 (for QR code generation on desktop - React 19 compatible)

## 🔧 Configuration Required

### Environment Variables

Add to `.env.local`:

```bash
# Default phone number (fallback if article/domain doesn't have one)
NEXT_PUBLIC_DEFAULT_PHONE_NUMBER=+1XXXXXXXXXX

# Medicare GHL Webhook URL (optional, falls back to annuity webhook)
medicare_GHL_webhook=https://services.leadconnectorhq.com/hooks/...
```

### Database Schema

Ensure your `articles` table has:
- `phone_number` column (optional, nullable)
- Relationship to `domains` table via `domain_id`
- `domains` table should have `phone_number` column

## 🎯 How It Works

### For Medicare Article Pages:

1. **Page Load**: Article page loads with phone number resolved
2. **Content Display**: Article content displays normally
3. **Scroll Detection**: 
   - At 30% scroll: `ScrollRevealedCallButton` appears (sticky bottom)
   - At 50% scroll: `InterstitialCTABanner` appears (mid-content)
4. **Calculator Display**: If article is Medicare-related, calculator appears after content
5. **Lead Generation**: After user completes calculator, lead form appears
6. **Form Submission**: Form submits to `/api/leads/medicare-calculator`
7. **Lead Processing**: 
   - Contact created/updated in database
   - Lead created with calculator results
   - Webhook sent to GHL
   - User redirected to thank you page

### Phone Number Resolution Priority:

1. `article.phone_number` (from CMS)
2. `article.domain.phone_number` (from domain settings)
3. `process.env.NEXT_PUBLIC_DEFAULT_PHONE_NUMBER` (fallback)
4. If none, CTAs won't render

### Medicare Article Detection:

An article is considered "Medicare-related" if:
- Title contains "medicare" (case-insensitive)
- Category name contains "medicare"
- Tags include "medicare"
- Slug contains "medicare"

## 📊 Analytics Events Tracked

- `interstitial_cta_shown` - When interstitial banner appears
- `interstitial_cta_clicked` - When user clicks interstitial banner
- `call_button_revealed` - When scroll button appears
- `call_button_clicked` - When user clicks scroll button
- `qr_code_scanned` - When QR code is scanned (desktop)
- `medicare_calculator_lead_submitted` - When lead form is submitted

## 🚀 Next Steps for Publishare Integration

### AEO/SEO Optimization

The article pages are already set up for Publishare AEO optimization:

1. **Structured Data**: Article pages include JSON-LD structured data
2. **AEO Content**: Use Publishare edge functions to generate AEO-optimized content
3. **DeepSeek Integration**: Publishare uses DeepSeek for content generation
4. **Content Enhancement**: Use `agentic-content-gen` edge function with AEO parameters

### Recommended Publishare Workflow:

```typescript
// Call Publishare edge function to generate/optimize Medicare articles
const response = await fetch('https://your-supabase-url/functions/v1/agentic-content-gen', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    topic: 'Medicare Cost Calculator Guide',
    site_id: 'seniorsimple',
    aeo_optimized: true,
    aeo_content_type: 'how-to',
    generate_schema: true,
    answer_first: true,
    convert_to_html: true,
    // ... other options
  })
});
```

### Content Optimization Checklist:

- [ ] Generate AEO-optimized Medicare articles via Publishare
- [ ] Ensure articles answer questions first (answer-first format)
- [ ] Include structured data (JSON-LD) for rich snippets
- [ ] Optimize for featured snippets (FAQs, lists, tables)
- [ ] Add calculator schema markup
- [ ] Include local SEO elements (if applicable)

## 🧪 Testing Checklist

- [ ] Test call CTAs appear on article pages
- [ ] Test phone number resolution (article → domain → default)
- [ ] Test Medicare calculator appears on Medicare articles
- [ ] Test lead form submission
- [ ] Test API route creates contacts/leads correctly
- [ ] Test GHL webhook receives data
- [ ] Test analytics events fire correctly
- [ ] Test mobile responsiveness
- [ ] Test QR code modal on desktop
- [ ] Test click-to-call on mobile

## 📝 Notes

- The Medicare calculator already existed; it was enhanced with lead generation
- Call CTA components are based on HomeSimple pattern but styled for SeniorSimple
- Phone number resolution follows the same pattern as HomeSimple
- Lead submission API follows the same pattern as other SeniorSimple lead APIs
- No OTP verification required for calculator leads (simpler flow)

## 🔗 Related Files

- `src/components/articles/InterstitialCTABanner.tsx`
- `src/components/articles/ScrollRevealedCallButton.tsx`
- `src/components/calculators/MedicareCostCalculator.tsx`
- `src/components/calculators/MedicareLeadForm.tsx`
- `src/app/articles/[slug]/page.tsx`
- `src/app/api/leads/medicare-calculator/route.ts`
- `src/lib/articles.ts`
- `src/hooks/useScrollPosition.ts`

