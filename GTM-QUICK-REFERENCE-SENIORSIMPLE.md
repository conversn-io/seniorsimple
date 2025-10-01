# 🚀 GTM QUICK REFERENCE - SENIORSIMPLE

## 📋 **IMPORT CHECKLIST**

### **Before Import:**
- [ ] Backup current GTM configuration
- [ ] Verify access to GTM-T75CL8X9
- [ ] Have your GA4 Measurement ID ready
- [ ] Have your Meta Pixel ID ready

### **Import Process:**
1. **GTM** → **Admin** → **Import Container**
2. **Upload** → `GTM-T75CL8X9_workspace_enhanced.json`
3. **Choose** → **Merge** (recommended)
4. **Review** → Check all tags, triggers, variables
5. **Update** → Replace placeholder IDs with real values
6. **Test** → Use GTM Preview mode
7. **Publish** → Submit changes

## 🎯 **KEY CONFIGURATION**

### **Container Details:**
- **Container ID**: `GTM-T75CL8X9`
- **Account ID**: `6307234127`
- **Container Name**: `www.seniorsimple.org`

### **Required IDs:**
- **GA4 Measurement ID**: `G-XXXXXXXXXX` (Replace with your actual ID)
- **Meta Pixel ID**: `XXXXXXXXXXXXXXX` (Replace with your actual ID)

## 📊 **TRACKING EVENTS**

### **GA4 Events:**
- `quiz_start` → Quiz begins
- `question_answer` → Each question answered
- `quiz_complete` → Quiz finished
- `lead_form_submit` → Lead submitted

### **Meta Events:**
- `PageView` → Page loads
- `Lead` → Lead submitted

## 🔧 **VARIABLES TO UPDATE**

### **After Import, Update These:**
1. **GA4 Measurement ID - SeniorSimple** → Your actual GA4 ID
2. **Meta Pixel ID - SeniorSimple** → Your actual Meta Pixel ID

### **DataLayer Variables (Auto-configured):**
- `DLV - Event Category`
- `DLV - Event Label`
- `DLV - Value`
- `DLV - Session ID`
- `DLV - Funnel Type`
- `DLV - Quiz Type`
- `DLV - Question Number`
- `DLV - Question Text`
- `DLV - Answer Value`
- `DLV - Lead Score`
- `DLV - Completion Time`

## 🧪 **TESTING STEPS**

### **GTM Preview Mode:**
1. Click **Preview** in GTM
2. Enter SeniorSimple website URL
3. Navigate to quiz page
4. Start quiz → Check for `quiz_start` event
5. Answer questions → Check for `question_answer` events
6. Complete quiz → Check for `quiz_complete` event
7. Submit lead → Check for `lead_form_submit` event

### **Verification:**
- [ ] All events fire correctly
- [ ] Variables are populated
- [ ] No JavaScript errors
- [ ] GA4 Real-time shows events
- [ ] Meta Events Manager shows events

## 🚨 **COMMON ISSUES**

### **Events Not Firing:**
- Check browser console for errors
- Verify dataLayer events are being pushed
- Test in GTM Preview mode
- Check trigger conditions

### **Variables Empty:**
- Verify dataLayer variable names match
- Check that events push to dataLayer
- Test variable values in Preview mode

### **Import Fails:**
- Check JSON file format
- Verify container permissions
- Try smaller import chunks

## 📞 **SUPPORT**

If you encounter issues:
1. Check the full import guide: `GTM-IMPORT-GUIDE-SENIORSIMPLE.md`
2. Verify all IDs are correct
3. Test in GTM Preview mode
4. Check browser console for errors

---

**Quick Access:**
- **GTM Container**: https://tagmanager.google.com/#/container/accounts/6307234127/containers/226756085
- **Import File**: `GTM-T75CL8X9_workspace_enhanced.json`
- **Full Guide**: `GTM-IMPORT-GUIDE-SENIORSIMPLE.md`
