# UTM Tracking Implementation for SeniorSimple

## 🎯 Overview

This implementation adds comprehensive UTM parameter tracking to the SeniorSimple quiz funnel, following the proven pattern from RateRoots. UTM parameters are captured, stored, and forwarded through the entire lead processing pipeline.

## 📦 What Was Implemented

### **1. UTM Utilities (`src/utils/utm-utils.ts`)**
- **`extractUTMParameters()`** - Extracts UTM parameters from URL
- **`storeUTMParameters()`** - Stores UTM in sessionStorage
- **`getStoredUTMParameters()`** - Retrieves stored UTM parameters
- **`hasUTMParameters()`** - Checks if UTM parameters exist

### **2. UTM Tracker (`src/utils/utm-tracker.ts`)**
- **`trackUTMParameters()`** - Sends UTM data to Supabase Edge Function
- Uses flattened payload structure (following proven pattern)
- Includes both flattened fields and nested `utm` object
- Comprehensive error handling and logging

### **3. Quiz Integration (`src/components/quiz/AnnuityQuiz.tsx`)**
- **Session-based tracking** - Prevents duplicate UTM sends
- **Automatic UTM extraction** - On component mount
- **UTM inclusion in data flows** - All API calls include UTM parameters
- **Comprehensive logging** - Full UTM tracking visibility

### **4. API Route Updates**
- **`/api/leads/capture-email`** - Stores UTM in analytics_events
- **`/api/leads/verify-otp-and-send-to-ghl`** - Includes UTM in GHL webhook
- **UTM persistence** - UTM data flows through entire lead pipeline

### **5. Supabase Edge Function (`supabase/functions/track-utm/index.ts`)**
- **Dedicated UTM tracking** - Stores UTM data in analytics_events
- **Comprehensive UTM capture** - All UTM parameters and tracking IDs
- **Error handling** - Robust error responses
- **CORS support** - Cross-origin request handling

## 🔧 Technical Implementation

### **UTM Parameter Support**
```typescript
interface UTMParameters {
  utm_source?: string;      // Traffic source (google, facebook, etc.)
  utm_medium?: string;      // Marketing medium (cpc, email, social, etc.)
  utm_campaign?: string;    // Campaign name
  utm_term?: string;       // Keywords
  utm_content?: string;    // Ad content
  utm_id?: string;         // Campaign ID
  gclid?: string;          // Google Click ID
  fbclid?: string;         // Facebook Click ID
  msclkid?: string;        // Microsoft Click ID
}
```

### **Session-Based Tracking**
```typescript
// Prevents duplicate UTM tracking per session
const utmTracked = sessionStorage.getItem('utm_tracked');
if (utmTracked === 'true') {
  // UTM already tracked for this session
  return;
}
```

### **Flattened Payload Structure**
```typescript
const utmPayload = {
  session_id: sessionId,
  page_url: window.location.href,
  landing_page: window.location.pathname,
  referrer: document.referrer,
  funnel_type: 'annuity',
  user_agent: navigator.userAgent,
  timestamp: new Date().toISOString(),
  utm_source: utmParams.utm_source,
  utm_medium: utmParams.utm_medium,
  utm_campaign: utmParams.utm_campaign,
  utm_term: utmParams.utm_term,
  utm_content: utmParams.utm_content,
  utm_id: utmParams.utm_id,
  gclid: utmParams.gclid,
  fbclid: utmParams.fbclid,
  msclkid: utmParams.msclkid,
  utm: utmParams // Keep nested object too
};
```

## 🚀 Deployment

### **1. Deploy Supabase Edge Function**
```bash
# Run the deployment script
./deploy-utm-tracking.sh
```

### **2. Environment Variables Required**
```env
# Client-side (accessible in browser)
NEXT_PUBLIC_SUPABASE_QUIZ_URL=https://jqjftrlnyysqcwbbigpw.supabase.co
NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY=your_anon_key

# Server-side (for API routes)
SUPABASE_QUIZ_URL=https://jqjftrlnyysqcwbbigpw.supabase.co
SUPABASE_QUIZ_ANON_KEY=your_anon_key
SUPABASE_QUIZ_SERVICE_ROLE_KEY=your_service_role_key
```

### **3. Supabase Secrets (Edge Functions)**
```bash
# Set in Supabase dashboard or via CLI
SUPABASE_URL=https://jqjftrlnyysqcwbbigpw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🧪 Testing

### **1. Test UTM Parameter Extraction**
```bash
# Visit quiz with UTM parameters
https://seniorsimple.org/quiz?utm_source=google&utm_medium=cpc&utm_campaign=annuity_test&utm_term=retirement+planning
```

### **2. Check Browser Console**
Look for UTM tracking logs:
```
📊 UTM Parameters Found: {utm_source: "google", utm_medium: "cpc", ...}
✅ UTM Parameters Tracked Successfully
```

### **3. Verify Database Storage**
Check `analytics_events` table for `utm_tracked` events:
```sql
SELECT * FROM analytics_events 
WHERE event_name = 'utm_tracked' 
ORDER BY created_at DESC;
```

### **4. Test GHL Webhook**
Verify UTM parameters are included in GHL webhook payload:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "utmParams": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "annuity_test"
  }
}
```

## 📊 Data Flow

### **1. UTM Capture Flow**
```
User visits quiz with UTM → Extract UTM parameters → Store in sessionStorage → Send to track-utm Edge Function → Store in analytics_events
```

### **2. Lead Processing Flow**
```
Quiz completion → Include UTM in API calls → Store UTM in database → Forward UTM to GHL webhook
```

### **3. Data Storage Locations**
- **`analytics_events`** - UTM tracking events
- **`verified_leads.quiz_answers`** - UTM included in lead data
- **GHL webhook payload** - UTM forwarded to downstream systems

## 🔍 Monitoring & Debugging

### **Console Logs to Watch**
```
📊 UTM Parameters Found: {...}
✅ UTM Parameters Tracked Successfully
📤 Sending to GHL Webhook: {payload: {...}}
```

### **Database Queries for Monitoring**
```sql
-- Check UTM tracking events
SELECT event_name, properties->>'utm_source', properties->>'utm_campaign', created_at 
FROM analytics_events 
WHERE event_name = 'utm_tracked' 
ORDER BY created_at DESC;

-- Check leads with UTM data
SELECT first_name, last_name, quiz_answers->>'utm_parameters' as utm_data
FROM verified_leads 
WHERE quiz_answers->>'utm_parameters' IS NOT NULL
ORDER BY created_at DESC;
```

## ✅ Success Criteria

- [ ] UTM parameters extracted from URL on quiz load
- [ ] UTM data stored in sessionStorage
- [ ] UTM sent to track-utm Edge Function once per session
- [ ] UTM included in email capture API calls
- [ ] UTM included in OTP verification API calls
- [ ] UTM forwarded to GHL webhook
- [ ] UTM data stored in database
- [ ] No duplicate UTM tracking per session

## 🎉 Benefits

1. **Complete Attribution** - Track lead sources from first touch to conversion
2. **Campaign Performance** - Measure effectiveness of different marketing channels
3. **Lead Quality Insights** - Understand which sources produce best leads
4. **Retargeting Capability** - Re-engage users based on original traffic source
5. **ROI Measurement** - Calculate return on investment for marketing campaigns

## 🔄 Future Enhancements

- **UTM Analytics Dashboard** - Visualize UTM performance
- **Lead Scoring by UTM** - Score leads based on traffic source
- **Automated Campaign Optimization** - Adjust bids based on UTM performance
- **Cross-Session Tracking** - Track users across multiple sessions
- **UTM Validation** - Ensure UTM parameters are properly formatted

---

**Implementation Status: ✅ Complete and Ready for Production**


