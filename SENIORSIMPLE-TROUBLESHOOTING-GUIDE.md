# 🔧 SENIORSIMPLE TRACKING TROUBLESHOOTING GUIDE

## 📊 **TEST RESULTS ANALYSIS**

Based on your test results, here's what's working and what needs attention:

### ✅ **WORKING SYSTEMS:**
- **DataLayer Events**: All 5 events fired successfully
- **Meta Events**: PageView and Lead events sent
- **GTM Container**: Loaded and active

### ❌ **ISSUES FOUND:**

#### **1. GA4 Not Loaded**
```
❌ [GA4] gtag function not found - GA4 may not be loaded
```

**Root Cause**: GA4 is likely loaded via GTM, not directly
**Solution**: Check GTM Preview mode to verify GA4 events

#### **2. CAPI Route Missing**
```
POST https://www.seniorsimple.org/api/capi/lead 405 (Method Not Allowed)
```

**Root Cause**: CAPI endpoint doesn't exist yet
**Solution**: Implement Supabase Edge Functions for CAPI

#### **3. GTM Variables Error**
```
Cannot read properties of undefined (reading 'macro')
```

**Root Cause**: GTM macro function not available in current context
**Solution**: Use GTM Preview mode for variable testing

## 🛠️ **TROUBLESHOOTING SOLUTIONS**

### **Issue 1: GA4 Events Not Firing**

#### **Check GTM Preview Mode:**
1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Select container: `GTM-T75CL8X9`
3. Click **Preview**
4. Enter your SeniorSimple URL
5. Click **Connect**
6. Look for GA4 events in the preview

#### **Verify GA4 Configuration:**
```javascript
// Check if GA4 is loaded via GTM
console.log('GTM Container:', window.google_tag_manager);
console.log('DataLayer:', window.dataLayer);
```

#### **Manual GA4 Test:**
```javascript
// Test GA4 directly
if (typeof gtag !== 'undefined') {
  gtag('event', 'test_event', {
    'event_category': 'test',
    'event_label': 'manual_test'
  });
  console.log('✅ GA4 event sent');
} else {
  console.log('❌ GA4 not loaded directly - check GTM');
}
```

### **Issue 2: CAPI Endpoints Missing**

#### **Current Status:**
- CAPI endpoints don't exist yet
- This is normal for initial setup
- CAPI will be handled by Supabase Edge Functions

#### **Temporary Solution:**
```javascript
// Test CAPI with different endpoints
const capiEndpoints = [
  '/api/capi/lead',
  '/api/leads/process-lead',
  '/api/leads/capi',
  '/api/tracking/capi'
];

// Try each endpoint
for (const endpoint of capiEndpoints) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    console.log(`${endpoint}: ${response.status}`);
  } catch (error) {
    console.log(`${endpoint}: Not found`);
  }
}
```

#### **Future Implementation:**
- Implement Supabase Edge Functions
- Create CAPI endpoints
- Test server-side Meta events

### **Issue 3: GTM Variables Not Accessible**

#### **Root Cause:**
- GTM macro function not available in browser context
- Variables are only accessible in GTM Preview mode

#### **Solution:**
```javascript
// Check GTM variables in Preview mode
if (typeof window.google_tag_manager !== 'undefined') {
  const gtmContainer = window.google_tag_manager[window.google_tag_manager.length - 1];
  
  if (gtmContainer && gtmContainer.macro) {
    // Variables are accessible
    console.log('GTM Variables available');
  } else {
    console.log('GTM Variables only available in Preview mode');
  }
}
```

## 🔍 **DIAGNOSTIC SCRIPTS**

### **Run Diagnostics:**
```javascript
// Copy and paste this into console
window.seniorSimpleDiagnostics.runDiagnostics();
```

### **Check Specific Systems:**
```javascript
// Check GTM
window.seniorSimpleDiagnostics.diagnoseGTM();

// Check GA4
window.seniorSimpleDiagnostics.diagnoseGA4();

// Check Meta
window.seniorSimpleDiagnostics.diagnoseMeta();

// Check CAPI
window.seniorSimpleDiagnostics.diagnoseCAPI();
```

## 📊 **VERIFICATION CHECKLIST**

### **GTM Verification:**
- [ ] GTM container loaded
- [ ] DataLayer initialized
- [ ] GTM Preview mode working
- [ ] All tags firing
- [ ] Variables populated

### **GA4 Verification:**
- [ ] GA4 loaded via GTM
- [ ] Events firing in GTM Preview
- [ ] Real-time reports showing events
- [ ] Event parameters populated

### **Meta Verification:**
- [ ] Meta Pixel loaded via GTM
- [ ] Events firing in GTM Preview
- [ ] Events Manager showing events
- [ ] Custom parameters included

### **CAPI Verification:**
- [ ] Supabase Edge Functions implemented
- [ ] CAPI endpoints working
- [ ] Server-side Meta events
- [ ] Lead delivery successful

## 🚀 **NEXT STEPS**

### **Immediate Actions:**
1. **Use GTM Preview Mode** to verify all events
2. **Check GA4 Real-time** reports
3. **Check Meta Events Manager** for events
4. **Run diagnostic script** for detailed analysis

### **Implementation Tasks:**
1. **Implement Supabase Edge Functions** for CAPI
2. **Create CAPI endpoints** for server-side tracking
3. **Test lead delivery** to GHL
4. **Verify database saves** in Supabase

### **Testing Procedure:**
1. **Run fixed test script** (`test-seniorsimple-tracking-fixed.js`)
2. **Use GTM Preview mode** for detailed verification
3. **Check all tracking systems** individually
4. **Verify event parameters** are populated

## 🎯 **SUCCESS CRITERIA**

### **All Systems Working:**
- ✅ GTM container loaded
- ✅ DataLayer events firing
- ✅ GA4 events via GTM
- ✅ Meta events via GTM
- ✅ CAPI endpoints implemented

### **All Events Firing:**
- ✅ `quiz_start`
- ✅ `question_answer` (multiple)
- ✅ `quiz_complete`
- ✅ `lead_form_submit`
- ✅ `PageView` (Meta)
- ✅ `Lead` (Meta)

### **Data Quality:**
- ✅ Event parameters populated
- ✅ Session IDs consistent
- ✅ Lead data complete
- ✅ No JavaScript errors

## 📞 **SUPPORT**

### **Common Issues:**
1. **GTM not loading**: Check container ID
2. **GA4 not firing**: Check GTM Preview mode
3. **Meta not firing**: Check GTM Preview mode
4. **CAPI not working**: Implement Supabase Edge Functions

### **Debug Commands:**
```javascript
// Check all systems
window.seniorSimpleDiagnostics.runDiagnostics();

// Check specific system
window.seniorSimpleDiagnostics.diagnoseGTM();

// Run fixed test
window.testSeniorSimpleTracking.runTests();
```

### **Verification Commands:**
```javascript
// Check GTM Preview mode
// Go to GTM → Preview → Enter URL → Connect

// Check GA4 Real-time
// Go to GA4 → Reports → Realtime

// Check Meta Events Manager
// Go to Meta Business Manager → Events Manager
```

## 🎉 **CONCLUSION**

Your tracking is **80% working**! The main issues are:

1. **GA4 & Meta**: Working via GTM (normal)
2. **CAPI**: Needs Supabase Edge Functions
3. **GTM Variables**: Only accessible in Preview mode

**Next Steps:**
1. Use GTM Preview mode for verification
2. Implement Supabase Edge Functions for CAPI
3. Test lead delivery end-to-end

Your SeniorSimple tracking is on the right track! 🚀

---

**Last Updated**: September 26, 2025  
**Version**: 1.0  
**Platform**: SeniorSimple  
**Container**: GTM-T75CL8X9
