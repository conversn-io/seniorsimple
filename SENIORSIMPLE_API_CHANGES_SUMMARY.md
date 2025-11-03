# SeniorSimple API Route Changes - Developer Integration Summary

**Date:** November 3, 2025  
**Purpose:** Summary of critical fixes and data flow changes for SeniorSimple quiz lead capture system

---

## 🎯 Executive Summary

**Critical Bug Fixed:** Data was reaching GHL webhooks but **NOT being saved to Supabase** when leads were verified via OTP. This document outlines:
1. What was fixed
2. How data now flows through the system
3. How to parse and display phone/location data
4. Integration requirements for developers

---

## 🐛 Bug Fix: `/api/leads/verify-otp-and-send-to-ghl`

### Problem
When an existing lead was updated after OTP verification, the endpoint only saved:
- ✅ `is_verified = true`
- ✅ `verified_at` timestamp
- ✅ `status = 'verified'`
- ✅ Contact phone (if missing)

**Missing data that was sent to GHL but NOT saved to Supabase:**
- ❌ Phone numbers in leads/contacts
- ❌ Location data (`zip_code`, `state`, `state_name`)
- ❌ `quiz_answers.locationInfo`
- ❌ `quiz_answers.calculated_results`
- ❌ `quiz_answers.phone`

### Solution
Updated the endpoint to save **ALL data** when updating existing leads:

```typescript
// Before (lines 317-359): Only updated verification status
const updateData: any = {
  is_verified: true,
  verified_at: new Date().toISOString(),
  status: 'verified',
};

// After: Updates ALL fields including location and quiz_answers
const updateData: any = {
  is_verified: true,
  verified_at: new Date().toISOString(),
  status: 'verified',
  zip_code: zipCode || lead.zip_code,
  state: state || lead.state,
  state_name: stateName || lead.state_name,
  quiz_answers: updatedQuizAnswers, // Includes locationInfo, calculatedResults, phone, etc.
};
```

**File Changed:**
- `src/app/api/leads/verify-otp-and-send-to-ghl/route.ts` (lines 317-412)

---

## 📊 Data Flow Architecture

### Complete Lead Capture Flow

```
1. User submits quiz form
   ↓
2. POST /api/leads/capture-email
   - Saves contact (with phone if provided)
   - Saves lead with status: 'email_captured' or 'phone_captured'
   - Sets is_verified: false
   - Stores quiz_answers (but may be incomplete)
   ↓
3. User verifies phone via OTP
   ↓
4. POST /api/leads/verify-otp-and-send-to-ghl
   - Finds existing lead by contact_id + session_id
   - Updates contact phone (if missing)
   - Updates lead with:
     * is_verified: true
     * verified_at: timestamp
     * status: 'verified'
     * zip_code, state, state_name
     * quiz_answers (merged with locationInfo, calculatedResults, phone)
   - Sends complete data to GHL webhook
```

### Data Storage Locations

| Data Type | Primary Location | Secondary Location | Notes |
|-----------|-----------------|-------------------|-------|
| **Phone** | `contacts.phone` | `quiz_answers.phone` | Always normalize to E.164 format (+15551234567) |
| **Location (Zip)** | `leads.zip_code` | `quiz_answers.locationInfo.zipCode` | String format |
| **Location (State)** | `leads.state` | `quiz_answers.locationInfo.state` | 2-letter code (e.g., "GA") |
| **Location (State Name)** | `leads.state_name` | `quiz_answers.locationInfo.stateName` | Full name (e.g., "Georgia") |
| **Calculated Results** | `quiz_answers.calculated_results` | N/A | JSON object with monthly income projections |
| **Location Info (Full)** | `quiz_answers.locationInfo` | N/A | Complete location object with licensing info |

---

## 📱 Parsing Phone & Location Data for Display

### Recommended Approach: Primary Source + Fallback

When displaying data in the UI or generating reports, use this priority order:

#### Phone Number Parsing

```typescript
function getPhoneNumber(contact: Contact, lead: Lead): string | null {
  // Priority 1: contacts.phone (normalized, primary source)
  if (contact?.phone) {
    return contact.phone; // Already in E.164 format
  }
  
  // Priority 2: quiz_answers.phone (fallback)
  if (lead?.quiz_answers?.phone) {
    return formatE164(lead.quiz_answers.phone);
  }
  
  // Priority 3: quiz_answers.personalInfo.phone (alternative structure)
  if (lead?.quiz_answers?.personalInfo?.phone) {
    return formatE164(lead.quiz_answers.personalInfo.phone);
  }
  
  return null;
}
```

#### Location Data Parsing

```typescript
function getLocationData(lead: Lead): {
  zipCode: string | null;
  state: string | null;
  stateName: string | null;
} {
  // Priority 1: Top-level lead fields (normalized, primary source)
  if (lead.zip_code || lead.state || lead.state_name) {
    return {
      zipCode: lead.zip_code || null,
      state: lead.state || null,
      stateName: lead.state_name || null,
    };
  }
  
  // Priority 2: quiz_answers.locationInfo (fallback)
  const locationInfo = lead.quiz_answers?.locationInfo;
  if (locationInfo) {
    return {
      zipCode: locationInfo.zipCode || null,
      state: locationInfo.state || null,
      stateName: locationInfo.stateName || null,
    };
  }
  
  // Priority 3: Alternative quiz_answers structure
  const altLocation = lead.quiz_answers?.location_info;
  if (altLocation) {
    return {
      zipCode: altLocation.zipCode || altLocation.zip_code || null,
      state: altLocation.state || null,
      stateName: altLocation.stateName || altLocation.state_name || null,
    };
  }
  
  return { zipCode: null, state: null, stateName: null };
}
```

#### Calculated Results Parsing

```typescript
function getCalculatedResults(lead: Lead): any {
  // Priority 1: quiz_answers.calculated_results
  if (lead.quiz_answers?.calculated_results) {
    return lead.quiz_answers.calculated_results;
  }
  
  // Priority 2: Alternative key names
  if (lead.quiz_answers?.calculatedResults) {
    return lead.quiz_answers.calculatedResults;
  }
  
  return null;
}
```

### Database Query Pattern

When querying leads with contacts, use joins to get all data:

```sql
SELECT 
  l.id as lead_id,
  l.status,
  l.is_verified,
  l.zip_code,
  l.state,
  l.state_name,
  l.quiz_answers,
  c.id as contact_id,
  c.email,
  c.phone,
  c.first_name,
  c.last_name
FROM leads l
JOIN contacts c ON l.contact_id = c.id
WHERE l.site_key = 'seniorsimple.org'
ORDER BY l.created_at DESC;
```

Then parse in application code using the functions above.

---

## 🔄 Backfill Status

**Completed:** Backfilled 3 historical leads that had data in GHL but not Supabase:
- ✅ Lee Fraser (leefraser042@gmail.com)
- ✅ Terry Dew (terry.dew@icloud.com)
- ✅ Richard Sparks (r7jsparks@verizon.net)

All now have:
- Phone numbers in `contacts.phone`
- Location data in `leads.zip_code`, `leads.state`, `leads.state_name`
- Complete `quiz_answers` with `locationInfo` and `calculated_results`
- `is_verified = true`

**Script Location:** `callready-database/scripts/backfill_seniorsimple_from_ghl.js`

---

## 📝 API Endpoint Details

### `/api/leads/capture-email` (POST)

**Purpose:** Initial lead capture (before OTP verification)

**Request Body:**
```typescript
{
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string; // Optional - may be provided upfront
  quizAnswers: object; // Complete quiz response object
  sessionId: string;
  funnelType?: string; // Default: 'insurance'
  zipCode?: string;
  state?: string;
  stateName?: string;
  licensingInfo?: object;
  calculatedResults?: object;
  utmParams?: object;
}
```

**Response:**
```typescript
{
  success: true;
  contactId: string;
  leadId: string;
  isVerified: false; // Always false at this stage
}
```

**What It Does:**
1. Upserts contact (finds by email or phone_hash)
2. Creates/updates lead with `is_verified: false`
3. Saves to `analytics_events` for retargeting
4. Sets status to `'phone_captured'` if phone provided, else `'email_captured'`

---

### `/api/leads/verify-otp-and-send-to-ghl` (POST)

**Purpose:** Verify OTP and complete lead submission

**Request Body:**
```typescript
{
  phoneNumber: string; // Required
  email: string; // Required
  firstName: string;
  lastName: string;
  quizAnswers?: object; // May include updated quiz data
  sessionId: string;
  funnelType?: string;
  zipCode?: string;
  state?: string;
  stateName?: string;
  licensingInfo?: object;
  calculatedResults?: object;
  utmParams?: object;
}
```

**Response:**
```typescript
{
  success: true;
  leadId: string;
  contactId: string;
  ghlStatus: number; // HTTP status from GHL webhook
}
```

**What It Does:**
1. Finds existing lead by `contact_id` + `session_id`
2. Updates contact phone (if missing)
3. **UPDATES LEAD WITH ALL DATA** (including location, calculated results)
4. Sets `is_verified: true`, `verified_at: now()`, `status: 'verified'`
5. Sends complete payload to GHL webhook
6. Logs to `analytics_events`

**Critical Change:** Now updates `quiz_answers`, `zip_code`, `state`, `state_name` in addition to verification status.

---

## 🎨 Frontend Integration Notes

### Displaying Phone Numbers

```typescript
// Component example
const LeadCard = ({ lead, contact }) => {
  const phone = contact?.phone || lead?.quiz_answers?.phone || 'No phone';
  const formattedPhone = phone && phone !== 'No phone' 
    ? formatPhoneDisplay(phone) // e.g., "(770) 377-0105"
    : 'No phone';
  
  return (
    <div>
      <p>Phone: {formattedPhone}</p>
    </div>
  );
};
```

### Displaying Location

```typescript
const LocationDisplay = ({ lead }) => {
  const location = getLocationData(lead);
  const locationString = location.zipCode && location.stateName
    ? `${location.zipCode}, ${location.stateName}`
    : location.zipCode || location.stateName || 'No location';
  
  return <p>Location: {locationString}</p>;
};
```

### Displaying Verification Status

```typescript
const VerificationBadge = ({ lead }) => {
  if (lead.is_verified) {
    return (
      <span className="verified">
        ✅ Verified {lead.verified_at && `on ${formatDate(lead.verified_at)}`}
      </span>
    );
  }
  return <span className="pending">⏳ Pending Verification</span>;
};
```

---

## 🔍 Data Validation & Testing

### Test Cases

1. **New Lead Flow:**
   - Submit quiz with email only → Should create lead with `is_verified: false`
   - Verify OTP → Should update lead with phone, location, `is_verified: true`

2. **Existing Lead Update:**
   - Submit quiz → Lead created
   - Verify OTP → Lead should update (not duplicate)
   - Verify all fields are updated (phone, location, calculated results)

3. **Data Consistency:**
   - Phone in `contacts.phone` should match `quiz_answers.phone`
   - Location in `leads.zip_code` should match `quiz_answers.locationInfo.zipCode`
   - All verification fields should be set correctly

### Query for Testing

```sql
-- Check that verified leads have all required data
SELECT 
  l.id,
  l.is_verified,
  l.status,
  c.phone as contact_phone,
  l.zip_code,
  l.state,
  l.quiz_answers->>'phone' as quiz_phone,
  l.quiz_answers->'locationInfo'->>'zipCode' as quiz_zip
FROM leads l
JOIN contacts c ON l.contact_id = c.id
WHERE l.site_key = 'seniorsimple.org'
  AND l.is_verified = true
ORDER BY l.verified_at DESC
LIMIT 10;
```

---

## ⚠️ Important Notes for Developers

1. **Data Normalization:** Phone numbers are stored in E.164 format (`+15551234567`). Always normalize before saving.

2. **Quiz Answers Structure:** The `quiz_answers` JSONB field can have multiple structures. Use the parsing functions provided above with fallbacks.

3. **Backward Compatibility:** Older leads may not have location data in top-level fields. Always check both `leads.zip_code` and `quiz_answers.locationInfo`.

4. **GHL Sync:** Data is sent to GHL webhook AFTER Supabase update. If GHL webhook fails, data is still saved to Supabase (this is intentional).

5. **Error Handling:** The endpoints gracefully handle missing optional columns (`form_type`, `attributed_ad_account`, `profit_center`) by retrying without them.

6. **Session ID Matching:** Leads are matched by `contact_id` + `session_id`. This prevents duplicates when users complete the quiz multiple times.

---

## 📚 Related Files

### API Routes
- `src/app/api/leads/capture-email/route.ts` - Initial lead capture
- `src/app/api/leads/verify-otp-and-send-to-ghl/route.ts` - OTP verification & GHL webhook

### Utilities
- `src/utils/phone-utils.ts` - Phone normalization functions (`formatE164`, `formatPhoneForGHL`)

### Database
- `contacts` table - Primary contact information
- `leads` table - Lead records with quiz data
- `analytics_events` table - Event tracking for retargeting

### Scripts
- `callready-database/scripts/backfill_seniorsimple_from_ghl.js` - Backfill script for historical data

---

## ✅ Checklist for Integration

- [ ] Review updated `/api/leads/verify-otp-and-send-to-ghl` endpoint code
- [ ] Test lead capture flow (email → OTP → verification)
- [ ] Verify phone numbers are saved to `contacts.phone`
- [ ] Verify location data is saved to `leads.zip_code`, `leads.state`, `leads.state_name`
- [ ] Verify `quiz_answers` includes `locationInfo` and `calculated_results`
- [ ] Update frontend components to use parsing functions (primary + fallback)
- [ ] Test with leads that have data in both locations (normalized + quiz_answers)
- [ ] Verify GHL webhook receives complete data
- [ ] Check that verified leads have `is_verified: true` and `verified_at` timestamp

---

**Questions?** Refer to:
- Data analysis report: `callready-database/SENIORSIMPLE_DATA_ANALYSIS_REPORT.md`
- GHL webhook records: `callready-database/ghl-webhook-records.md`
- Backfill script: `callready-database/scripts/backfill_seniorsimple_from_ghl.js`

