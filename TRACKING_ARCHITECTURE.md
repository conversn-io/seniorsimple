# SeniorSimple Unified Tracking Architecture

## Overview

SeniorSimple now uses a unified tracking system that provides dual tracking capabilities:
- **Client-side tracking**: GA4 and Meta Pixel for real-time analytics
- **Server-side tracking**: Supabase database for reliable, cookie-proof data storage

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │    │  temp-tracking.ts │    │   Supabase DB   │
│                 │    │                  │    │                 │
│ • Quiz Pages    │───▶│ • GA4 Events     │───▶│ • analytics_    │
│ • Lead Forms    │    │ • Meta Events    │    │   events        │
│ • Page Views    │    │ • Supabase API   │    │ • verified_     │
│                 │    │                  │    │   leads         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Single Source of Truth

**`src/lib/temp-tracking.ts`** is now the single source of truth for all tracking functions.

### Key Features

- **Dual Tracking**: Every event is sent to both client-side (GA4/Meta) and server-side (Supabase)
- **Graceful Degradation**: Client-side tracking continues even if Supabase fails
- **UTM Capture**: Automatic UTM parameter extraction and storage
- **Cross-Platform Attribution**: GA4 client_id and Meta Pixel IDs stored for attribution
- **Deduplication**: Supabase Edge Function handles duplicate event prevention

## API Reference

### Core Tracking Functions

#### `trackQuizStart(quizType: string, sessionId: string)`
Tracks when a user starts a quiz.

**Client-side**: GA4 `quiz_start` event
**Server-side**: Supabase `quiz_start` event with UTM and attribution data

#### `trackQuestionAnswer(questionId: string, answer: any, step: number, totalSteps: number, sessionId: string, funnelType: string)`
Tracks individual quiz question responses.

**Client-side**: GA4 `question_answer` event with progress percentage
**Server-side**: Supabase `question_answer` event with full quiz context

#### `trackQuizComplete(quizType: string, sessionId: string, funnelType: string, completionTime: number)`
Tracks quiz completion.

**Client-side**: GA4 `quiz_complete` event
**Server-side**: Supabase `quiz_complete` event with completion metrics

#### `trackPageView(pageName: string, pagePath: string)`
Tracks page views across the site.

**Client-side**: GA4 `page_view` event
**Server-side**: Supabase `page_view` event with UTM data

#### `trackLeadFormSubmit(leadData: LeadData)`
Tracks lead form submissions.

**Client-side**: GA4 `lead_form_submit` + Meta `Lead` events
**Server-side**: Supabase `lead_form_submit` event with full lead data

### Helper Functions

#### `sendToSupabase(eventData: SupabaseTrackingEvent): Promise<boolean>`
Sends tracking data to Supabase Edge Function with error handling.

#### `getUTMParams(): Record<string, string>`
Extracts UTM parameters from current URL.

#### `getGAClientId(): string | undefined`
Retrieves GA4 client ID for cross-platform attribution.

#### `getMetaPixelIds(): { fbc?: string; fbp?: string }`
Retrieves Meta Pixel IDs for cross-platform attribution.

## Data Flow

### 1. Event Trigger
Component calls tracking function (e.g., `trackQuizStart()`)

### 2. Client-Side Tracking
- GA4 event sent via `gtag()`
- Meta event sent via `fbq()` (for lead events only)

### 3. Server-Side Tracking
- UTM parameters extracted from URL
- GA4 client_id and Meta Pixel IDs retrieved
- Event data sent to Supabase REST API (`/rest/v1/analytics_events`)
- Data stored in `analytics_events` table using RateRoots schema
- SeniorSimple-specific data stored in `properties` JSONB field

### 4. Data Storage
All SeniorSimple data is stored in the existing RateRoots `analytics_events` table, with SeniorSimple-specific information stored in the `properties` JSONB field for maximum compatibility and no schema changes required.

## Database Schema

### analytics_events Table (RateRoots Schema)
SeniorSimple uses the existing RateRoots schema, storing all SeniorSimple-specific data in the `properties` JSONB field:

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  event_name TEXT,
  event_category TEXT,
  event_label TEXT,
  event_value NUMERIC,
  user_id TEXT,
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  properties JSONB,  -- SeniorSimple data stored here
  created_at TIMESTAMP,
  contact_id UUID
);
```

### SeniorSimple Data Structure in properties JSONB
```json
{
  "site_key": "SENIORSIMPLE",
  "funnel_type": "annuity|fia-quote|general",
  "utm_source": "google|facebook|etc",
  "utm_medium": "cpc|organic|etc",
  "utm_campaign": "campaign_name",
  "zip_code": "12345",
  "state": "CA",
  "state_name": "California",
  "contact": {
    "email": "user@example.com",
    "phone": "+1234567890",
    "first_name": "John",
    "last_name": "Doe",
    "ga_client_id": "123456789.1234567890",
    "fbc": "fb.1.1234567890.AbCdEfGhIjKlMnOpQrStUvWxYz",
    "fbp": "fb.1.1234567890.1234567890"
  },
  "quiz_answers": {
    "question_id": "answer_value",
    "step": 1,
    "total_steps": 5,
    "progress_percentage": 20
  },
  "lead_score": 85,
  "consent": true,
  "timestamp": "2025-01-28T00:00:00.000Z",
  "landing_page": "/quiz",
  "utm_parameters": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "retirement_quiz"
  }
}
```

## Configuration

### Environment Variables
```bash
# GA4 Configuration
NEXT_PUBLIC_GA4_MEASUREMENT_ID_SENIORSIMPLE=G-XXXXXXXXXX

# Meta Pixel Configuration
NEXT_PUBLIC_META_PIXEL_ID_SENIORSIMPLE=24221789587508633

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_QUIZ_URL=https://jqjftrlnyysqcwbbigpw.supabase.co
NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GHL Webhook (for lead processing)
NEXT_PUBLIC_GHL_WEBHOOK_SENIORSIMPLE=https://services.leadconnectorhq.com/hooks/...
```

## Querying SeniorSimple Events

```sql
-- Get all SeniorSimple events
SELECT * FROM analytics_events 
WHERE properties->>'site_key' = 'SENIORSIMPLE'
ORDER BY created_at DESC;

-- Get SeniorSimple quiz events
SELECT * FROM analytics_events 
WHERE properties->>'site_key' = 'SENIORSIMPLE' 
AND event_name = 'quiz_start';

-- Get SeniorSimple leads
SELECT * FROM analytics_events 
WHERE properties->>'site_key' = 'SENIORSIMPLE' 
AND event_name = 'lead_form_submit';

-- Get SeniorSimple events by funnel type
SELECT * FROM analytics_events 
WHERE properties->>'site_key' = 'SENIORSIMPLE' 
AND properties->>'funnel_type' = 'annuity';

-- Get SeniorSimple events with UTM data
SELECT event_name, properties->>'utm_source', properties->>'utm_campaign'
FROM analytics_events 
WHERE properties->>'site_key' = 'SENIORSIMPLE'
AND properties->>'utm_source' IS NOT NULL;

-- Get SeniorSimple lead conversion funnel
SELECT 
  event_name,
  COUNT(*) as event_count,
  properties->>'funnel_type' as funnel_type
FROM analytics_events 
WHERE properties->>'site_key' = 'SENIORSIMPLE'
GROUP BY event_name, properties->>'funnel_type'
ORDER BY event_name;
```

## Migration from supabase-tracking.ts

The old `supabase-tracking.ts` file has been deprecated but is kept for backward compatibility.

### What Changed
- **Single Import**: All components now import from `temp-tracking.ts` only
- **Dual Tracking**: Every function now sends to both client and server
- **Better Error Handling**: Graceful degradation if Supabase fails
- **Enhanced Data**: UTM parameters and attribution data automatically captured

### Migration Steps
1. ✅ Update all imports to use `temp-tracking.ts`
2. ✅ Remove any direct calls to `supabase-tracking.ts` functions
3. ✅ Verify all tracking functions work as expected
4. ✅ Test database connectivity and event storage

## Troubleshooting

### Common Issues

#### Events Not Appearing in Supabase
1. Check browser console for Supabase errors
2. Verify `NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY` is set correctly
3. Check Supabase Edge Function logs
4. Ensure `ingest-event` function is deployed

#### GA4 Events Not Tracking
1. Check browser console for GA4 errors
2. Verify `NEXT_PUBLIC_GA4_MEASUREMENT_ID_SENIORSIMPLE` is set
3. Check if GA4 script is loaded in `layout.tsx`
4. Verify gtag is available in browser

#### Meta Events Not Tracking
1. Check browser console for Meta Pixel errors
2. Verify `NEXT_PUBLIC_META_PIXEL_ID_SENIORSIMPLE` is set
3. Check if Meta Pixel is loaded in `layout.tsx`
4. Verify fbq is available in browser

### Debug Mode
Enable debug logging by checking browser console for messages starting with:
- `🔧 SeniorSimple Temp Tracking Config:`
- `📊 Tracking [event_name]:`
- `Supabase tracking failed:`
- `Supabase tracking error:`

## Performance Considerations

- **Async Operations**: All Supabase calls are async and don't block UI
- **Error Handling**: Failed Supabase calls don't break client-side tracking
- **Deduplication**: Server-side deduplication prevents duplicate events
- **Caching**: UTM parameters and attribution data are cached per session

## Security

- **API Keys**: All keys are public (NEXT_PUBLIC_*) as required for client-side usage
- **Data Validation**: Supabase Edge Function validates all incoming data
- **Rate Limiting**: Supabase provides built-in rate limiting
- **Consent**: All events include consent flag (defaults to true)

## Future Enhancements

- [ ] Add offline event queuing
- [ ] Implement event batching for better performance
- [ ] Add more detailed error reporting
- [ ] Create admin dashboard for tracking analytics
- [ ] Add A/B testing event tracking
