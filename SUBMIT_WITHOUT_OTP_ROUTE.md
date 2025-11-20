# Submit Without OTP Route

## Overview

The `/api/leads/submit-without-otp` route allows form submissions to bypass OTP verification and immediately send leads to GoHighLevel (GHL) webhook upon form submission.

## Route Details

**Endpoint:** `POST /api/leads/submit-without-otp`

**Purpose:** 
- Accept form submission data
- Save lead to database (marked as verified)
- Send to GHL webhook immediately
- No OTP verification required

## Request Body

```typescript
{
  email: string;                    // Required
  phoneNumber: string;              // Required
  firstName?: string;
  lastName?: string;
  quizAnswers?: any;                // Quiz answers object
  calculatedResults?: any;          // Calculated quiz results
  zipCode?: string;
  state?: string;
  stateName?: string;
  licensingInfo?: any;
  utmParams?: {                     // UTM parameters
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  sessionId?: string;               // Quiz session ID
  funnelType?: string;              // e.g., 'insurance', 'fia_quote'
}
```

## Response

### Success Response (200)
```typescript
{
  success: true;
  leadId: string;
  contactId: string;
  ghlStatus: number;                // HTTP status from GHL webhook
  message: string;
}
```

### Error Response (400/500)
```typescript
{
  success: false;
  error: string;
  timestamp?: string;
}
```

## Usage Example

### In Quiz Component (AnnuityQuiz.tsx)

```typescript
// When skipOTP prop is true
if (skipOTP) {
  const response = await fetch('/api/leads/submit-without-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: answer.email,
      phoneNumber: answer.phone,
      firstName: answer.firstName,
      lastName: answer.lastName,
      quizAnswers: updatedAnswers,
      calculatedResults: calculateResults(),
      zipCode: updatedAnswers.locationInfo?.zipCode,
      state: updatedAnswers.locationInfo?.state,
      stateName: updatedAnswers.locationInfo?.stateName,
      licensingInfo: updatedAnswers.locationInfo?.licensing,
      utmParams: utmParams,
      sessionId: quizSessionId || 'unknown',
      funnelType: funnelType
    })
  });

  const result = await response.json();
  if (result.success) {
    // Lead saved and sent to GHL
    console.log('Lead ID:', result.leadId);
  }
}
```

## Flow Comparison

### With OTP (Existing Flow)
1. User submits form
2. OTP sent to phone
3. User verifies OTP
4. `/api/leads/verify-otp-and-send-to-ghl` called
5. Lead saved to database (marked as verified)
6. GHL webhook sent

### Without OTP (New Flow)
1. User submits form
2. `/api/leads/submit-without-otp` called immediately
3. Lead saved to database (marked as verified)
4. GHL webhook sent immediately

## Key Features

- **No OTP Required**: Bypasses phone verification step
- **Immediate Processing**: Lead saved and sent to GHL on form submission
- **Database Integration**: Creates/updates contact and lead records
- **GHL Webhook**: Sends complete lead data to GoHighLevel
- **UTM Tracking**: Preserves UTM parameters in lead data
- **Error Handling**: Gracefully handles GHL webhook failures (still saves lead)
- **Analytics**: Logs webhook attempts to `analytics_events` table

## Database Updates

- **Contact**: Created/updated in `contacts` table
- **Lead**: Created/updated in `leads` table with:
  - `is_verified: true`
  - `status: 'verified'`
  - `verified_at: current timestamp`
  - `skipOTP: true` flag in analytics event

## GHL Webhook Payload

The route sends the following payload to GHL:

```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;                    // Formatted as +1XXXXXXXXXX
  zipCode?: string;
  state?: string;
  stateName?: string;
  source: 'SeniorSimple Quiz';
  funnelType: string;
  quizAnswers: any;
  calculatedResults?: any;
  licensingInfo?: any;
  leadScore: number;                // Default: 75
  timestamp: string;                // ISO timestamp
  utmParams: object;
  skipOTP: true;                    // Flag indicating no OTP was used
}
```

## Environment Variables

- `annuity_GHL_webhook`: GHL webhook URL (defaults to SeniorSimple webhook)

## Notes

- Lead is always saved to database, even if GHL webhook fails
- GHL webhook has a 10-second timeout
- Webhook failures are logged but don't prevent lead from being saved
- The route uses CORS headers for cross-origin requests

