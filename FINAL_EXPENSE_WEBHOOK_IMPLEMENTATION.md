# Final Expense Quote Webhook Implementation

## Summary

Created a **flat payload structure** for `funnelType=final-expense-quote` that sends all fields at the root level (no nested objects) for easy mapping in GoHighLevel.

## Webhook URL

```
https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6
```

## Test Results

✅ **Successfully tested** - Webhook accepted the flat payload structure:
```json
{
  "status": "Success: request sent to trigger execution server",
  "id": "zCANo09MkVJoC06UusNs"
}
```

## Implementation Changes

### Updated File: `src/app/api/leads/submit-without-otp/route.ts`

**Before:** Nested payload structure with `quizAnswers`, `utmParams`, `calculatedResults`, etc.

**After:** Flat payload structure with all fields at root level:

```typescript
const ghlPayload: Record<string, any> = {
  // Contact Information
  firstName: firstName || contact.first_name,
  lastName: lastName || contact.last_name,
  email: email,
  phone: formattedPhone,
  phoneLast4: phoneLast4,
  
  // Address Information
  address: streetNumber ? `${streetNumber} ${address}`.trim() : address,
  city: city,
  state: addressState,
  stateName: addressData.state || stateName || lead.state_name,
  zipCode: addressZip,
  
  // Final Expense Specific Fields (only for final-expense-quote)
  coverageAmount: coverageAmount,
  ageRange: ageRange,
  healthStatus: healthStatus,
  tobaccoUse: tobaccoUse,
  coveragePurpose: coveragePurpose, // Comma-separated string
  
  // System Fields
  ipAddress: ipAddress,
  source: 'SeniorSimple Final Expense Quiz',
  funnelType: 'final-expense-quote',
  originallyCreated: originallyCreated,
  timestamp: new Date().toISOString(),
  sessionId: sessionId || lead.session_id || '',
  leadScore: 75,
  
  // UTM Parameters (flat)
  utmSource: utmSource,
  utmMedium: utmMedium,
  utmCampaign: utmCampaign,
  utmTerm: utmTerm,
  utmContent: utmContent,
  
  // Additional Context
  landingPage: landingPage,
  referrer: referrer,
};
```

## Key Changes

1. **Removed nested objects:**
   - ❌ `quizAnswers: { ... }`
   - ❌ `utmParams: { ... }`
   - ❌ `calculatedResults: { ... }`
   - ❌ `licensingInfo: { ... }`

2. **Flattened UTM parameters:**
   - ✅ `utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent` at root level

3. **Extracted final expense fields:**
   - ✅ `ageRange`, `healthStatus`, `tobaccoUse`, `coveragePurpose` extracted from `quizAnswers`
   - ✅ `coveragePurpose` converted from array to comma-separated string

4. **Conditional fields:**
   - Final expense specific fields (`ageRange`, `healthStatus`, `tobaccoUse`, `coveragePurpose`) only included when `funnelType === 'final-expense-quote'`

## Field Map

See `FINAL_EXPENSE_WEBHOOK_FIELD_MAP.md` for complete field documentation including:
- Field names, types, and descriptions
- Required vs optional fields
- Sample values and options
- GoHighLevel mapping recommendations

## Testing

### Test Endpoint Created

Created test endpoint: `/api/leads/test-final-expense-webhook`

**Usage:**
```bash
curl -X POST http://localhost:3000/api/leads/test-final-expense-webhook \
  -H "Content-Type: application/json"
```

### Direct Webhook Test

Tested directly with curl:
```bash
curl -X POST "https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6" \
  -H "Content-Type: application/json" \
  -d '{...flat payload...}'
```

**Result:** ✅ Success

## Next Steps

1. ✅ Flat payload structure implemented
2. ✅ Webhook tested and confirmed working
3. ✅ Field map documentation created
4. ⏳ Configure GoHighLevel webhook mapping using field map
5. ⏳ Test with real lead submission from quiz

## Notes

- The payload structure is **backward compatible** - annuity quotes still work with the existing structure
- Final expense specific fields are only added when `funnelType === 'final-expense-quote'`
- All nested data is flattened to root level for easier GHL mapping
- Empty optional fields are omitted from payload (not sent as empty strings)

