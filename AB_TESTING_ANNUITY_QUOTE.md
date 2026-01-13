# A/B Testing: Annuity Quote Headline

## Overview
The annuity quote landing page (`/annuity-quote`) now dynamically rotates between two headline variants (A and B) to test which performs better.

## Variants

### Option A
**Headline:** "Turn Your Retirement Savings Into Guaranteed Monthly Income"
**Subhead:** "Compare today's top annuity options and see how much lifetime income your savings can safely generate"
**CTA Button:** "Get My Personalized Annuity Quote"
**Tagline:** "Free • Secure • Takes 2–3 minutes"

### Option B
**Headline:** "Never Worry About Outliving Your Retirement Income"
**Subhead:** "See how an annuity can provide guaranteed monthly income for the rest of your life"
**CTA Button:** "See My Income Options"
**Tagline:** "Free • Secure • Retirement-focused"

## How It Works

1. **Variant Assignment:**
   - On first visit, users are randomly assigned to Variant A or B (50/50 split)
   - Variant is stored in `sessionStorage` as `annuity_quote_headline_variant`
   - Same variant is shown throughout the user's session for consistency

2. **Tracking:**
   - GA4 events are fired to track which variant users see and interact with
   - Events are tracked only once per session to avoid duplicate counts

## GA4 Events Tracked

### 1. `ab_test_view`
Fired when a user views the page with a specific variant.

**Event Parameters:**
- `test_name`: "annuity_quote_headline"
- `variant`: "A" or "B"
- `page_path`: "/annuity-quote"
- `event_category`: "ab_testing"

**When it fires:** Once per session when the page loads

### 2. `cta_click`
Fired when a user clicks the CTA button.

**Event Parameters:**
- `test_name`: "annuity_quote_headline"
- `variant`: "A" or "B"
- `cta_text`: Button text that was clicked
- `page_path`: "/annuity-quote"
- `event_category`: "ab_testing"

**When it fires:** Every time a user clicks the CTA button

## How to Analyze Results in GA4

### Step 1: View A/B Test Views
1. Go to GA4 → Reports → Events
2. Search for `ab_test_view`
3. Add a secondary dimension: `variant`
4. Compare views for Variant A vs Variant B

### Step 2: Calculate CTA Click-Through Rate
1. Go to GA4 → Reports → Events
2. Search for `cta_click`
3. Add a secondary dimension: `variant`
4. Calculate CTR: `cta_click events / ab_test_view events` for each variant

### Step 3: Create Custom Report
Create a custom report with:
- **Event Name:** `ab_test_view` and `cta_click`
- **Dimensions:** `variant`, `test_name`
- **Metrics:** Event count, Users, Event value

### Step 4: Track Conversion Funnel
Track how each variant performs through the funnel:
1. `ab_test_view` → Variant A/B
2. `cta_click` → Variant A/B
3. `quiz_start` → (can add variant parameter if needed)
4. `quiz_complete` → (can add variant parameter if needed)
5. `lead_form_submit` → (can add variant parameter if needed)

## Recommended Analysis

### Key Metrics to Compare:
1. **View-to-Click Rate:** `cta_click / ab_test_view`
2. **Click-to-Start Rate:** `quiz_start / cta_click`
3. **Start-to-Complete Rate:** `quiz_complete / quiz_start`
4. **Complete-to-Lead Rate:** `lead_form_submit / quiz_complete`
5. **Overall Conversion Rate:** `lead_form_submit / ab_test_view`

### Statistical Significance:
- Collect data for at least 1,000 views per variant
- Use GA4's built-in statistical significance calculator
- Look for at least 95% confidence level before declaring a winner

## Technical Implementation

**File:** `src/components/pages/AnnuityQuoteQuiz.tsx`

**Key Features:**
- Uses `sessionStorage` to maintain variant consistency
- Random 50/50 split on first visit
- GA4 events tracked via `trackGA4Event()` function
- CTA buttons scroll smoothly to quiz start

## Future Enhancements

1. **Add variant to quiz completion tracking** - Track which variant led to completed quizzes
2. **Add variant to lead submission** - Track which variant generates more leads
3. **Server-side variant assignment** - For more reliable A/B testing
4. **Weighted splits** - Adjust split ratio (e.g., 70/30) if one variant performs better
5. **Multi-variant testing** - Test more than 2 variants simultaneously


