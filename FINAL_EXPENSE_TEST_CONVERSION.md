# Final Expense Test Conversion - Tracking Verification

## Test Conversion Sent ✅

**Date:** January 15, 2026  
**Endpoint:** `/api/leads/test-final-expense-webhook`  
**Webhook URL:** `https://services.leadconnectorhq.com/hooks/vTM82D7FNpIlnPgw6XNC/webhook-trigger/28ef726d-7ead-4cd2-aa85-dfc6192adfb6`

## Test Payload Structure

The test conversion includes all required fields for Facebook Pixel and CAPI tracking:

### Contact Information
- **First Name:** Test
- **Last Name:** Conversion
- **Email:** `test.conversion.{timestamp}@seniorsimple.org` (unique timestamp)
- **Phone:** +15551234567
- **Phone Last 4:** 4567

### Address Information
- **Address:** 123 Main Street
- **City:** Phoenix
- **State:** AZ
- **State Name:** Arizona
- **ZIP Code:** 85001

### Final Expense Specific Fields
- **Coverage Amount:** $15,000
- **Age Range:** 60-69
- **Health Status:** Good - Managed conditions, no recent hospitalizations
- **Tobacco Use:** No, never
- **Coverage Purpose:** Funeral & Burial Costs, Leave Money to Family

### Tracking Parameters (Critical for Facebook CAPI)
- **UTM Source:** facebook
- **UTM Medium:** cpc
- **UTM Campaign:** final_expense_test_conversion
- **UTM Term:** test
- **UTM Content:** test_conversion_webhook
- **Session ID:** `test_conversion_{timestamp}` (unique)
- **Landing Page:** /final-expense-quote
- **Referrer:** https://www.facebook.com

### System Fields
- **Funnel Type:** final-expense-quote
- **Source:** SeniorSimple Final Expense Quiz
- **IP Address:** 192.168.1.1
- **Lead Score:** 85
- **Timestamp:** ISO 8601 format

## What to Check in GoHighLevel

### 1. Contact Creation ✅
- [ ] Contact created with test email
- [ ] All contact fields populated correctly
- [ ] Address fields mapped correctly

### 2. Facebook Pixel Tracking ✅
- [ ] Pixel event fired (check GHL automation logs)
- [ ] Event type: `Lead` or `CompleteRegistration`
- [ ] Event ID matches session ID for deduplication
- [ ] UTM parameters captured in pixel event

### 3. Facebook CAPI (Conversions API) ✅
- [ ] CAPI event sent to Facebook
- [ ] Event matches pixel event (deduplication working)
- [ ] Email/Phone hashed correctly for matching
- [ ] No duplicate events (check Facebook Events Manager)

### 4. Custom Fields Mapping ✅
- [ ] Coverage Amount field populated
- [ ] Age Range field populated
- [ ] Health Status field populated
- [ ] Tobacco Use field populated
- [ ] Coverage Purpose field populated
- [ ] Session ID field populated
- [ ] UTM parameters in custom fields

### 5. Double Tracking Prevention ✅
- [ ] Only ONE pixel event fired
- [ ] Only ONE CAPI event sent
- [ ] Event deduplication working (same event ID)
- [ ] No duplicate contacts created

## Testing Steps

1. **Send Test Conversion:**
   ```bash
   curl -X POST https://seniorsimple-iahzzhac0-conversns-projects.vercel.app/api/leads/test-final-expense-webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "conversion"}'
   ```

2. **Check GHL Contact:**
   - Navigate to Contacts in GHL
   - Search for email: `test.conversion.*@seniorsimple.org`
   - Verify all fields are populated

3. **Check GHL Automation Logs:**
   - Navigate to Automations → Logs
   - Look for webhook trigger execution
   - Verify pixel event was fired
   - Verify CAPI event was sent

4. **Check Facebook Events Manager:**
   - Navigate to Events Manager
   - Filter by event: `Lead` or `CompleteRegistration`
   - Verify event appears within 5-10 minutes
   - Check event details match payload
   - Verify no duplicate events

5. **Verify Deduplication:**
   - Check event ID matches session ID
   - Verify pixel and CAPI events have same event ID
   - Confirm no duplicate conversions in Facebook

## Expected Results

✅ **Success Indicators:**
- Contact created in GHL
- Pixel event fired in GHL automation
- CAPI event sent to Facebook
- Event appears in Facebook Events Manager
- No duplicate events
- All custom fields populated

❌ **Failure Indicators:**
- No contact created
- Pixel event not fired
- CAPI event not sent
- Duplicate events in Facebook
- Missing custom fields

## Troubleshooting

### If Contact Not Created:
- Check GHL webhook logs
- Verify webhook URL is correct
- Check payload structure matches GHL expectations

### If Pixel Not Firing:
- Check GHL automation is active
- Verify pixel code is installed
- Check automation trigger conditions

### If CAPI Not Sending:
- Verify CAPI integration is configured in GHL
- Check Facebook Business Manager settings
- Verify access token is valid

### If Duplicate Events:
- Check event ID deduplication logic
- Verify session ID is unique per conversion
- Check for multiple webhook triggers

## Notes

- Test conversions use unique email addresses with timestamps to avoid conflicts
- Session IDs are unique per test to ensure proper deduplication
- UTM parameters are included to test attribution tracking
- All fields match the production payload structure

## Next Steps

After verifying the test conversion:
1. Monitor Facebook Events Manager for 24 hours
2. Check for any duplicate events
3. Verify pixel and CAPI events match
4. Test with real quiz submission
5. Monitor production conversions for issues

