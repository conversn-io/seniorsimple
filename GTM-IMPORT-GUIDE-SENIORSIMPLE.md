# 🎯 GTM IMPORT GUIDE FOR SENIORSIMPLE

## 📋 **OVERVIEW**
This guide will help you import the enhanced GTM configuration for SeniorSimple with comprehensive tracking setup.

## 🔧 **PRE-IMPORT CHECKLIST**

### **1. Backup Current Configuration**
- Go to GTM Container: `GTM-T75CL8X9`
- Navigate to **Versions** → **Create Version**
- Name it: `Backup - Before Enhanced Import`
- Click **Save**

### **2. Verify Container Access**
- Ensure you have **Edit** permissions on `GTM-T75CL8X9`
- Container should be: `www.seniorsimple.org`
- Account ID: `6307234127`

## 📥 **IMPORT STEPS**

### **Step 1: Access GTM Import**
1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Select your account: `6307234127`
3. Select container: `GTM-T75CL8X9`
4. Click **Admin** → **Import Container**

### **Step 2: Upload Enhanced Configuration**
1. Click **Choose Container File**
2. Select: `GTM-T75CL8X9_workspace_enhanced.json`
3. Choose **Merge** (recommended) or **Overwrite**
4. Click **Continue**

### **Step 3: Review Import Preview**
The import will show these changes:

#### **New Tags (7 total):**
- ✅ **GA4 Configuration - SeniorSimple** (Tag ID: 12)
- ✅ **GA4 Lead Form Submit** (Tag ID: 13)
- ✅ **GA4 Question Answer** (Tag ID: 14)
- ✅ **GA4 Quiz Start** (Tag ID: 15)
- ✅ **GA4 Quiz Complete** (Tag ID: 16)
- ✅ **Meta Pixel - Lead** (Tag ID: 17)
- ✅ **Meta Pixel - PageView** (Tag ID: 18)

#### **New Triggers (5 total):**
- ✅ **Lead Form Submit** (Trigger ID: 20)
- ✅ **Question Answer** (Trigger ID: 21)
- ✅ **Quiz Start** (Trigger ID: 22)
- ✅ **Quiz Complete** (Trigger ID: 23)
- ✅ **Meta Lead Event** (Trigger ID: 24)

#### **New Variables (13 total):**
- ✅ **GA4 Measurement ID - SeniorSimple** (Variable ID: 4)
- ✅ **Meta Pixel ID - SeniorSimple** (Variable ID: 5)
- ✅ **DLV - Event Category** (Variable ID: 6)
- ✅ **DLV - Event Label** (Variable ID: 7)
- ✅ **DLV - Value** (Variable ID: 8)
- ✅ **DLV - Session ID** (Variable ID: 9)
- ✅ **DLV - Funnel Type** (Variable ID: 10)
- ✅ **DLV - Quiz Type** (Variable ID: 11)
- ✅ **DLV - Question Number** (Variable ID: 12)
- ✅ **DLV - Question Text** (Variable ID: 13)
- ✅ **DLV - Answer Value** (Variable ID: 14)
- ✅ **DLV - Lead Score** (Variable ID: 15)
- ✅ **DLV - Completion Time** (Variable ID: 16)

### **Step 4: Configure Variables**
After import, update these variables with your actual values:

#### **GA4 Measurement ID - SeniorSimple**
- Current: `G-N2K9G79RE5`
- Update to: Your actual SeniorSimple GA4 Measurement ID

#### **Meta Pixel ID - SeniorSimple**
- Current: `24221789587508633`
- Update to: Your actual SeniorSimple Meta Pixel ID

### **Step 5: Test Configuration**
1. Click **Preview** in GTM
2. Enter your SeniorSimple website URL
3. Test the quiz flow:
   - Start quiz → Should fire `quiz_start` event
   - Answer questions → Should fire `question_answer` events
   - Complete quiz → Should fire `quiz_complete` event
   - Submit lead → Should fire `lead_form_submit` event

### **Step 6: Publish Changes**
1. Click **Submit** in GTM
2. Version name: `Enhanced Tracking - SeniorSimple`
3. Version description: `Added comprehensive GA4 and Meta tracking for SeniorSimple quiz`
4. Click **Publish**

## 🔍 **VERIFICATION CHECKLIST**

### **GA4 Events to Verify:**
- [ ] `quiz_start` fires when quiz begins
- [ ] `question_answer` fires for each question
- [ ] `quiz_complete` fires when quiz ends
- [ ] `lead_form_submit` fires on lead submission
- [ ] All events include proper parameters

### **Meta Events to Verify:**
- [ ] `PageView` fires on page loads
- [ ] `Lead` event fires on lead submission
- [ ] Events include custom data

### **DataLayer Verification:**
- [ ] All events push to dataLayer
- [ ] Variables are properly populated
- [ ] No JavaScript errors in console

## 🎯 **EXPECTED DATALAYER EVENTS**

### **Quiz Start Event:**
```javascript
dataLayer.push({
  'event': 'quiz_start',
  'quiz_type': 'annuity',
  'session_id': 'quiz_1234567890_abcdef',
  'funnel_type': 'annuity'
});
```

### **Question Answer Event:**
```javascript
dataLayer.push({
  'event': 'question_answer',
  'question_number': 1,
  'question_text': 'Do you have a minimum of at least $100,000 or more in investable assets?',
  'answer_value': 'Yes, I have $100,000 or more',
  'session_id': 'quiz_1234567890_abcdef',
  'funnel_type': 'annuity'
});
```

### **Lead Form Submit Event:**
```javascript
dataLayer.push({
  'event': 'lead_form_submit',
  'event_category': 'lead_generation',
  'event_label': 'SeniorSimple Medicare Quiz',
  'value': 1,
  'session_id': 'quiz_1234567890_abcdef',
  'funnel_type': 'annuity',
  'lead_score': 85
});
```

## 🚨 **IMPORTANT NOTES**

1. **Backup First**: Always backup your current configuration before importing
2. **Test Thoroughly**: Use GTM Preview mode to test all events
3. **Update IDs**: Replace placeholder IDs with your actual GA4 and Meta Pixel IDs
4. **Monitor**: Check GA4 Real-time reports and Meta Events Manager after deployment

## 📞 **TROUBLESHOOTING**

### **If Import Fails:**
1. Check file format (must be valid JSON)
2. Verify container permissions
3. Try importing in smaller chunks

### **If Events Don't Fire:**
1. Check browser console for JavaScript errors
2. Verify dataLayer events are being pushed
3. Test in GTM Preview mode
4. Check trigger conditions

### **If Variables Are Empty:**
1. Verify dataLayer variable names match exactly
2. Check that events are pushing to dataLayer
3. Test variable values in GTM Preview mode

## 🎉 **SUCCESS INDICATORS**

- ✅ All 7 tags are active and firing
- ✅ All 5 triggers are working correctly
- ✅ All 13 variables are populated
- ✅ GA4 events appear in Real-time reports
- ✅ Meta events appear in Events Manager
- ✅ No JavaScript errors in console

---

**Last Updated**: September 26, 2025  
**Version**: 1.0  
**Platform**: SeniorSimple  
**Container**: GTM-T75CL8X9
