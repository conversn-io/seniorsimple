# 🔧 SENIORSIMPLE GTM CONFIGURATION FIXES

## 🚨 **CRITICAL GTM ISSUES TO FIX**

### **Issue 1: Remove Duplicate Meta Tag**
**Problem**: Both `Meta` and `Meta Pixel - PageView` tags exist
**Solution**: Delete the generic `Meta` tag, keep only specific Meta tags

### **Issue 2: Fix Trigger Conditions**
**Problem**: Event-specific tags not firing
**Solution**: Update trigger conditions to match correct event names

### **Issue 3: Fix Variable Configuration**
**Problem**: DataLayer Variables showing as `undefined`
**Solution**: Ensure variables are configured to read correct DataLayer properties

## 🛠️ **STEP-BY-STEP FIXES**

### **Fix 1: Remove Duplicate Meta Tag**
1. Go to GTM → Tags
2. Find the generic `Meta` tag (not `Meta Pixel - PageView`)
3. Delete it
4. Keep only:
   - `Meta Pixel - PageView`
   - `Meta Pixel - Lead`

### **Fix 2: Update GA4 Question Answer Tag**
**Current Issue**: Tag not firing
**Fix**:
1. Go to Tags → `GA4 Question Answer`
2. Check Trigger: Should be `question_answer` event
3. Verify Event Parameters:
   - `question_number`: `{{DLV - Question Number}}`
   - `question_text`: `{{DLV - Question Text}}`
   - `answer_value`: `{{DLV - Answer Value}}`
   - `quiz_type`: `{{DLV - Quiz Type}}`
   - `session_id`: `{{DLV - Session ID}}`
   - `funnel_type`: `{{DLV - Funnel Type}}`

### **Fix 3: Update GA4 Quiz Start Tag**
**Current Issue**: Tag not firing
**Fix**:
1. Go to Tags → `GA4 Quiz Start`
2. Check Trigger: Should be `quiz_start` event
3. Verify Event Parameters:
   - `quiz_type`: `{{DLV - Quiz Type}}`
   - `session_id`: `{{DLV - Session ID}}`
   - `funnel_type`: `{{DLV - Funnel Type}}`

### **Fix 4: Update GA4 Quiz Complete Tag**
**Current Issue**: Tag not firing
**Fix**:
1. Go to Tags → `GA4 Quiz Complete`
2. Check Trigger: Should be `quiz_complete` event
3. Verify Event Parameters:
   - `quiz_type`: `{{DLV - Quiz Type}}`
   - `session_id`: `{{DLV - Session ID}}`
   - `funnel_type`: `{{DLV - Funnel Type}}`
   - `completion_time`: `{{DLV - Completion Time}}`
   - `lead_score`: `{{DLV - Lead Score}}`

### **Fix 5: Update GA4 Lead Form Submit Tag**
**Current Issue**: Tag not firing
**Fix**:
1. Go to Tags → `GA4 Lead Form Submit`
2. Check Trigger: Should be `lead_form_submit` event
3. Verify Event Parameters:
   - `event_category`: `{{DLV - Event Category}}`
   - `event_label`: `{{DLV - Event Label}}`
   - `value`: `{{DLV - Value}}`
   - `quiz_type`: `{{DLV - Quiz Type}}`
   - `session_id`: `{{DLV - Session ID}}`
   - `funnel_type`: `{{DLV - Funnel Type}}`
   - `lead_score`: `{{DLV - Lead Score}}`

### **Fix 6: Update Meta Pixel Lead Tag**
**Current Issue**: Tag not firing
**Fix**:
1. Go to Tags → `Meta Pixel - Lead`
2. Check Trigger: Should be `lead_form_submit` event
3. Verify Custom HTML includes:
   ```html
   <script>
   fbq('track', 'Lead', {
     content_name: 'SeniorSimple Medicare Quiz',
     content_category: 'lead_generation',
     value: {{DLV - Value}},
     currency: 'USD'
   });
   </script>
   ```

## 🔧 **VARIABLE CONFIGURATION FIXES**

### **Fix DataLayer Variables**
Ensure all variables are configured correctly:

**DLV - Quiz Type:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `quiz_type`

**DLV - Session ID:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `session_id`

**DLV - Funnel Type:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `funnel_type`

**DLV - Question Number:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `question_number`

**DLV - Question Text:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `question_text`

**DLV - Answer Value:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `answer_value`

**DLV - Completion Time:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `completion_time`

**DLV - Lead Score:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `lead_score`

**DLV - Event Category:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `event_category`

**DLV - Event Label:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `event_label`

**DLV - Value:**
- Variable Type: Data Layer Variable
- Data Layer Variable Name: `value`

## 🎯 **TESTING PROCEDURE**

### **Step 1: Update GTM Configuration**
1. Make all the fixes above
2. Save and publish the container
3. Wait for changes to propagate

### **Step 2: Test in GTM Preview**
1. Open GTM Preview mode
2. Navigate to SeniorSimple quiz
3. Run the fixed tracking script
4. Verify each event shows populated variables
5. Check "Tags" tab for each event
6. Verify all tags are firing

### **Step 3: Verify Real-time Data**
1. Check GA4 Real-time reports
2. Verify quiz and lead events appear
3. Check Meta Events Manager
4. Verify lead events appear

## 📋 **IMPLEMENTATION CHECKLIST**

- [ ] Remove duplicate Meta tag
- [ ] Update GA4 Question Answer tag configuration
- [ ] Update GA4 Quiz Start tag configuration
- [ ] Update GA4 Quiz Complete tag configuration
- [ ] Update GA4 Lead Form Submit tag configuration
- [ ] Update Meta Pixel Lead tag configuration
- [ ] Verify all DataLayer Variables are configured
- [ ] Test in GTM Preview mode
- [ ] Verify tags are firing
- [ ] Check GA4 Real-time reports
- [ ] Check Meta Events Manager
- [ ] Test complete quiz flow

## 🚀 **EXPECTED RESULTS AFTER FIXES**

### **Working Events:**
- ✅ `quiz_start` - Fires with populated variables
- ✅ `question_answer` - Fires for each question
- ✅ `quiz_complete` - Fires with completion data
- ✅ `lead_form_submit` - Fires with lead data

### **Working Tags:**
- ✅ `GA4 Question Answer` - Sends question data
- ✅ `GA4 Quiz Start` - Sends quiz start data
- ✅ `GA4 Quiz Complete` - Sends completion data
- ✅ `GA4 Lead Form Submit` - Sends lead data
- ✅ `Meta Pixel - Lead` - Sends lead data to Meta

### **Working Variables:**
- ✅ All `DLV - *` variables populated
- ✅ No more `undefined` values
- ✅ Quiz data flowing to GA4
- ✅ Lead data flowing to Meta

---

**Priority**: CRITICAL - These fixes are essential for tracking to work
**Timeline**: Implement immediately
**Impact**: Enables full quiz and lead tracking
