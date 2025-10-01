# 🧪 SENIORSIMPLE TRACKING TEST GUIDE

## 📋 **OVERVIEW**
This guide provides comprehensive testing scripts to verify that all tracking systems (GA4, Meta, GTM, CAPI) are working correctly on the SeniorSimple platform.

## 🎯 **TESTING SCRIPTS AVAILABLE**

### **1. Basic Tracking Test (`test-seniorsimple-tracking.js`)**
- Simulates all tracking events without user interaction
- Tests DataLayer, GA4, Meta, and CAPI events
- Good for initial verification

### **2. Quiz Crawler (`test-seniorsimple-crawler.js`)**
- Automatically crawls through the quiz flow
- Simulates real user interactions
- Generates actual tracking events

### **3. Verification Script (`test-verification-script.js`)**
- Monitors and verifies all fired events
- Checks system configurations
- Generates comprehensive reports

## 🚀 **TESTING PROCEDURE**

### **Step 1: Prepare Testing Environment**

1. **Open SeniorSimple Website**
   ```
   Navigate to: https://seniorsimple.com/quiz
   ```

2. **Open Browser Console**
   - Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Go to **Console** tab

3. **Enable GTM Preview Mode**
   - Go to [Google Tag Manager](https://tagmanager.google.com)
   - Select container: `GTM-T75CL8X9`
   - Click **Preview**
   - Enter your SeniorSimple URL
   - Click **Connect**

### **Step 2: Run Basic Tracking Test**

1. **Copy and paste** `test-seniorsimple-tracking.js` into console
2. **Press Enter** to run
3. **Watch console** for event confirmations
4. **Check GA4 Real-time** reports
5. **Check Meta Events Manager**

**Expected Results:**
- ✅ 5 DataLayer events fired
- ✅ 4 GA4 events sent
- ✅ 2 Meta events sent
- ✅ 1 CAPI event sent

### **Step 3: Run Quiz Crawler**

1. **Copy and paste** `test-seniorsimple-crawler.js` into console
2. **Press Enter** to run
3. **Watch automated quiz completion**
4. **Monitor all tracking events**

**Expected Results:**
- ✅ Quiz starts automatically
- ✅ Questions answered automatically
- ✅ Quiz completes automatically
- ✅ Lead form submitted automatically
- ✅ All tracking events fired

### **Step 4: Run Verification Script**

1. **Copy and paste** `test-verification-script.js` into console
2. **Press Enter** to run
3. **Review verification report**
4. **Check for missing events**

**Expected Results:**
- ✅ All systems loaded (GTM, GA4, Meta)
- ✅ All expected events fired
- ✅ No missing events
- ✅ Verification report generated

## 📊 **VERIFICATION CHECKLIST**

### **GA4 Verification**
- [ ] **Real-time Reports**: Go to GA4 → Reports → Realtime
- [ ] **Events**: Look for `quiz_start`, `question_answer`, `quiz_complete`, `lead_form_submit`
- [ ] **Parameters**: Verify event parameters are populated
- [ ] **Session**: Check session ID matches test session

### **Meta Verification**
- [ ] **Events Manager**: Go to Meta Business Manager → Events Manager
- [ ] **Events**: Look for `PageView` and `Lead` events
- [ ] **Custom Data**: Verify custom parameters are included
- [ ] **Test Events**: Check test events are being received

### **GTM Verification**
- [ ] **Preview Mode**: Verify GTM Preview mode is active
- [ ] **Tags**: Check all tags are firing
- [ ] **Variables**: Verify variables are populated
- [ ] **Triggers**: Confirm triggers are working

### **CAPI Verification**
- [ ] **Server Logs**: Check Supabase Edge Function logs
- [ ] **Meta CAPI**: Verify CAPI events in Meta Events Manager
- [ ] **Lead Delivery**: Check GHL webhook delivery
- [ ] **Database**: Verify lead saved to Supabase

## 🔍 **TROUBLESHOOTING**

### **Common Issues**

#### **Events Not Firing**
```javascript
// Check if tracking is loaded
console.log('GTM:', typeof window.google_tag_manager !== 'undefined');
console.log('GA4:', typeof gtag !== 'undefined');
console.log('Meta:', typeof fbq !== 'undefined');
console.log('DataLayer:', window.dataLayer);
```

#### **GTM Not Loading**
- Check GTM container ID is correct
- Verify GTM script is in page source
- Check for JavaScript errors

#### **GA4 Not Sending Events**
- Verify GA4 Measurement ID
- Check gtag function is available
- Look for console errors

#### **Meta Events Not Firing**
- Verify Meta Pixel ID
- Check fbq function is available
- Look for console errors

#### **CAPI Events Not Working**
- Check Supabase Edge Function logs
- Verify environment variables
- Check API route responses

### **Debug Commands**

```javascript
// Check fired events
console.log('DataLayer Events:', window.seniorSimpleVerification.firedEvents.dataLayer);
console.log('GA4 Events:', window.seniorSimpleVerification.firedEvents.ga4);
console.log('Meta Events:', window.seniorSimpleVerification.firedEvents.meta);

// Check configurations
window.seniorSimpleVerification.checkGTM();
window.seniorSimpleVerification.checkGA4();
window.seniorSimpleVerification.checkMeta();

// Generate report
window.seniorSimpleVerification.generateReport();
```

## 📈 **EXPECTED TRACKING FLOW**

### **1. Page Load**
- ✅ `PageView` (Meta)
- ✅ `page_view` (GA4)
- ✅ GTM container loads

### **2. Quiz Start**
- ✅ `quiz_start` (DataLayer)
- ✅ `quiz_start` (GA4)
- ✅ `ViewContent` (Meta CAPI)

### **3. Question Answers**
- ✅ `question_answer` (DataLayer) - for each question
- ✅ `question_answer` (GA4) - for each question
- ✅ Question parameters included

### **4. Quiz Complete**
- ✅ `quiz_complete` (DataLayer)
- ✅ `quiz_complete` (GA4)
- ✅ Completion time tracked

### **5. Lead Submission**
- ✅ `lead_form_submit` (DataLayer)
- ✅ `lead_form_submit` (GA4)
- ✅ `Lead` (Meta)
- ✅ `Lead` (Meta CAPI)
- ✅ Lead data sent to Supabase
- ✅ Lead data sent to GHL

## 🎯 **SUCCESS CRITERIA**

### **All Systems Working**
- ✅ GTM container loaded
- ✅ GA4 events firing
- ✅ Meta events firing
- ✅ CAPI events working
- ✅ Lead delivery successful

### **All Events Fired**
- ✅ `quiz_start`
- ✅ `question_answer` (multiple)
- ✅ `quiz_complete`
- ✅ `lead_form_submit`
- ✅ `PageView` (Meta)
- ✅ `Lead` (Meta)

### **Data Quality**
- ✅ Event parameters populated
- ✅ Session IDs consistent
- ✅ Lead data complete
- ✅ No JavaScript errors

## 📞 **SUPPORT**

If you encounter issues:

1. **Check Console Errors**: Look for JavaScript errors
2. **Verify Configurations**: Ensure all IDs are correct
3. **Test in GTM Preview**: Use GTM Preview mode
4. **Check Network Tab**: Verify API calls are successful
5. **Review Server Logs**: Check Supabase Edge Function logs

## 🎉 **COMPLETION**

Once all tests pass:
- ✅ All tracking systems verified
- ✅ Events firing correctly
- ✅ Data quality confirmed
- ✅ Lead delivery working
- ✅ CAPI integration successful

Your SeniorSimple tracking is now fully operational! 🚀

---

**Last Updated**: September 26, 2025  
**Version**: 1.0  
**Platform**: SeniorSimple  
**Container**: GTM-T75CL8X9
