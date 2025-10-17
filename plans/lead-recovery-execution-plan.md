# 🚨 Lead Recovery Execution Plan

## Executive Summary

**Problem:** 10 leads lost phone numbers due to database column name mismatch (`phone_number` vs `phone`)
**Solution:** Multi-step recovery process to update GHL and Supabase with correct contact data
**Timeline:** ~30 minutes total execution time
**Success Criteria:** All 10 leads have phone numbers in both GHL and Supabase

---

## Phase 1: Pre-Flight Checks (5 minutes)

### ✅ Step 1.1: Verify Current State

**Action:** Check Supabase to confirm contacts exist but phones are missing

```sql
-- Run in Supabase SQL Editor
SELECT 
  id,
  email,
  first_name,
  last_name,
  phone,
  created_at
FROM contacts
WHERE email IN (
  'ksteinwart@gmail.com',
  'mauridc56@yahoo.com',
  'ann.alle@yahoo.com',
  'brendamilbourne@gmail.com',
  'keyonna_h@hotmail.com',
  'jack300@comcast.net',
  'josephcarney202@gmail.com',
  'lenorasmith9818@yahoo.com',
  'csevangelista27@gmail.com',
  'matthews99572@gmail.com'
)
ORDER BY email;
```

**Expected Result:** 10 rows with NULL or empty `phone` column

---

### ✅ Step 1.2: Verify GHL Webhook is Accessible

**Action:** Test webhook endpoint with sample payload

```bash
curl -X POST https://services.leadconnectorhq.com/hooks/Aai8MNBiqlh6AOeBbgam/webhook-trigger/7cd05c92-5ec0-4ebc-b76f-566a568c4e68 \
  -H "Content-Type: application/json" \
  -d '{
    "trigger_type": "test_recovery",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "5551234567"
  }'
```

**Expected Result:** Should NOT return "invalid data" error

---

### ✅ Step 1.3: Verify Environment Variables

**Action:** Check that Supabase credentials are available

```bash
# In project root
echo "SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_QUIZ_URL"
echo "SUPABASE_KEY: ${NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY:0:20}..."
```

**Expected Result:** Both variables should have values

---

## Phase 2: Create Recovery Script (10 minutes)

### ✅ Step 2.1: Create Recovery Script File

**File:** `scripts/recover-lost-leads.js`

**Location:** `17-Web-Applications/01-RateRoots-Platform/rateroots-platform/scripts/recover-lost-leads.js`

**Contents:** [See full script below]

---

### ✅ Step 2.2: Install Dependencies (if needed)

```bash
cd 17-Web-Applications/01-RateRoots-Platform/rateroots-platform
npm install @supabase/supabase-js node-fetch
```

---

### ✅ Step 2.3: Create Test Mode Version

**Purpose:** Test with 1 lead before running full batch

**File:** `scripts/recover-lost-leads-test.js`

**Change:** Only include first lead in `recoveredLeads` array

---

## Phase 3: Test Recovery (5 minutes)

### ✅ Step 3.1: Run Test Script on ONE Lead

```bash
cd 17-Web-Applications/01-RateRoots-Platform/rateroots-platform
node scripts/recover-lost-leads-test.js
```

**Expected Output:**
```
🚀 Starting lead recovery process...
📊 Total leads to recover: 1

[1/1] Processing: ksteinwart@gmail.com
   Name: Kimberly Steinwart
   Phone: +17207566997
   📡 Sending to GHL webhook...
   ✅ GHL webhook success
   💾 Updating Supabase contact...
   ✅ Supabase updated (contact_id: xxx)

📊 RECOVERY SUMMARY:
   GHL Webhook:
   ✅ Success: 1
   ❌ Failed: 0
   
   Supabase Updates:
   ✅ Success: 1
   ❌ Failed: 0
```

---

### ✅ Step 3.2: Verify Test Lead in GHL

**Action:** Log into GHL and search for `ksteinwart@gmail.com`

**Check:**
- Contact exists
- Phone number shows: `(720) 756-6997`
- Workflow triggered
- Tags/notes show "recovery_lead_update"

---

### ✅ Step 3.3: Verify Test Lead in Supabase

**Action:** Run verification query

```sql
SELECT 
  email,
  first_name,
  last_name,
  phone,
  is_verified,
  verified_at,
  updated_at
FROM contacts
WHERE email = 'ksteinwart@gmail.com';
```

**Expected Result:**
- `phone` = `7207566997` (without +1)
- `is_verified` = `true`
- `verified_at` and `updated_at` have recent timestamps

---

### ✅ Step 3.4: Check Zapier Integration

**Action:** Verify Zapier received the lead from GHL workflow

**Check:**
- Zap history shows new entry
- Client received notification
- All data fields populated correctly

---

## Phase 4: Full Batch Recovery (5 minutes)

### ✅ Step 4.1: Run Full Recovery Script

**Only proceed if Step 3 was 100% successful**

```bash
cd 17-Web-Applications/01-RateRoots-Platform/rateroots-platform
node scripts/recover-lost-leads.js
```

**Expected Output:**
```
🚀 Starting lead recovery process...
📊 Total leads to recover: 10

[Processing all 10 leads...]

📊 RECOVERY SUMMARY:
   GHL Webhook:
   ✅ Success: 10
   ❌ Failed: 0
   
   Supabase Updates:
   ✅ Success: 10
   ❌ Failed: 0
```

---

### ✅ Step 4.2: Monitor Execution

**Watch for:**
- Any red ❌ error messages
- Any failed GHL webhook calls
- Any failed Supabase updates
- Script completes without exceptions

**If Errors Occur:**
1. Note which lead(s) failed
2. Check error message
3. Manually retry failed leads
4. Document issue in recovery log

---

## Phase 5: Verification & Validation (5 minutes)

### ✅ Step 5.1: Verify All Leads in Supabase

```sql
-- Count recovered phone numbers
SELECT 
  COUNT(*) as total_recovered,
  COUNT(phone) as with_phone,
  COUNT(CASE WHEN phone IS NULL THEN 1 END) as still_missing
FROM contacts
WHERE email IN (
  'ksteinwart@gmail.com',
  'mauridc56@yahoo.com',
  'ann.alle@yahoo.com',
  'brendamilbourne@gmail.com',
  'keyonna_h@hotmail.com',
  'jack300@comcast.net',
  'josephcarney202@gmail.com',
  'lenorasmith9818@yahoo.com',
  'csevangelista27@gmail.com',
  'matthews99572@gmail.com'
);
```

**Expected Result:**
- `total_recovered` = 10
- `with_phone` = 10
- `still_missing` = 0

---

### ✅ Step 5.2: Verify All Leads in GHL

**Action:** Bulk search in GHL for all 10 emails

**Check:**
- All 10 contacts found
- All have phone numbers
- All have recent activity timestamp
- All show recovery tags/notes

---

### ✅ Step 5.3: Verify Zapier Integration

**Action:** Check Zapier history for past hour

**Expected:** 10 new leads processed to clients

---

### ✅ Step 5.4: Spot Check 3 Random Leads

**Pick 3 random leads and verify end-to-end:**

1. Email exists in Supabase with phone
2. Contact exists in GHL with phone
3. Client received lead via Zapier
4. All quiz data present and correct

---

## Phase 6: Documentation & Monitoring (5 minutes)

### ✅ Step 6.1: Create Recovery Log

**File:** `LEAD-RECOVERY-LOG.md`

**Contents:**
```markdown
# Lead Recovery Log - October 15, 2024

## Issue
- Database column mismatch: code used `phone_number` but table has `phone`
- 10 leads lost phone numbers between Oct 15 00:00 - 14:00 UTC
- Bug fix deployed: commit c865ff4

## Recovery Executed
- Date: October 15, 2024
- Time: [timestamp]
- Leads Recovered: 10
- GHL Webhook Success: 10/10
- Supabase Updates: 10/10
- Zapier Notifications: 10/10

## Recovered Leads
1. ksteinwart@gmail.com - (720) 756-6997
2. mauridc56@yahoo.com - (210) 915-3178
3. ann.alle@yahoo.com - (631) 922-1652
4. brendamilbourne@gmail.com - (304) 707-7196
5. keyonna_h@hotmail.com - (312) 925-7493
6. jack300@comcast.net - (847) 863-9563
7. josephcarney202@gmail.com - (860) 559-7409
8. lenorasmith9818@yahoo.com - (731) 610-2007
9. csevangelista27@gmail.com - (808) 497-2973
10. matthews99572@gmail.com - (907) 251-8350

## Prevention Measures Implemented
- [x] Bug fixed: correct column name in lead-capture.ts
- [x] Consolidata tracking reinstalled site-wide
- [ ] Schema validation to be added
- [ ] Monitoring alerts to be configured
```

---

### ✅ Step 6.2: Set Up Ongoing Monitoring

**Action:** Create hourly phone capture rate check

```sql
-- Save as Supabase scheduled query
-- Run every hour at :15
CREATE OR REPLACE FUNCTION check_phone_capture_rate()
RETURNS void AS $$
DECLARE
  capture_rate numeric;
BEGIN
  SELECT 
    ROUND(100.0 * COUNT(phone) / NULLIF(COUNT(*), 0), 2)
  INTO capture_rate
  FROM contacts
  WHERE created_at >= NOW() - INTERVAL '1 hour';
  
  IF capture_rate < 90 THEN
    -- Alert logic here (webhook to Slack/email)
    RAISE NOTICE 'ALERT: Phone capture rate below 90%%: %', capture_rate;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

### ✅ Step 6.3: Update Vercel Monitoring

**Action:** Set up log drain or monitoring rule

1. Go to Vercel Dashboard → Project Settings → Integrations
2. Add Log Drain (Logtail, Better Stack, or Datadog)
3. Create alert rule for: "Contact upsert failed" OR "Lead insert failed"
4. Set notification channel (Slack/Email)

---

## Recovery Script

```javascript
// scripts/recover-lost-leads.js
const { createClient } = require('@supabase/supabase-js');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_QUIZ_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_QUIZ_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// GHL Webhook URL
const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/Aai8MNBiqlh6AOeBbgam/webhook-trigger/7cd05c92-5ec0-4ebc-b76f-566a568c4e68';

// Recovered lead data from Vercel logs
const recoveredLeads = [
  {
    email: 'ksteinwart@gmail.com',
    firstName: 'Kimberly',
    lastName: 'Steinwart',
    phoneNumber: '+17207566997',
    sessionId: 'rateroots_mgraqsiy_y71k3b3dz9',
    funnelType: 'home-equity',
    zipCode: '80206',
    consentGiven: true,
    otpEnabled: false
  },
  {
    email: 'mauridc56@yahoo.com',
    firstName: 'Sandra',
    lastName: 'Mauricio',
    phoneNumber: '+12109153178',
    sessionId: 'rateroots_mgrgmipa_xa0w3v91l9j',
    funnelType: 'home-equity',
    zipCode: '78002',
    consentGiven: true,
    otpEnabled: false
  },
  {
    email: 'ann.alle@yahoo.com',
    firstName: 'Anna',
    lastName: 'Allen',
    phoneNumber: '+16319221652',
    sessionId: 'rateroots_mgrfqiui_2mxyk3nqnso',
    funnelType: 'home-equity',
    zipCode: '11772',
    consentGiven: true,
    otpEnabled: false
  },
  {
    email: 'brendamilbourne@gmail.com',
    firstName: 'Brenda',
    lastName: 'Norleen',
    phoneNumber: '+13047077196',
    sessionId: 'rateroots_mgr7i1i3_jsnlkaavhke',
    funnelType: 'home-equity',
    zipCode: '25413',
    consentGiven: true,
    otpEnabled: false
  },
  {
    email: 'keyonna_h@hotmail.com',
    firstName: 'Keyonna',
    lastName: 'Hunt',
    phoneNumber: '+13129257493',
    sessionId: 'rateroots_mgr68uq0_irw1um1vmjp',
    funnelType: 'home-equity',
    zipCode: '60099',
    consentGiven: true,
    otpEnabled: false
  },
  {
    email: 'jack300@comcast.net',
    firstName: 'Jack',
    lastName: 'Ross',
    phoneNumber: '+18478639563',
    sessionId: 'rateroots_mgr4u5if_juk8ji29lf9',
    funnelType: 'home-equity',
    zipCode: '60016',
    consentGiven: true,
    otpEnabled: false
  },
  {
    email: 'josephcarney202@gmail.com',
    firstName: 'Joseph',
    lastName: 'Carney',
    phoneNumber: '+18605597409',
    sessionId: 'rateroots_mgr4cv49_70rz627wze',
    funnelType: 'home-equity',
    zipCode: '06066',
    consentGiven: true,
    otpEnabled: false
  },
  {
    email: 'lenorasmith9818@yahoo.com',
    firstName: 'Lenora',
    lastName: 'Smith',
    phoneNumber: '+17316102007',
    sessionId: 'rateroots_mgr16vuq_noc5s3wuiqo',
    funnelType: 'home-equity',
    zipCode: '38375',
    consentGiven: true,
    otpEnabled: false
  },
  {
    email: 'csevangelista27@gmail.com',
    firstName: 'Carolmomi',
    lastName: 'Evangelista',
    phoneNumber: '+18084972973',
    sessionId: 'rateroots_mgqzctll_5jv9kj6325v',
    funnelType: 'home-equity',
    zipCode: '96792',
    consentGiven: true,
    otpEnabled: false
  },
  {
    email: 'matthews99572@gmail.com',
    firstName: 'Michael',
    lastName: 'Matthews',
    phoneNumber: '+19072518350',
    sessionId: 'rateroots_mgqzbhsl_5rprk0uoxgw',
    funnelType: 'home-equity',
    zipCode: '99712',
    consentGiven: true,
    otpEnabled: false
  }
];

// Send to GHL webhook
async function sendToGHL(lead) {
  const payload = {
    trigger_type: 'recovery_lead_update',
    lead_source: 'RateRoots',
    email: lead.email,
    firstName: lead.firstName,
    lastName: lead.lastName,
    phone: lead.phoneNumber.replace('+1', ''),
    phone_number: lead.phoneNumber,
    session_id: lead.sessionId,
    funnel_type: lead.funnelType,
    zip_code: lead.zipCode,
    consent_given: lead.consentGiven,
    verified: true,
    otp_enabled: false,
    recovery_date: new Date().toISOString(),
    note: 'Phone number recovered from Vercel logs - bug fix deployed'
  };

  try {
    const response = await fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GHL ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update Supabase
async function updateSupabaseContact(lead) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({
        phone: lead.phoneNumber.replace('+1', ''),
        is_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', lead.email.toLowerCase())
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return { success: false, error: 'Contact not found' };
    }

    return { success: true, contactId: data[0].id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Main recovery
async function recoverLeads() {
  console.log('🚀 Starting lead recovery process...\n');
  console.log(`📊 Total leads to recover: ${recoveredLeads.length}\n`);
  console.log('='.repeat(80));

  const results = {
    ghlSuccess: 0,
    ghlFailed: 0,
    supabaseSuccess: 0,
    supabaseFailed: 0,
    errors: []
  };

  for (let i = 0; i < recoveredLeads.length; i++) {
    const lead = recoveredLeads[i];
    const leadNum = i + 1;
    
    console.log(`\n[${leadNum}/${recoveredLeads.length}] Processing: ${lead.email}`);
    console.log(`   Name: ${lead.firstName} ${lead.lastName}`);
    console.log(`   Phone: ${lead.phoneNumber}`);
    
    // Send to GHL
    console.log('   📡 Sending to GHL webhook...');
    const ghlResult = await sendToGHL(lead);
    
    if (ghlResult.success) {
      console.log('   ✅ GHL webhook success');
      results.ghlSuccess++;
    } else {
      console.log(`   ❌ GHL webhook failed: ${ghlResult.error}`);
      results.ghlFailed++;
      results.errors.push({ email: lead.email, step: 'GHL', error: ghlResult.error });
    }
    
    // Update Supabase
    console.log('   💾 Updating Supabase contact...');
    const supabaseResult = await updateSupabaseContact(lead);
    
    if (supabaseResult.success) {
      console.log(`   ✅ Supabase updated (contact_id: ${supabaseResult.contactId})`);
      results.supabaseSuccess++;
    } else {
      console.log(`   ❌ Supabase update failed: ${supabaseResult.error}`);
      results.supabaseFailed++;
      results.errors.push({ email: lead.email, step: 'Supabase', error: supabaseResult.error });
    }
    
    // Rate limit
    if (i < recoveredLeads.length - 1) {
      console.log('   ⏳ Waiting 1s...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RECOVERY SUMMARY:\n');
  console.log(`   GHL Webhook:`);
  console.log(`   ✅ Success: ${results.ghlSuccess}`);
  console.log(`   ❌ Failed: ${results.ghlFailed}`);
  console.log(`\n   Supabase Updates:`);
  console.log(`   ✅ Success: ${results.supabaseSuccess}`);
  console.log(`   ❌ Failed: ${results.supabaseFailed}`);
  
  if (results.errors.length > 0) {
    console.log(`\n   ⚠️  ERRORS (${results.errors.length}):`);
    results.errors.forEach((err, idx) => {
      console.log(`   ${idx + 1}. ${err.email} (${err.step}): ${err.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✨ Recovery process complete!\n');
  
  process.exit(results.errors.length > 0 ? 1 : 0);
}

recoverLeads().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
```

---

## Success Metrics

- ✅ All 10 leads have phone numbers in Supabase `contacts` table
- ✅ All 10 leads updated in GHL with phone numbers
- ✅ All 10 leads triggered GHL workflow → Zapier → Client
- ✅ Zero errors during recovery process
- ✅ Documentation completed
- ✅ Monitoring alerts configured

---

## Rollback Plan (if needed)

If recovery causes issues:

1. **Stop script immediately** (Ctrl+C)
2. **Document which leads were processed**
3. **Manually reverse changes in Supabase:**
   ```sql
   UPDATE contacts
   SET phone = NULL, is_verified = false, verified_at = NULL
   WHERE email IN ('lead1@example.com', 'lead2@example.com');
   ```
4. **Contact GHL support** to remove duplicate/test entries
5. **Re-run recovery with fixes**

---

## Post-Recovery Checklist

- [ ] All leads verified in Supabase with phones
- [ ] All leads verified in GHL with phones
- [ ] Zapier history shows 10 new leads
- [ ] Clients confirmed receipt
- [ ] Recovery log completed
- [ ] Monitoring alerts configured
- [ ] Team notified of completion
- [ ] Prevention measures documented

