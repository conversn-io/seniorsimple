# 🎯 GTM TRACKING CONFIGURATION FOR SENIORSIMPLE

## 📋 **OVERVIEW**
This guide provides step-by-step instructions for configuring Google Tag Manager (GTM) for SeniorSimple platform with comprehensive dataLayer tracking.

## 🔧 **REQUIRED GTM SETUP**

### 1. **GTM Container Setup**
- **Container ID**: `GTM-XXXXXXX` (Replace with your actual GTM Container ID)
- **Container Name**: `SeniorSimple Platform`
- **Container Type**: Web

### 2. **Environment Variables Required**
```bash
# SeniorSimple Configuration
NEXT_PUBLIC_GA4_MEASUREMENT_ID_SENIORSIMPLE=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID_SENIORSIMPLE=your_meta_pixel_id
NEXT_PUBLIC_GTM_CONTAINER_ID_SENIORSIMPLE=GTM-XXXXXXX
```

## 📊 **GTM TAGS TO CREATE**

### **Tag 1: GA4 Configuration**
- **Tag Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: `{{GA4 Measurement ID - SeniorSimple}}`
- **Trigger**: All Pages

### **Tag 2: GA4 Lead Form Submit**
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: `{{GA4 Configuration - SeniorSimple}}`
- **Event Name**: `lead_form_submit`
- **Event Parameters**:
  - `event_category`: `{{DLV - Event Category}}`
  - `event_label`: `{{DLV - Event Label}}`
  - `value`: `{{DLV - Value}}`
  - `session_id`: `{{DLV - Session ID}}`
  - `funnel_type`: `{{DLV - Funnel Type}}`
  - `lead_score`: `{{DLV - Lead Score}}`
- **Trigger**: `Lead Form Submit`

### **Tag 3: GA4 Question Answer**
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: `{{GA4 Configuration - SeniorSimple}}`
- **Event Name**: `question_answer`
- **Event Parameters**:
  - `question_number`: `{{DLV - Question Number}}`
  - `question_text`: `{{DLV - Question Text}}`
  - `answer_value`: `{{DLV - Answer Value}}`
  - `session_id`: `{{DLV - Session ID}}`
  - `funnel_type`: `{{DLV - Funnel Type}}`
- **Trigger**: `Question Answer`

### **Tag 4: GA4 Quiz Start**
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: `{{GA4 Configuration - SeniorSimple}}`
- **Event Name**: `quiz_start`
- **Event Parameters**:
  - `quiz_type`: `{{DLV - Quiz Type}}`
  - `session_id`: `{{DLV - Session ID}}`
  - `funnel_type`: `{{DLV - Funnel Type}}`
- **Trigger**: `Quiz Start`

### **Tag 5: GA4 Quiz Complete**
- **Tag Type**: Google Analytics: GA4 Event
- **Configuration Tag**: `{{GA4 Configuration - SeniorSimple}}`
- **Event Name**: `quiz_complete`
- **Event Parameters**:
  - `quiz_type`: `{{DLV - Quiz Type}}`
  - `session_id`: `{{DLV - Session ID}}`
  - `funnel_type`: `{{DLV - Funnel Type}}`
  - `completion_time`: `{{DLV - Completion Time}}`
  - `lead_score`: `{{DLV - Lead Score}}`
- **Trigger**: `Quiz Complete`

### **Tag 6: Meta Pixel - Lead**
- **Tag Type**: Meta Pixel
- **Pixel ID**: `{{Meta Pixel ID - SeniorSimple}}`
- **Event**: Lead
- **Trigger**: `Meta Lead Event`

### **Tag 7: Meta Pixel - PageView**
- **Tag Type**: Meta Pixel
- **Pixel ID**: `{{Meta Pixel ID - SeniorSimple}}`
- **Event**: PageView
- **Trigger**: All Pages

## 🎯 **GTM TRIGGERS TO CREATE**

### **Trigger 1: Lead Form Submit**
- **Trigger Type**: Custom Event
- **Event Name**: `lead_form_submit`
- **This trigger fires on**: All Custom Events

### **Trigger 2: Question Answer**
- **Trigger Type**: Custom Event
- **Event Name**: `question_answer`
- **This trigger fires on**: All Custom Events

### **Trigger 3: Quiz Start**
- **Trigger Type**: Custom Event
- **Event Name**: `quiz_start`
- **This trigger fires on**: All Custom Events

### **Trigger 4: Quiz Complete**
- **Trigger Type**: Custom Event
- **Event Name**: `quiz_complete`
- **This trigger fires on**: All Custom Events

### **Trigger 5: Meta Lead Event**
- **Trigger Type**: Custom Event
- **Event Name**: `meta_lead_event`
- **This trigger fires on**: All Custom Events

## 📝 **GTM VARIABLES TO CREATE**

### **Built-in Variables (Enable These)**
- Click Element
- Click Text
- Click URL
- Page URL
- Page Title
- Referrer

### **Custom Variables**

#### **Variable 1: GA4 Measurement ID - SeniorSimple**
- **Variable Type**: Constant
- **Value**: `G-XXXXXXXXXX` (Your SeniorSimple GA4 Measurement ID)

#### **Variable 2: Meta Pixel ID - SeniorSimple**
- **Variable Type**: Constant
- **Value**: `XXXXXXXXXXXXXXX` (Your SeniorSimple Meta Pixel ID)

#### **Variable 3: DLV - Event Category**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `event_category`

#### **Variable 4: DLV - Event Label**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `event_label`

#### **Variable 5: DLV - Value**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `value`

#### **Variable 6: DLV - Session ID**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `session_id`

#### **Variable 7: DLV - Funnel Type**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `funnel_type`

#### **Variable 8: DLV - Quiz Type**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `quiz_type`

#### **Variable 9: DLV - Question Number**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `question_number`

#### **Variable 10: DLV - Question Text**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `question_text`

#### **Variable 11: DLV - Answer Value**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `answer_value`

#### **Variable 12: DLV - Lead Score**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `lead_score`

#### **Variable 13: DLV - Completion Time**
- **Variable Type**: Data Layer Variable
- **Data Layer Variable Name**: `completion_time`

## 🚀 **IMPLEMENTATION STEPS**

### **Step 1: Create GTM Container**
1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Create new container for SeniorSimple
3. Copy the GTM container code

### **Step 2: Add GTM to SeniorSimple**
1. Add GTM script to `src/app/layout.tsx` or `pages/_app.tsx`
2. Use the GTM container ID from environment variables

### **Step 3: Configure Tags**
1. Create all 7 tags as specified above
2. Use the variables and triggers as defined
3. Test each tag in GTM Preview mode

### **Step 4: Configure Variables**
1. Create all 13 custom variables
2. Enable the required built-in variables
3. Test variable values in GTM Preview mode

### **Step 5: Configure Triggers**
1. Create all 5 custom triggers
2. Test trigger firing in GTM Preview mode
3. Verify trigger conditions are correct

### **Step 6: Test Implementation**
1. Use GTM Preview mode to test all events
2. Verify GA4 events in Google Analytics
3. Verify Meta events in Meta Events Manager
4. Check browser console for dataLayer events

## 🔍 **TESTING CHECKLIST**

### **GA4 Events to Verify**
- [ ] `lead_form_submit` fires on lead submission
- [ ] `question_answer` fires for each question
- [ ] `quiz_start` fires when quiz begins
- [ ] `quiz_complete` fires when quiz ends
- [ ] All events include proper parameters

### **Meta Events to Verify**
- [ ] `Lead` event fires on lead submission
- [ ] `PageView` event fires on page loads
- [ ] Events include proper custom data

### **DataLayer Verification**
- [ ] All events push to dataLayer
- [ ] Variables are properly populated
- [ ] No JavaScript errors in console

## 📊 **EXPECTED DATALAYER EVENTS**

### **Lead Form Submit Event**
```javascript
dataLayer.push({
  'event': 'lead_form_submit',
  'event_category': 'lead_generation',
  'event_label': 'SeniorSimple Medicare Quiz',
  'value': 1,
  'session_id': 'session_123456789',
  'funnel_type': 'medicare',
  'lead_score': 85,
  'first_name': 'John',
  'last_name': 'Doe',
  'email': 'john@example.com',
  'phone': '+1234567890',
  'zip_code': '12345',
  'state': 'CA'
});
```

### **Question Answer Event**
```javascript
dataLayer.push({
  'event': 'question_answer',
  'question_number': 1,
  'question_text': 'What is your age?',
  'answer_value': '65-70',
  'session_id': 'session_123456789',
  'funnel_type': 'medicare'
});
```

### **Quiz Start Event**
```javascript
dataLayer.push({
  'event': 'quiz_start',
  'quiz_type': 'medicare',
  'session_id': 'session_123456789',
  'funnel_type': 'medicare'
});
```

## 🎯 **SENIORSIMPLE-SPECIFIC CONSIDERATIONS**

### **Medicare/Insurance Focus**
- Events are optimized for Medicare and insurance lead generation
- Lead scoring based on age, health status, and insurance needs
- Funnel types: `medicare`, `insurance`, `annuity`, `retirement`

### **Senior Demographics**
- Age-based targeting and tracking
- Health status considerations
- Income range tracking for insurance products

### **Lead Quality Metrics**
- Medicare eligibility scoring
- Health status assessment
- Insurance product recommendations
- Risk level classification

## 🚨 **IMPORTANT NOTES**

1. **Environment Variables**: Ensure all SeniorSimple-specific environment variables are set
2. **GTM Container**: Use the correct GTM container ID for SeniorSimple
3. **Testing**: Always test in GTM Preview mode before publishing
4. **Monitoring**: Monitor GA4 and Meta Events Manager for proper event firing
5. **Fallback**: The tracking library includes fallback mechanisms for missing environment variables

## 📞 **SUPPORT**

If you encounter issues:
1. Check browser console for JavaScript errors
2. Verify environment variables are set correctly
3. Test in GTM Preview mode
4. Check GA4 Real-time reports
5. Verify Meta Events Manager for Meta events

---

**Last Updated**: September 26, 2025  
**Version**: 1.0  
**Platform**: SeniorSimple
