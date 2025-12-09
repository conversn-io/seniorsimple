# SeniorSimple Booking Funnel - Quick Start Guide

**Quick Reference for Developers**

---

## 🚀 Quick Start

### 1. Understanding the Flow
```
/quiz-book → Quiz → /booking → Calendar → GHL Webhook → Polling → /quiz-submitted
```

### 2. Key Routes
- **`/quiz-book`** - Entry point (with OTP)
- **`/quiz-book-b`** - Entry point (no OTP)
- **`/booking`** - Calendar booking page
- **`/quiz-submitted`** - Thank-you page with appointment confirmation

### 3. Key Files
- **`src/app/booking/page.tsx`** - Calendar page + polling logic
- **`src/app/api/booking/confirm/route.ts`** - Webhook endpoint
- **`src/lib/bookingConfirmationStore.ts`** - Supabase store
- **`src/components/quiz/AnnuityQuiz.tsx`** - Conditional routing

---

## 🔧 Common Tasks

### Test the Booking Flow
```bash
# 1. Start local dev server
npm run dev

# 2. Navigate to booking funnel
http://localhost:3000/quiz-book

# 3. Complete quiz with test email
# 4. Verify redirect to /booking
# 5. Complete calendar booking
# 6. Check webhook logs in Vercel
```

### Test Webhook Endpoint
```bash
# Use the test script
./test-booking-webhook.sh \
  https://your-preview-url.vercel.app \
  test@example.com \
  +16193335531 \
  YOUR_SECRET
```

### Check Database
```sql
-- Query booking confirmations
SELECT * FROM booking_confirmations 
WHERE email = 'test@example.com' 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🐛 Quick Fixes

### Polling Returns 406 Error
**Fix:** Use `.limit(1)` instead of `.single()` or `.maybeSingle()`
**File:** `src/lib/bookingConfirmationStore.ts`

### Booking Not Found
**Check:**
1. Webhook POST was received (Vercel logs)
2. Email matches exactly (lowercase, trimmed)
3. Record hasn't expired (15 min TTL)

### Calendar Not Loading
**Check:**
1. Email in URL: `?email=test@example.com`
2. Widget ID: `9oszv21kQ1Tx6jG4qopK`
3. Network tab for errors

---

## 📊 Database

**Database:** CallReady Quiz Database (`jqjftrlnyysqcwbbigpw`)  
**Table:** `booking_confirmations`  
**TTL:** 15 minutes

---

## 🔐 Environment Variables

- `SUPABASE_QUIZ_URL` - CallReady Quiz DB URL
- `SUPABASE_QUIZ_SERVICE_ROLE_KEY` - Service role key
- `BOOKING_WEBHOOK_SECRET` - Webhook secret (optional)

---

## 📞 Support

**Full Documentation:** See `BOOKING_FUNNEL_HANDOFF.md`  
**Implementation Plan:** See `CALL_BOOKING_FUNNEL_IMPLEMENTATION_PLAN.md`

---

**Last Updated:** December 9, 2025

