# Next Steps: Medicare Calculator Optimization

## ✅ Completed Steps

1. ✅ Created call CTA components (InterstitialCTABanner, ScrollRevealedCallButton)
2. ✅ Created useScrollPosition hook
3. ✅ Enhanced Medicare calculator with lead generation form
4. ✅ Integrated calculator and CTAs into article pages
5. ✅ Created API route for lead submission
6. ✅ Updated QR code library to use `qrcode` (React 19 compatible)

## 🔧 Immediate Next Steps

### 1. Install Dependencies

```bash
cd "02-Expansion-Operations-Planning/02-Publisher-Platforms/02-SeniorSimple-Platform/03-SeniorSimple 2"
npm install qrcode --legacy-peer-deps
```

**Note**: Using `--legacy-peer-deps` because `qrcode` doesn't officially support React 19 yet, but it works fine.

### 2. Configure Environment Variables

Add to your `.env.local` file:

```bash
# Default phone number (fallback if article/domain doesn't have one)
NEXT_PUBLIC_DEFAULT_PHONE_NUMBER=+1XXXXXXXXXX

# GHL Webhook URL (shared across all SeniorSimple funnels)
NEXT_PUBLIC_GHL_WEBHOOK_SENIORSIMPLE=https://services.leadconnectorhq.com/hooks/...
```

### 3. Verify Database Schema

Ensure your Supabase database has:

**Articles Table:**
- `phone_number` column (text, nullable)
- `domain_id` column (uuid, foreign key to domains table)

**Domains Table:**
- `phone_number` column (text, nullable)

**If columns don't exist**, run these SQL migrations:

```sql
-- Add phone_number to articles table
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add phone_number to domains table (if domains table exists)
ALTER TABLE domains 
ADD COLUMN IF NOT EXISTS phone_number TEXT;
```

### 4. Test the Implementation

#### Test Call CTAs:
1. Visit any article page: `/articles/[slug]`
2. Scroll down to 30% - should see sticky bottom call button
3. Scroll to 50% - should see interstitial CTA banner
4. Click call buttons - should trigger phone call (mobile) or QR code (desktop)

#### Test Medicare Calculator:
1. Visit a Medicare-related article (title/category/tags contain "medicare")
2. Scroll past content - should see Medicare calculator
3. Fill out calculator inputs
4. Click "Calculate Medicare Costs"
5. Should see results and lead form below
6. Fill out lead form and submit
7. Should redirect to thank you page

#### Test API Route:
```bash
curl -X POST http://localhost:3000/api/leads/medicare-calculator \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+15551234567",
    "zipCode": "12345",
    "preferredContact": "phone",
    "calculatorResults": {
      "totalAnnualCost": 5000
    }
  }'
```

## 🚀 Publishare Integration for AEO/SEO Optimization

### Step 1: Generate AEO-Optimized Medicare Articles

Use the Publishare `agentic-content-gen` edge function to create/optimize Medicare articles:

```typescript
// Example: Generate AEO-optimized Medicare article
const response = await fetch('https://your-supabase-url.supabase.co/functions/v1/agentic-content-gen', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    topic: 'Medicare Cost Calculator: How to Estimate Your Annual Costs',
    site_id: 'seniorsimple',
    aeo_optimized: true,
    aeo_content_type: 'how-to',
    answer_first: true,
    generate_schema: true,
    convert_to_html: true,
    generate_image: true,
    generate_links: true,
    content_length: 2000,
    target_audience: 'Seniors aged 65+ considering Medicare enrollment',
    tone: 'helpful and informative'
  })
});
```

### Step 2: Optimize Existing Medicare Articles

For existing articles, use the `article-metadata-enhancer` edge function:

```typescript
const response = await fetch('https://your-supabase-url.supabase.co/functions/v1/article-metadata-enhancer', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    article_id: 'your-article-id',
    generateImages: true,
    processAEOOnly: false,
    updateExisting: true
  })
});
```

### Step 3: AEO Content Best Practices

When creating Medicare articles via Publishare, ensure:

1. **Answer First**: Answer the main question in the first paragraph
2. **Structured Data**: Include FAQ schema, HowTo schema, or Article schema
3. **Data Points**: Include specific numbers, dates, and facts
4. **Citations**: Link to authoritative sources (CMS.gov, Medicare.gov)
5. **Calculator Integration**: Reference the embedded calculator
6. **Call-to-Action**: Natural integration of call CTAs

### Step 4: Monitor AEO Performance

Track these metrics:
- Featured snippet appearances
- "People also ask" appearances
- Voice search queries
- Calculator engagement rate
- Call CTA click-through rate
- Lead conversion rate

## 📊 Analytics Setup

### Google Analytics 4 Events

The following events are automatically tracked:

- `interstitial_cta_shown` - When interstitial banner appears
- `interstitial_cta_clicked` - When user clicks interstitial banner
- `call_button_revealed` - When scroll button appears
- `call_button_clicked` - When user clicks scroll button
- `qr_code_scanned` - When QR code is scanned (desktop)
- `medicare_calculator_lead_submitted` - When lead form is submitted

### Verify Analytics

Check your GA4 dashboard for these events under:
**Events > Real-time > Event count by Event name**

## 🐛 Troubleshooting

### Call CTAs Not Appearing

1. Check phone number resolution:
   - Article has `phone_number`?
   - Domain has `phone_number`?
   - `NEXT_PUBLIC_DEFAULT_PHONE_NUMBER` set?
2. Check browser console for errors
3. Verify scroll detection is working (check `useScrollPosition` hook)

### Medicare Calculator Not Showing

1. Verify article detection logic:
   - Check if title contains "medicare"
   - Check if category contains "medicare"
   - Check if tags contain "medicare"
   - Check if slug contains "medicare"
2. Check browser console for component errors

### Lead Form Submission Failing

1. Check API route logs: `/api/leads/medicare-calculator`
2. Verify database connection
3. Check GHL webhook URL is correct
4. Verify contact/lead creation in database

### QR Code Not Generating

1. Verify `qrcode` package is installed
2. Check browser console for errors
3. Ensure `tel:` link is properly formatted

## 📝 Content Strategy Recommendations

### Medicare Article Topics to Create/Optimize

1. **"How Much Does Medicare Cost Per Month?"**
   - Answer-first format
   - Include calculator
   - Cost breakdown by part

2. **"Medicare Part B Costs 2024"**
   - Current year data
   - IRMAA brackets
   - Calculator integration

3. **"Medicare Advantage vs Original Medicare"**
   - Comparison format
   - Cost calculator
   - Pros/cons table

4. **"When Can I Enroll in Medicare?"**
   - Enrollment periods
   - Calculator for eligibility
   - Important dates

5. **"Medicare Supplement Insurance Costs"**
   - Medigap pricing
   - Calculator integration
   - Plan comparison

### SEO Optimization Checklist

- [ ] Each article answers a specific Medicare question
- [ ] Calculator embedded in relevant articles
- [ ] Call CTAs strategically placed
- [ ] Structured data (JSON-LD) included
- [ ] Internal linking to related articles
- [ ] External links to authoritative sources
- [ ] Mobile-responsive design
- [ ] Fast page load times
- [ ] Accessible (WCAG AA compliant)

## 🎯 Success Metrics

Track these KPIs:

1. **Traffic Metrics**
   - Organic search traffic to Medicare articles
   - Featured snippet appearances
   - Average session duration

2. **Engagement Metrics**
   - Calculator completion rate
   - Scroll depth (30%, 50%)
   - Call CTA click-through rate

3. **Conversion Metrics**
   - Lead form submissions
   - Call conversions
   - Cost per lead

4. **AEO Metrics**
   - Answer-first validation score
   - Structured data coverage
   - Featured snippet rate

## 📚 Additional Resources

- [Publishare AEO Documentation](../../01-Products-Services/02-Software-Platforms/publishare/docs/AEO_EDGE_FUNCTIONS_DEEP_DIVE.md)
- [HomeSimple Call CTA Implementation](../../07-HomeSimple/03-HomeSimple/CLICK_TO_CALL_TEMPLATE_PLAN.md)
- [Medicare Calculator Component](../03-SeniorSimple 2/src/components/calculators/MedicareCostCalculator.tsx)

## ✅ Final Checklist Before Launch

- [ ] Dependencies installed (`qrcode`)
- [ ] Environment variables configured
- [ ] Database schema updated (phone_number columns)
- [ ] Call CTAs tested on article pages
- [ ] Medicare calculator tested
- [ ] Lead form submission tested
- [ ] API route tested
- [ ] GHL webhook tested
- [ ] Analytics events verified
- [ ] Mobile responsiveness tested
- [ ] QR code generation tested (desktop)
- [ ] Click-to-call tested (mobile)
- [ ] Publishare integration configured
- [ ] AEO optimization applied to articles

---

**Ready to launch!** 🚀

Once all items are checked, your Medicare calculator optimization is complete and ready for production.

