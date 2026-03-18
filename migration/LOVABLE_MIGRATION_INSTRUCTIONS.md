# Lovable Migration Instructions (Final Expense Call Funnel + Meta CAPI)

## Core conversion model (required)
1. `ViewContent` on pageview.
2. Landing/header inbound call button click = `Contact` (raw inbound phone + value).
3. Quiz data submit (name, zip, quiz answers; no email/phone required) = `Lead`.
4. Final success-page inbound call button click = `SubmitApplication` (highest value).

## Supabase schema (required)
- Apply SQL file:
  - `/Users/funkyfortress/Documents/01-ALL DOCUMENTS/05 - Projects/CallReady/02-Expansion-Operations-Planning/02-Publisher-Platforms/02-SeniorSimple-Platform/03-SeniorSimple 2/migration/CALLREADY_SUPABASE_FUNNEL_SCHEMA.sql`
- Required tables:
  - `public.funnel_sessions`
  - `public.analytics_events`
  - `public.quiz_submissions`
  - `public.capi_dispatch_log`
- Session helper function:
  - `public.touch_funnel_session(...)`

### Data write expectations
- On first page load:
  - Upsert session via `touch_funnel_session` using `session_id`, URL, referrer, user agent, UTM data.
- On each funnel event:
  - Insert row in `analytics_events` with `event_name`, `session_id`, `page_url`, and `properties`.
- On quiz submit:
  - Insert row in `quiz_submissions` with `first_name`, `last_name`, `zip_code`, and `quiz_answers`.
- On every CAPI send:
  - Insert row in `capi_dispatch_log` with `standard_event_name`, `event_id`, status, and response body.

## Event/value/number tiers
- Raw inbound call number: `VITE_RAW_INBOUND_PHONE_E164`
- Final success-page inbound call number: `VITE_FINAL_INBOUND_PHONE_E164`
- Contact conversion value: `VITE_CAPI_CONTACT_VALUE`
- Lead conversion value: `VITE_CAPI_LEAD_VALUE`
- SubmitApplication conversion value: `VITE_CAPI_SUBMIT_APPLICATION_VALUE`

## Non-negotiable UX/performance parity
- Fast first interaction and fluid step-to-step motion are conversion-critical.
- Do not block quiz progression on network calls.
- Keep one mounted quiz shell and swap question content only.
- No spinner between normal question steps.
- Use subtle transitions (120-180ms), not heavy animations.
- Median answer-click to next-question paint target: `<= 200ms` on throttled mobile profile.
- Answer options must use large color-filled tap targets with clear selected state.

## Exact quiz spec
1. `What would you like coverage for?`
  - `My family`
  - `My mortgage`
  - `End of life`
2. `Do you smoke?`
  - `Yes`
  - `No`
3. `Do you have any pre-existing medical conditions?`
  - `Yes`
  - `No`
4. `What stage are you at with life insurance?`
  - `I already have coverage`
  - `I don't yet have any coverage`
5. `What is your date of birth?`
  - Placeholder: `DOB`
6. `What's your zip code`
  - 5-digit validation

Primary button label: `Submit`

## Thank-you page spec
- Confetti display on render.
- 90-second countdown timer.
- Qualification line:
  - `[Name], you are qualified for burial insurance of up to $50,000 and your policy is being built right now and your rate will be locked until this countdown expires.`
- Agent line with ZIP-derived city:
  - `We've found an available agent in {dynamic city} ready to walk you through your next steps`
- Extra-large dynamic `Call Now` button using `VITE_FINAL_INBOUND_PHONE_E164`.
- Auto-redirect when timer expires to `/free-burial-life-insurance-guide`.

## Copy/paste prompts for Lovable

### Prompt 1: Scaffold
```
Build a React + Vite TypeScript app with routes:
- /final-expense-quote
- /final-expense-quote/thank-you

Set env support:
- VITE_API_BASE_URL
- VITE_SITE_KEY
- VITE_META_PIXEL_ID
- VITE_RAW_INBOUND_PHONE_E164
- VITE_FINAL_INBOUND_PHONE_E164
- VITE_CAPI_CONTACT_VALUE
- VITE_CAPI_LEAD_VALUE
- VITE_CAPI_SUBMIT_APPLICATION_VALUE

Frontend must call backend APIs only.
```

### Prompt 2: Build quiz UI exactly
```
Implement the exact 6-question flow and copy from spec.
Use large high-contrast color-filled option buttons with clear selected state.
Use a single mounted quiz shell with smooth 120-180ms transitions.
No spinner between normal question steps.
```

### Prompt 3: Implement tracking + CAPI mapping
```
Implement these backend calls:
- /api/analytics/track-pageview
- /api/analytics/track-event
- /api/capi/event

Map events exactly:
1) Pageview => CAPI ViewContent
2) Landing/header raw call click => CAPI Contact
3) Quiz submit (name+zip+answers, no email/phone required) => CAPI Lead
4) Thank-you final call click => CAPI SubmitApplication

Always send unique event_id and unix event_time.
Never block UI transitions on event/API calls.
```

### Prompt 4: Contact and final call behavior
```
Raw inbound buttons (landing + header):
- use VITE_RAW_INBOUND_PHONE_E164
- fire CAPI Contact with VITE_CAPI_CONTACT_VALUE
- then open tel: link

Final call button on success page:
- use VITE_FINAL_INBOUND_PHONE_E164
- fire CAPI SubmitApplication with VITE_CAPI_SUBMIT_APPLICATION_VALUE
- then open tel: link
```

### Prompt 5: Lead event behavior (no email/phone)
```
On quiz submit, fire CAPI Lead using available data:
- first name
- last name
- zip code
- session id
- fbp/fbc if present

Do not require email or phone for Lead event.
```

## Reference implementation snippets

### CAPI helper
```ts
export async function sendCapiEvent(payload: {
  standard_event_name: 'ViewContent' | 'Contact' | 'Lead' | 'SubmitApplication';
  event_id: string;
  event_time: number;
  event_source_url: string;
  value: number;
  currency?: 'USD';
  user_data?: Record<string, string | null>;
  custom_data?: Record<string, unknown>;
}) {
  return fetch(`${import.meta.env.VITE_API_BASE_URL}/api/capi/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_source: 'website',
      funnel_type: 'final-expense-quote',
      currency: 'USD',
      ...payload,
    }),
  });
}
```

### Contact click
```ts
const rawPhone = import.meta.env.VITE_RAW_INBOUND_PHONE_E164;
void sendCapiEvent({
  standard_event_name: 'Contact',
  event_id: `contact_${Date.now()}`,
  event_time: Math.floor(Date.now() / 1000),
  event_source_url: window.location.href,
  value: Number(import.meta.env.VITE_CAPI_CONTACT_VALUE || 0),
  user_data: { fbp, fbc, client_user_agent: navigator.userAgent, external_id: sessionId },
  custom_data: { stage: 'landing', dial_number: rawPhone, site_key: 'seniorsimple.org' },
});
window.location.href = `tel:${rawPhone}`;
```

### Lead submit
```ts
void sendCapiEvent({
  standard_event_name: 'Lead',
  event_id: `lead_${Date.now()}`,
  event_time: Math.floor(Date.now() / 1000),
  event_source_url: window.location.href,
  value: Number(import.meta.env.VITE_CAPI_LEAD_VALUE || 0),
  user_data: {
    fbp,
    fbc,
    client_user_agent: navigator.userAgent,
    external_id: sessionId,
    fn: (firstName || '').toLowerCase() || null,
    ln: (lastName || '').toLowerCase() || null,
    zp: zipCode || null,
  },
  custom_data: { stage: 'quiz_submit', zip_code: zipCode, site_key: 'seniorsimple.org' },
});
```

### SubmitApplication click
```ts
const finalPhone = import.meta.env.VITE_FINAL_INBOUND_PHONE_E164;
void sendCapiEvent({
  standard_event_name: 'SubmitApplication',
  event_id: `submit_app_${Date.now()}`,
  event_time: Math.floor(Date.now() / 1000),
  event_source_url: window.location.href,
  value: Number(import.meta.env.VITE_CAPI_SUBMIT_APPLICATION_VALUE || 0),
  user_data: { fbp, fbc, client_user_agent: navigator.userAgent, external_id: sessionId, zp: zipCode || null },
  custom_data: { stage: 'thank_you', dial_number: finalPhone, site_key: 'seniorsimple.org' },
});
window.location.href = `tel:${finalPhone}`;
```

## Acceptance checklist
- Pageview triggers `ViewContent`.
- Raw inbound click triggers `Contact` with raw inbound number and configured contact value.
- Quiz submit triggers `Lead` without requiring email or phone.
- Final success-page call button triggers `SubmitApplication` with highest configured value.
- All CAPI events include unique `event_id` and non-blocking frontend behavior.
- Median question transition latency remains <= 200ms.
