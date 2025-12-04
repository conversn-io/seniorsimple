# Call Booking Funnel Implementation Plan
## Retirement Rescue Quiz → Booking Call Funnel

**Date:** 2025-12-03  
**Status:** Planning Phase  
**Target Route:** `/quiz-book` (entry) → `/booking` (calendar)

---

## ⚠️ CRITICAL: Conditional Funnel Logic

**This is a NEW funnel variant, NOT a replacement for existing flows.**

### Conditional Routing Logic:
```
IF landing_page === '/quiz-book' THEN:
  Quiz → /booking (calendar) → /quiz-submitted
  
ELSE (all other landing pages):
  Quiz → /quiz-submitted (existing flow - unchanged)
```

### Key Points:
1. **Entry Point:** `/quiz-book` is the landing page that triggers booking funnel
2. **Conditional Redirect:** After quiz completion, check `landing_page` to determine redirect
3. **New Route:** `/booking` is the calendar page (only shown for booking funnel)
4. **Existing Flow:** All other quiz entry points continue to work as before

### Implementation:
- Store `landing_page` in `sessionStorage` when user lands on `/quiz-book`
- Check `landing_page` in `AnnuityQuiz.tsx` after quiz completion
- Conditionally redirect to `/booking` (new) or `/quiz-submitted` (existing)

---

## Executive Summary

Transform the Retirement Rescue Quiz funnel from a survey-only flow into a booking call funnel by adding an intermediate step (`/quiz-book`) that appears after quiz completion (OTP or no-OTP) and before the thank-you page. This page will embed a calendar booking widget and pass all captured quiz data to the calendar form.

---

## Current Flow Analysis

### Existing Quiz Flow
1. **Quiz Start:** `/quiz` or `/quiz-b` (no-OTP variant)
2. **Quiz Questions:** User answers retirement planning questions
3. **OTP Verification:** `/quiz` requires OTP, `/quiz-b` skips OTP
4. **Lead Submission:** Data sent to database + GHL webhook
5. **Redirect:** Currently goes to `/quiz-submitted` (thank-you page)

### Current Data Capture
- **Contact Info:** `firstName`, `lastName`, `email`, `phone`
- **Quiz Answers:** Age range, retirement timeline, risk tolerance, savings amount, allocation preferences
- **Location:** Zip code, state, state name
- **Calculated Results:** Lead score, recommendations
- **UTM Parameters:** Source, medium, campaign, etc.
- **Session Data:** Quiz session ID, funnel type

### Current Thank-You Page (`/quiz-submitted`)
- Shows personalized message with first name
- Displays retirement savings amount
- Shows timeline-based messaging
- Includes `ExpectCall` component (generic call expectation)

---

## Proposed New Flow

### Conditional Funnel Logic
**IMPORTANT:** This is a NEW funnel variant, NOT a replacement for existing flow.

**Condition:** Only when `landing_page === '/quiz-book'` (user starts on `/quiz-book`)

### Flow Sequence for `/quiz-book` Landing Page
1. **Landing Page:** User lands on `/quiz-book` (entry point)
2. **Quiz Start:** Quiz component loads (same quiz, different entry)
3. **Quiz Questions:** User answers questions
4. **OTP Verification:** (if `/quiz` route) or skip (if `/quiz-b` route)
5. **Lead Submission:** Data saved to database + GHL
6. **NEW: Booking Page:** `/booking` ← **NEW INTERMEDIATE STEP** (only if landing_page = '/quiz-book')
7. **Calendar Booking:** User selects meeting time
8. **Thank-You Page:** `/quiz-submitted` (updated with booking confirmation)

### Existing Flow (All Other Landing Pages)
1. **Landing Page:** User lands on `/quiz` or any other page
2. **Quiz Questions:** User answers questions
3. **OTP Verification:** (if required)
4. **Lead Submission:** Data saved to database + GHL
5. **Thank-You Page:** `/quiz-submitted` (existing flow - unchanged)

---

## Implementation Details

### 1. Create `/quiz-book` Route

**File:** `src/app/booking/page.tsx`

**Purpose:** Calendar booking page - intermediate step between quiz completion and thank-you page (only for booking funnel variant)

**Key Features:**
- Personalized header with contact's first name
- Calendar embed (Conversn.io widget)
- Pass all quiz data to calendar form
- Footer with contact info and logo

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  Header (Funnel Layout)            │
├─────────────────────────────────────┤
│  H1: Congrats {{firstName}} -     │
│      You're Qualified              │
│  H2: STEP 2: Book Your Free        │
│      Retirement Rescue Strategy Call│
│  Description text                  │
├─────────────────────────────────────┤
│  [CALENDAR EMBED IFRAME]            │
│  (Conversn.io widget)               │
├─────────────────────────────────────┤
│  Footer (Contact Info + Logo)      │
└─────────────────────────────────────┘
```

### 2. Calendar Embed Integration

**Widget Code:**
```html
<iframe 
  src="https://link.conversn.io/widget/booking/9oszv21kQ1Tx6jG4qopK" 
  style="width: 100%;border:none;overflow: hidden;" 
  scrolling="no" 
  id="v1ert32zjqqC7EBplpQ4_1764800425945">
</iframe>
<script src="https://link.conversn.io/js/form_embed.js" type="text/javascript"></script>
```

**Data Passing Requirements:**
All quiz data must be passed to the calendar form that appears after meeting time selection:
- First Name
- Last Name
- Email
- Phone
- Zip Code
- State
- Retirement Savings Amount
- Age Range
- Retirement Timeline
- Risk Tolerance
- Quiz Answers (full JSON)
- Calculated Results
- UTM Parameters

**Implementation Approach:**
- Store quiz data in `sessionStorage` (already done in `AnnuityQuiz.tsx`)
- Use JavaScript to populate calendar form fields via widget API
- Or use URL parameters if widget supports it
- Or use postMessage API if widget supports cross-frame communication

### 3. Update Quiz Completion Redirect

**File:** `src/components/quiz/AnnuityQuiz.tsx`

**Current Behavior (Line 886):**
```typescript
router.push('/quiz-submitted');
```

**New Behavior:**
```typescript
// After successful lead submission, redirect to booking page
router.push('/quiz-book');
```

**Location:** In `submitQuizToDatabase()` function, after line 884 where quiz answers are stored

### 4. Update Thank-You Page (`/quiz-submitted`)

**File:** `src/app/quiz-submitted/page.tsx`

**Changes Required:**

1. **Remove Large Blue Check Mark:**
   - Remove or hide the checkmark icon (currently at line 103-107)

2. **Update H1:**
   ```typescript
   <h1>Congratulations, {firstName} - Here are Your Next Steps</h1>
   ```

3. **Update H2:**
   ```typescript
   <h2>Thanks for booking a call! You're one step closer to achieving your retirement goals.</h2>
   ```

4. **Add Video Embed Section:**
   - Add video embed component (video URL to be provided)

5. **Add "Almost Done" Section:**
   ```
   Subheadline: **Almost Done**: Follow The Steps to Confirm Your Call
   
   ### Step 1: Press "I know the sender" button in the event email we just sent you!
   [Image: Email confirmation screenshot]
   ```

6. **Add Retirement Profile Data Display:**
   - Show quiz answers summary
   - Display retirement savings amount
   - Show calculated recommendations
   - Format as readable profile card

7. **Add Pre-Call Checklist:**
   ```
   ### Step 4: Pre-Call Checklist
   
   ☑ Communication: Check your e-mail for calendar invites. Be sure to respond to text messages sent directly by the team!
   
   ☑ Punctuality: We'll be on time for the call, make sure you are as well.
   
   ☑ Information: Come armed with whatever questions you have. We want you to be able to make an informed decision, regardless if you work with us or not.
   ```

8. **Add FAQ Section:**
   - Use existing FAQ accordion component
   - (Note: Will be replaced with videos later)

### 5. Data Flow & Storage

**Session Storage (Already Implemented):**
- `quiz_answers`: Full quiz answers object
- Available in both `/quiz-book` and `/quiz-submitted` pages

**Database Storage (Already Implemented):**
- Contact data in `contacts` table
- Lead data in `leads` table with full quiz answers
- GHL webhook sends data to GoHighLevel

**Calendar Form Data:**
- Need to extract from `sessionStorage` in `/quiz-book` page
- Pass to calendar widget via JavaScript API or URL params

---

## Technical Implementation Steps

### Step 1: Create Quiz Entry Page (`/quiz-book`)

**File:** `src/app/quiz-book/page.tsx`

**Purpose:** Entry point for booking funnel variant - renders quiz component and tracks landing page

**Key Features:**
- Renders same `Quiz` component as `/quiz` route
- Tracks landing page as `/quiz-book` in analytics
- Sets up session to identify this as booking funnel variant

### Step 2: Create Booking Page Component

**File:** `src/app/booking/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { initializeTracking, trackPageView } from '@/lib/temp-tracking'
import { useFunnelLayout } from '@/hooks/useFunnelLayout'

interface QuizAnswers {
  personalInfo?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  // ... other quiz answer fields
}

export default function QuizBookPage() {
  const router = useRouter()
  useFunnelLayout() // Sets header and footer to 'funnel'
  const [contactData, setContactData] = useState<QuizAnswers | null>(null)

  useEffect(() => {
    initializeTracking()
    trackPageView('Quiz Book', '/quiz-book')
    
    // Get quiz answers from sessionStorage
    const storedAnswers = sessionStorage.getItem('quiz_answers')
    if (storedAnswers) {
      try {
        const answers = JSON.parse(storedAnswers)
        setContactData(answers)
      } catch (error) {
        console.error('Error parsing quiz answers:', error)
      }
    } else {
      // If no quiz data, redirect back to quiz
      router.push('/quiz')
    }
  }, [router])

  const firstName = contactData?.personalInfo?.firstName || contactData?.firstName || 'there'

  // Function to pass data to calendar widget
  useEffect(() => {
    if (contactData && typeof window !== 'undefined') {
      // Wait for calendar widget to load
      const timer = setTimeout(() => {
        // Attempt to populate calendar form fields
        // This depends on Conversn.io widget API
        // May need to use postMessage or widget-specific API
        console.log('Passing data to calendar:', contactData)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [contactData])

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#36596A] mb-4">
            Congrats {firstName} - You're Qualified
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            STEP 2: Book Your Free Retirement Rescue Strategy Call
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We help you ensure your retirement is tax optimized, income producing, 
            and structured to give you peace of mind for you and your family to enjoy. 
            No stress or surprises - just strong, sound structure.
          </p>
        </div>

        {/* Calendar Embed */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="w-full" style={{ minHeight: '600px' }}>
            <iframe 
              src="https://link.conversn.io/widget/booking/9oszv21kQ1Tx6jG4qopK" 
              style={{ width: '100%', border: 'none', overflow: 'hidden' }} 
              scrolling="no" 
              id="v1ert32zjqqC7EBplpQ4_1764800425945"
              title="Book Your Retirement Rescue Strategy Call"
            />
            <script src="https://link.conversn.io/js/form_embed.js" type="text/javascript" async />
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500">
          <p>Questions? Contact us at <a href="tel:+1-XXX-XXX-XXXX" className="text-[#36596A] hover:underline">XXX-XXX-XXXX</a></p>
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Update AnnuityQuiz Redirect

**File:** `src/components/quiz/AnnuityQuiz.tsx`

**Change at line 886:**
```typescript
// OLD:
try { router.push('/quiz-submitted'); } catch {}

// NEW:
try { router.push('/quiz-book'); } catch {}
```

### Step 4: Update Thank-You Page

**File:** `src/app/quiz-submitted/page.tsx`

**Key Updates:**
1. Remove checkmark icon
2. Update H1 and H2 text
3. Add video embed section
4. Add "Almost Done" steps
5. Add retirement profile display
6. Add pre-call checklist
7. Add FAQ section

### Step 5: Calendar Data Passing

**Research Required:**
- Check Conversn.io widget documentation for data passing API
- Determine if widget supports:
  - URL parameters
  - postMessage API
  - JavaScript form population
  - Custom field mapping

**Implementation Options:**

**Option A: URL Parameters (if supported)**
```typescript
const calendarUrl = `https://link.conversn.io/widget/booking/9oszv21kQ1Tx6jG4qopK?firstName=${firstName}&lastName=${lastName}&email=${email}...`
```

**Option B: postMessage API (if supported)**
```typescript
const iframe = document.getElementById('calendar-iframe')
iframe.contentWindow.postMessage({
  type: 'populateForm',
  data: contactData
}, 'https://link.conversn.io')
```

**Option C: Widget JavaScript API (if provided)**
```typescript
// Use widget's JavaScript API if available
window.ConversnWidget?.populateForm(contactData)
```

---

## Data Requirements for Calendar Form

### Required Fields
- First Name
- Last Name
- Email
- Phone
- Zip Code
- State

### Optional Fields (Nice to Have)
- Retirement Savings Amount
- Age Range
- Retirement Timeline
- Risk Tolerance
- Full Quiz Answers (as JSON string)

---

## Routing Updates

### New Routes
- `/quiz-book` - NEW entry point for booking funnel (renders quiz)
- `/booking` - NEW calendar booking page (intermediate step)

### Modified Routes
- `/quiz` - Existing flow unchanged (redirects to `/quiz-submitted`)
- `/quiz-b` - Existing flow unchanged (redirects to `/quiz-submitted`)
- `/quiz-submitted` - Updated thank-you page (works for both flows)

### Route Flow Diagrams

**NEW Booking Funnel (when landing_page = '/quiz-book'):**
```
/quiz-book (entry point)
  ↓
[Quiz Component Loads]
  ↓
[Quiz Questions]
  ↓
[OTP Verification] (if required)
  ↓
[Lead Submission]
  ↓
/booking ← NEW (conditional redirect)
  ↓
[Calendar Booking]
  ↓
/quiz-submitted (updated)
```

**EXISTING Flow (all other landing pages):**
```
/quiz or any other entry
  ↓
[Quiz Questions]
  ↓
[OTP Verification] (if required)
  ↓
[Lead Submission]
  ↓
/quiz-submitted (existing - unchanged)
```

---

## Styling & Design

### Color Scheme
- Primary: `#36596A` (SeniorSimple teal)
- Background: `#F5F5F0` (light beige)
- Text: Gray scale for readability

### Typography
- H1: Bold, 4xl, teal color
- H2: Semibold, 2xl, gray-700
- Body: Regular, lg, gray-600

### Layout
- Max width: 4xl (896px)
- Padding: Responsive (px-4 sm:px-6 lg:px-8)
- Spacing: Consistent mb-8 between sections

---

## Testing Checklist

### Functional Tests

**Booking Funnel Variant (landing_page = '/quiz-book'):**
- [ ] User lands on `/quiz-book` → quiz loads correctly
- [ ] Landing page tracked as `/quiz-book` in analytics
- [ ] Quiz completion redirects to `/booking` (not `/quiz-submitted`)
- [ ] Contact name displays correctly in `/booking` header
- [ ] Calendar widget loads and displays on `/booking`
- [ ] Quiz data passes to calendar form
- [ ] Calendar booking redirects to `/quiz-submitted`
- [ ] Thank-you page shows updated content for booking flow

**Existing Flow (all other landing pages):**
- [ ] User lands on `/quiz` → quiz loads correctly
- [ ] Quiz completion redirects to `/quiz-submitted` (unchanged)
- [ ] Existing flow works as before

**Common Tests:**
- [ ] All quiz data displays in retirement profile
- [ ] Pre-call checklist displays correctly
- [ ] FAQ accordion works

### Data Flow Tests
- [ ] Session storage persists across pages
- [ ] Contact data available in booking page
- [ ] Calendar form pre-populates with data
- [ ] Booking confirmation triggers thank-you page
- [ ] All UTM parameters preserved

### Edge Cases
- [ ] No quiz data on `/booking` → redirect to `/quiz-book` or `/quiz`
- [ ] Missing first name → use "there" fallback
- [ ] Calendar widget fails to load → show error message
- [ ] User navigates directly to `/booking` without quiz → redirect to `/quiz`
- [ ] Landing page not set in sessionStorage → fallback to existing flow
- [ ] User starts on `/quiz-book` but navigates away → landing page should persist

---

## Deployment Plan

### Phase 1: Development
1. Create `/quiz-book` entry page (renders quiz, tracks landing page)
2. Create `/booking` calendar page component
3. Update `AnnuityQuiz.tsx` with conditional redirect logic
4. Test landing page tracking and sessionStorage
5. Test calendar embed loading
6. Test data passing to calendar

### Phase 2: Calendar Integration
1. Research Conversn.io widget API
2. Implement data passing mechanism
3. Test form pre-population
4. Verify booking flow end-to-end

### Phase 3: Thank-You Page Updates
1. Update `/quiz-submitted` page
2. Add video embed
3. Add retirement profile display
4. Add pre-call checklist
5. Add FAQ section

### Phase 4: Testing
1. Test booking funnel: `/quiz-book` → Quiz → `/booking` → Thank-You
2. Test existing flow: `/quiz` → Quiz → `/quiz-submitted` (unchanged)
3. Test conditional routing logic (landing page detection)
4. Test both `/quiz` and `/quiz-b` routes (existing flow)
5. Test with and without OTP
6. Verify all data displays correctly
7. Test mobile responsiveness
8. Verify landing page tracking in analytics

### Phase 5: Deployment
1. Deploy to preview branch
2. Test on preview URL
3. Get stakeholder approval
4. Deploy to production

---

## Open Questions & Research Needed

1. **Conversn.io Widget API:**
   - How to pass data to calendar form?
   - Does widget support pre-population?
   - What is the post-booking redirect behavior?

2. **Video Embed:**
   - What video URL should be embedded?
   - Where is the video hosted?
   - What are the video dimensions?

3. **Email Confirmation Image:**
   - Where is the "I know the sender" screenshot located?
   - What is the image path/URL?

4. **Contact Phone Number:**
   - What phone number should be displayed in footer?
   - Should it be clickable (tel: link)?

5. **Retirement Profile Display:**
   - What specific fields should be shown?
   - What format/styling for the profile card?
   - Should it be editable or read-only?

6. **FAQ Content:**
   - What are the existing FAQ questions?
   - Where is the FAQ accordion component located?
   - When will videos replace text FAQs?

---

## Success Metrics

### Conversion Metrics
- Booking rate: % of quiz completions that book a call
- Completion rate: % of bookings that complete calendar form
- Thank-you page views: Confirms booking flow completion

### User Experience Metrics
- Time to booking: Average time from quiz completion to booking
- Drop-off points: Where users exit the flow
- Mobile vs desktop conversion rates

### Technical Metrics
- Page load time for `/quiz-book`
- Calendar widget load time
- Data passing success rate
- Error rate for missing quiz data

---

## Next Steps

1. **Immediate:**
   - Research Conversn.io widget API documentation
   - Confirm calendar booking widget ID and configuration
   - Gather missing assets (video URL, email screenshot, phone number)

2. **Short-term:**
   - Create `/quiz-book` page component
   - Update quiz redirect logic
   - Implement basic calendar embed

3. **Medium-term:**
   - Implement data passing to calendar
   - Update thank-you page
   - Add retirement profile display

4. **Long-term:**
   - Replace FAQ text with videos
   - A/B test booking page variations
   - Optimize conversion funnel

---

## Related Files & Components

### Files to Create
- `src/app/quiz-book/page.tsx` - NEW (entry point for booking funnel)
- `src/app/booking/page.tsx` - NEW (calendar booking page)

### Files to Modify
- `src/components/quiz/AnnuityQuiz.tsx` - Update redirect
- `src/app/quiz-submitted/page.tsx` - Update content

### Components to Use
- `useFunnelLayout` hook - For header/footer
- `ExpectCall` component - May need updates
- FAQ accordion component - To be located

### Utilities
- `@/lib/temp-tracking` - Analytics tracking
- `sessionStorage` - Data persistence
- Quiz answer interfaces - Type definitions

---

**Document Status:** Ready for Implementation  
**Last Updated:** 2025-12-03  
**Next Review:** After Conversn.io API research

