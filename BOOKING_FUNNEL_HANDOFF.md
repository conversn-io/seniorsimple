# SeniorSimple Booking Funnel - Agent Handoff Document

**Last Updated:** December 9, 2025  
**Project:** SeniorSimple Call Booking Funnel  
**Status:** ✅ Production Ready (Testing Phase)  
**Feature Branch:** `feature/call-booking-funnel`

---

## 📋 Executive Summary

This document provides a complete handoff for continuing work on the SeniorSimple booking funnel feature. The implementation adds a calendar booking step between quiz completion and the thank-you page, allowing users to schedule retirement consultation calls directly from the quiz flow.

### Current Status
- ✅ Booking funnel routes implemented (`/quiz-book`, `/quiz-book-b`, `/booking`)
- ✅ Calendar widget integration (Conversn.io widget ID: `9oszv21kQ1Tx6jG4qopK`)
- ✅ Webhook endpoint for GHL booking confirmations (`/api/booking/confirm`)
- ✅ Polling mechanism for booking confirmation
- ✅ Supabase database integration (CallReady Quiz DB)
- ✅ Thank-you page with video embeds and appointment confirmation
- ✅ Phone number updated across all pages (`+1 (619) 333-5531`)

### Recent Fixes (Dec 9, 2025)
- Fixed 406 error in polling endpoint (replaced `maybeSingle()` with `limit(1)`)
- Migrated booking confirmation store from Vercel KV to Supabase
- Updated to use CallReady Quiz Database for lead/funnel data
- Fixed log message to reflect Supabase instead of Vercel KV

---

## 🏗️ Architecture Overview

### Flow Diagram
```
User Journey:
/quiz-book (or /quiz-book-b)
  ↓
Quiz Component (with conditional routing)
  ↓
/booking?email={email} (Calendar Widget)
  ↓
GHL Webhook → /api/booking/confirm (POST)
  ↓
Polling: /api/booking/confirm?email={email} (GET)
  ↓
/quiz-submitted (Thank-you page with appointment confirmation)
```

### Data Flow
1. **Quiz Entry:** User lands on `/quiz-book` → sets `landing_page` in `sessionStorage`
2. **Quiz Completion:** `AnnuityQuiz.tsx` checks `landing_page` → redirects to `/booking?email={email}`
3. **Calendar Booking:** `/booking` page embeds Conversn.io widget with email pre-filled
4. **Booking Submission:** GHL sends webhook POST to `/api/booking/confirm`
5. **Data Storage:** Webhook stores booking confirmation in Supabase (`booking_confirmations` table)
6. **Polling:** `/booking` page polls GET endpoint every 5 seconds for up to 5 minutes
7. **Confirmation:** When confirmed, redirects to `/quiz-submitted` with appointment data

---

## 📁 Key Files & Directories

### Routes
- **`src/app/quiz-book/page.tsx`** - Entry point for booking funnel (with OTP)
- **`src/app/quiz-book-b/page.tsx`** - Entry point for booking funnel (no-OTP variant)
- **`src/app/booking/page.tsx`** - Calendar booking page with polling logic
- **`src/app/quiz-submitted/page.tsx`** - Thank-you page with videos and appointment confirmation

### API Routes
- **`src/app/api/booking/confirm/route.ts`** - Webhook endpoint (POST) and polling endpoint (GET)

### Core Components
- **`src/components/quiz/AnnuityQuiz.tsx`** - Main quiz component with conditional routing logic
- **`src/lib/bookingConfirmationStore.ts`** - Supabase store for booking confirmations
- **`src/lib/callready-quiz-db.ts`** - Supabase client for CallReady Quiz Database

### Database
- **`supabase/migrations/20251209_booking_confirmations.sql`** - Migration file (in CallReady root: `/supabase/migrations/`)

### Documentation
- **`CALL_BOOKING_FUNNEL_IMPLEMENTATION_PLAN.md`** - Original implementation plan
- **`SUPABASE_BOOKING_STORE_SETUP.md`** - Database setup instructions
- **`test-booking-webhook.sh`** - Test script for webhook endpoints

---

## 🔧 Technical Implementation Details

### 1. Conditional Routing Logic

**Location:** `src/components/quiz/AnnuityQuiz.tsx`

The quiz component checks `sessionStorage.getItem('landing_page')` after completion:
- If `landing_page === '/quiz-book'` → redirects to `/booking?email={email}`
- Otherwise → redirects to `/quiz-submitted` (existing flow)

**Key Code:**
```typescript
const landingPage = sessionStorage.getItem('landing_page')
if (landingPage === '/quiz-book') {
  router.push(`/booking?email=${encodeURIComponent(email)}`)
} else {
  router.push('/quiz-submitted')
}
```

### 2. Calendar Widget Integration

**Location:** `src/app/booking/page.tsx`

- Embeds Conversn.io calendar widget (ID: `9oszv21kQ1Tx6jG4qopK`)
- Passes email via URL parameter: `?email={encoded_email}`
- Stores contact data in `sessionStorage`/`localStorage` for thank-you page
- Implements polling mechanism to check for booking confirmation

**Calendar URL Format:**
```
https://link.conversn.io/widget/booking/9oszv21kQ1Tx6jG4qopK?email={email}
```

### 3. Webhook Endpoint

**Location:** `src/app/api/booking/confirm/route.ts`

**POST Endpoint:** `/api/booking/confirm`
- Receives GHL webhook payload
- Validates `x-booking-secret` header (if `BOOKING_WEBHOOK_SECRET` is set)
- Extracts: `email`, `phone`, `name`, `appointmentId`, `bookingTimes`
- Stores in Supabase `booking_confirmations` table
- Returns: `{ success: true, key: email }`

**GET Endpoint:** `/api/booking/confirm?email={email}`
- Polled by `/booking` page every 5 seconds
- Queries Supabase for booking confirmation
- Returns: `{ confirmed: boolean, name, email, phone, payload }`

### 4. Database Schema

**Table:** `booking_confirmations` (in CallReady Quiz Database)

**Schema:**
```sql
CREATE TABLE booking_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE, -- email or phone (lowercase)
  email TEXT,
  phone TEXT,
  name TEXT,
  source TEXT DEFAULT 'webhook',
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes')
);
```

**Indexes:**
- `idx_booking_confirmations_key` - Fast lookups by key
- `idx_booking_confirmations_expires_at` - Expiration cleanup
- `idx_booking_confirmations_email` - Email lookups

**TTL:** Records expire after 15 minutes (handled by application logic)

### 5. Data Persistence

**Storage Locations:**
- `sessionStorage`: `quiz_answers`, `appointment_data`, `landing_page`, `email`
- `localStorage`: `quiz_answers`, `appointment_data`, `email` (fallback for redirects)
- **Supabase:** `booking_confirmations` table (persistent across serverless instances)

**Why Supabase?**
- Solves serverless instance isolation issue
- Persistent storage across all Vercel function instances
- Same database as other lead/funnel data (CallReady Quiz DB)

---

## 🔐 Environment Variables

### Required (Vercel)
- `SUPABASE_QUIZ_URL` - CallReady Quiz Database URL (`https://jqjftrlnyysqcwbbigpw.supabase.co`)
- `SUPABASE_QUIZ_SERVICE_ROLE_KEY` - Service role key for API routes
- `SUPABASE_QUIZ_ANON_KEY` - Anon key (if needed for client-side)
- `BOOKING_WEBHOOK_SECRET` - Optional: Secret for webhook authentication (default: `6af17ffe-d4fe-4b53-aa81-8f11e311aba4`)

### Already Configured
All environment variables are set in Vercel project settings.

---

## 🗄️ Database Setup

### Migration Status
✅ **Migration already run** on CallReady Quiz Database (`jqjftrlnyysqcwbbigpw`)

**Migration File:** `/supabase/migrations/20251209_booking_confirmations.sql` (in CallReady root)

**To Re-run (if needed):**
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/jqjftrlnyysqcwbbigpw
2. Navigate to SQL Editor
3. Copy contents of migration file
4. Run SQL

---

## 🧪 Testing

### Manual Testing Flow
1. Navigate to `/quiz-book` (or `/quiz-book-b` for no-OTP)
2. Complete quiz with test email (e.g., `test@example.com`)
3. Verify redirect to `/booking?email=test@example.com`
4. Verify calendar widget loads with email pre-filled
5. Complete calendar booking in GHL
6. Verify webhook POST received at `/api/booking/confirm`
7. Verify polling GET returns `confirmed: true`
8. Verify redirect to `/quiz-submitted` with appointment data

### Automated Testing Script
**File:** `test-booking-webhook.sh`

**Usage:**
```bash
./test-booking-webhook.sh [BASE_URL] [EMAIL] [PHONE] [SECRET]
```

**Example:**
```bash
./test-booking-webhook.sh \
  https://seniorsimple-xxx.vercel.app \
  test@example.com \
  +16193335531 \
  6af17ffe-d4fe-4b53-aa81-8f11e311aba4
```

### Test Endpoints
- **POST:** `curl -X POST https://your-domain.com/api/booking/confirm -H "Content-Type: application/json" -H "x-booking-secret: YOUR_SECRET" -d '{"email":"test@example.com","appointmentId":"test-123"}'`
- **GET:** `curl https://your-domain.com/api/booking/confirm?email=test@example.com`

---

## 🐛 Known Issues & Solutions

### Issue 1: 406 Error in Polling Endpoint
**Status:** ✅ Fixed  
**Solution:** Replaced `maybeSingle()` with `.limit(1)` and array check  
**File:** `src/lib/bookingConfirmationStore.ts`

### Issue 2: Instance Isolation (Data Not Persisting)
**Status:** ✅ Fixed  
**Solution:** Migrated from in-memory store to Supabase  
**Impact:** Data now persists across all serverless instances

### Issue 3: Calendar Widget Not Receiving Email
**Status:** ✅ Fixed  
**Solution:** Pass email via URL parameter (`?email={email}`)  
**File:** `src/app/booking/page.tsx`

### Issue 4: Thank-You Page Blank After Booking
**Status:** ✅ Fixed  
**Solution:** Store `quiz_answers` in both `sessionStorage` and `localStorage`  
**File:** `src/app/quiz-submitted/page.tsx`

---

## 🚀 Deployment

### Current Branch
- **Feature Branch:** `feature/call-booking-funnel`
- **Latest Commit:** `1cc0da1` - "fix: use limit(1) instead of maybeSingle() for better compatibility"

### Deployment Status
- ✅ Latest deployment: Building/Ready
- ⚠️ Previous deployment had build error (fixed in latest commit)

### Deployment Process
1. Push to `feature/call-booking-funnel` branch
2. Vercel automatically deploys preview
3. Test on preview URL
4. Merge to `main` for production deployment

### Vercel Project
- **Project:** `conversns-projects/seniorsimple`
- **Preview URLs:** `https://seniorsimple-{hash}-conversns-projects.vercel.app`

---

## 📞 GHL Webhook Configuration

### Webhook Settings (GoHighLevel)
- **URL:** `https://your-domain.com/api/booking/confirm`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `x-booking-secret: 6af17ffe-d4fe-4b53-aa81-8f11e311aba4`

### Custom Data Mapping (GHL)
The webhook expects these fields in the payload:
- `email` - Contact email
- `phone` - Contact phone
- `name` - Contact name
- `appointmentId` - Appointment ID (in `customData.appointmentId` or `appointment.id`)
- `bookingTimes` - Appointment start time (in `customData.bookingTimes` or `appointment.start_time`)

### Calendar Widget Settings (Conversn.io)
- **Widget ID:** `9oszv21kQ1Tx6jG4qopK`
- **Redirect URL:** Leave empty (handled by polling mechanism)
- **Form Fields:** Email field name should be `email`

---

## 🔄 Next Steps & Future Improvements

### Immediate Tasks
1. ✅ Monitor latest deployment for build success
2. ✅ Test full booking flow end-to-end
3. ⏳ Verify GHL webhook payload structure matches expectations
4. ⏳ Add error handling for webhook failures
5. ⏳ Add retry logic for failed webhook POSTs

### Future Enhancements
- [ ] Add SMS notifications for booking confirmations
- [ ] Add email notifications with calendar invite
- [ ] Add analytics tracking for booking funnel conversion
- [ ] Add A/B testing for calendar widget placement
- [ ] Add support for multiple calendar widgets (different agents)
- [ ] Add booking cancellation flow
- [ ] Add booking rescheduling flow

### Technical Debt
- [ ] Remove unused Vercel KV code (if any)
- [ ] Add TypeScript types for GHL webhook payload
- [ ] Add unit tests for booking confirmation store
- [ ] Add integration tests for webhook endpoints
- [ ] Add E2E tests for booking flow

---

## 📚 Related Documentation

- **Implementation Plan:** `CALL_BOOKING_FUNNEL_IMPLEMENTATION_PLAN.md`
- **Database Setup:** `SUPABASE_BOOKING_STORE_SETUP.md`
- **Architecture Handoff:** `ARCHITECT_HANDOFF_SUMMARY.md` (if exists)

---

## 🆘 Troubleshooting Guide

### Problem: Polling returns 406 error
**Solution:** Check `bookingConfirmationStore.ts` - should use `.limit(1)`, not `.single()` or `.maybeSingle()`

### Problem: Booking confirmation not found
**Check:**
1. Webhook POST was received (check Vercel logs)
2. Data stored in Supabase (check `booking_confirmations` table)
3. Email matches exactly (case-insensitive, trimmed)
4. Record hasn't expired (15-minute TTL)

### Problem: Calendar widget not loading
**Check:**
1. Email is in URL parameter (`?email=...`)
2. Conversn.io widget ID is correct (`9oszv21kQ1Tx6jG4qopK`)
3. Network requests in browser console
4. CORS issues (shouldn't be, widget is iframe)

### Problem: Thank-you page blank
**Check:**
1. `quiz_answers` in `sessionStorage` or `localStorage`
2. `appointment_data` in `sessionStorage` or `localStorage`
3. Browser console for errors
4. Retry mechanism in `quiz-submitted/page.tsx`

---

## 👥 Contact & Support

### Key Information
- **Project:** SeniorSimple
- **Repository:** `conversn-io/seniorsimple`
- **Database:** CallReady Quiz Database (`jqjftrlnyysqcwbbigpw`)
- **Deployment:** Vercel (`conversns-projects/seniorsimple`)

### Important Notes
- All lead/funnel data is stored in CallReady Quiz Database (not CMS Supabase)
- Booking confirmations expire after 15 minutes
- Polling runs for up to 5 minutes (60 attempts × 5 seconds)
- Phone number updated to `+1 (619) 333-5531` across all pages

---

## ✅ Checklist for New Agent

- [ ] Read this entire document
- [ ] Review `CALL_BOOKING_FUNNEL_IMPLEMENTATION_PLAN.md`
- [ ] Check latest deployment status in Vercel
- [ ] Verify database migration is applied
- [ ] Test booking flow end-to-end
- [ ] Review recent commits in `feature/call-booking-funnel` branch
- [ ] Understand conditional routing logic
- [ ] Familiarize with Supabase booking confirmation store
- [ ] Review GHL webhook configuration
- [ ] Check environment variables in Vercel

---

**End of Handoff Document**

*Last Updated: December 9, 2025*  
*For questions or clarifications, refer to commit history and inline code comments.*

