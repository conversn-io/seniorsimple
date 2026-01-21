# Medicare Calculator Call CTA Troubleshooting

## Issue: Phone Number Not Showing on Calculator Page

### ✅ Fix Applied

The Medicare calculator page (`/calculators/medicare-costs`) now includes:
- Phone number resolution from `NEXT_PUBLIC_DEFAULT_PHONE_NUMBER`
- InterstitialCTABanner (appears at 50% scroll)
- ScrollRevealedCallButton (sticky bottom at 30% scroll)

### 🔍 Troubleshooting Steps

#### 1. Verify Environment Variable is Set

**In Local Development:**
```bash
# Check .env.local file
cat .env.local | grep NEXT_PUBLIC_DEFAULT_PHONE_NUMBER

# Should show:
NEXT_PUBLIC_DEFAULT_PHONE_NUMBER=+1XXXXXXXXXX
```

**In Production (Vercel):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `NEXT_PUBLIC_DEFAULT_PHONE_NUMBER` is set
3. Ensure it's set for the correct environment (Production, Preview, Development)

#### 2. Check Browser Console

Open browser console on `/calculators/medicare-costs` page and look for:
```
[Medicare Calculator Page] Phone number resolved: { hasPhoneNumber: true/false, ... }
```

If `hasPhoneNumber: false`, the environment variable is not being read.

#### 3. Verify Environment Variable Format

The phone number should be in E.164 format:
- ✅ Correct: `+18587524266`
- ✅ Correct: `+1 (858) 752-4266` (will be cleaned)
- ❌ Wrong: `858-752-4266` (missing country code)
- ❌ Wrong: `(858) 752-4266` (missing +1)

#### 4. Rebuild/Redeploy

After setting environment variables:
- **Local**: Restart dev server (`npm run dev`)
- **Vercel**: Redeploy the application (environment variables require a new deployment)

#### 5. Check Component Rendering

The CTAs will only render if `phoneNumber` is truthy. Check:
- Is `phoneNumber` null or undefined?
- Are the components conditionally rendered correctly?

### 🧪 Testing Checklist

1. **Environment Variable Check**
   ```bash
   # In terminal (local)
   echo $NEXT_PUBLIC_DEFAULT_PHONE_NUMBER
   
   # Should output the phone number
   ```

2. **Browser Console Check**
   - Open `/calculators/medicare-costs`
   - Check console for debug log
   - Verify `hasPhoneNumber: true`

3. **Visual Check**
   - Scroll to 30% - Should see sticky bottom call button
   - Scroll to 50% - Should see interstitial CTA banner
   - Click buttons - Should trigger call (mobile) or QR code (desktop)

4. **Network Check**
   - Open DevTools → Network tab
   - Filter by "medicare"
   - Verify no errors in API calls

### 🔧 Common Issues & Solutions

#### Issue: Environment Variable Not Available in Production

**Solution:**
1. Set variable in Vercel dashboard
2. Redeploy application
3. Environment variables prefixed with `NEXT_PUBLIC_` are available at build time

#### Issue: Phone Number Shows But CTAs Don't Appear

**Solution:**
1. Check scroll position - CTAs appear at specific scroll depths
2. Check browser console for JavaScript errors
3. Verify components are imported correctly

#### Issue: CTAs Appear But Don't Work

**Solution:**
1. Check phone number format (should be E.164: +1XXXXXXXXXX)
2. Verify `tel:` link is properly formatted
3. Test on actual mobile device (click-to-call requires mobile)

### 📝 Code Reference

**Phone Number Resolution:**
```typescript
// In src/app/calculators/medicare-costs/page.tsx
const phoneNumber = process.env.NEXT_PUBLIC_DEFAULT_PHONE_NUMBER || null;
```

**CTA Components:**
```typescript
{phoneNumber && (
  <InterstitialCTABanner phoneNumber={phoneNumber} ... />
)}
{phoneNumber && (
  <ScrollRevealedCallButton phoneNumber={phoneNumber} ... />
)}
```

### 🚀 Quick Fix Commands

```bash
# 1. Check if variable is set locally
grep NEXT_PUBLIC_DEFAULT_PHONE_NUMBER .env.local

# 2. Add to .env.local if missing
echo "NEXT_PUBLIC_DEFAULT_PHONE_NUMBER=+1XXXXXXXXXX" >> .env.local

# 3. Restart dev server
npm run dev

# 4. Test the page
open http://localhost:3000/calculators/medicare-costs
```

### 📞 Support

If issues persist:
1. Check Vercel deployment logs
2. Verify environment variables in Vercel dashboard
3. Check browser console for errors
4. Verify phone number format is correct

