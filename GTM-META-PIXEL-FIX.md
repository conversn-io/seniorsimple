# 🚨 CRITICAL GTM FIX: Missing Meta Pixel Base Configuration

## 🔍 **ISSUE IDENTIFIED:**
The `Meta Pixel - Lead` tag is trying to call `fbq('track', 'Lead', ...)` but `fbq` is not defined because there's no Meta Pixel base configuration tag.

## 🛠️ **REQUIRED FIX:**

### **Add Meta Pixel Configuration Tag to GTM:**

1. **Go to GTM → Tags → New**
2. **Tag Type**: Meta Pixel
3. **Tag Name**: `Meta Pixel - Configuration`
4. **Pixel ID**: `{{Meta Pixel ID - SeniorSimple}}` (which should be `24221789587508633`)
5. **Trigger**: All Pages (or Page View trigger)
6. **Save and Publish**

### **Alternative: Add Meta Pixel Base Code Tag:**

If Meta Pixel tag type isn't available, create an HTML tag:

**Tag Name**: `Meta Pixel - Base Code`
**Tag Type**: HTML
**HTML Content**:
```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '{{Meta Pixel ID - SeniorSimple}}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id={{Meta Pixel ID - SeniorSimple}}&ev=PageView&noscript=1"
/></noscript>
```

**Trigger**: All Pages

## 🎯 **EXPECTED RESULT:**
After adding the Meta Pixel base configuration:
- ✅ `fbq` function will be available
- ✅ `Meta Pixel - Lead` tag will fire without errors
- ✅ Lead events will appear in Meta Events Manager
- ✅ No more `fbq is not defined` errors

## 📊 **VERIFICATION:**
1. **Check browser console** - no more `fbq is not defined` errors
2. **GTM Preview mode** - `Meta Pixel - Lead` tag should fire
3. **Meta Events Manager** - Lead events should appear
4. **Test quiz completion** - lead tracking should work end-to-end

## 🚀 **PRIORITY: CRITICAL**
This fix is essential for Meta lead tracking to work properly.
