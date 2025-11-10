# Featured Image Diagnosis & Fix

## Issues Identified

### 1. **Unsplash Domain Not Allowed** ✅ FIXED
- **Problem**: `https://images.unsplash.com/...` URLs are blocked by Next.js Image optimization
- **Article**: `beneficiary-planning-strategy-guide`
- **Fix**: Added `images.unsplash.com` to `remotePatterns` in `next.config.ts`

### 2. **Missing Local Image File** ⚠️ NEEDS ATTENTION
- **Problem**: `/images/webp/hero/senior-couple-tax-planning.webp` doesn't exist
- **Article**: `tax-planning-guide`
- **Database Value**: `/images/webp/hero/senior-couple-tax-planning.webp`
- **Available Files**: Only `couple-share-coffee-meeting-home-couch.webp` and `gray-hair-short-brunette-beach-breeze.webp` exist in `public/images/webp/hero/`
- **Fix Required**: Either:
  - Upload the missing image file to `public/images/webp/hero/`
  - Update the database to use an existing image
  - Generate a new image via CMS and update the article

## Current State

### Database Values
- **Beneficiary Planning**: `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop&crop=center`
- **Tax Planning**: `/images/webp/hero/senior-couple-tax-planning.webp`

### Rendering Code
- ✅ Featured image rendering logic is correct in `src/app/articles/[slug]/page.tsx`
- ✅ Uses Next.js `Image` component with proper `fill` and `priority` props
- ✅ Conditional rendering: `{article.featured_image_url && ...}`

### CMS Integration
- ⚠️ CMS form (`app/cms/new/page.tsx`) doesn't include `featured_image_url` field
- ⚠️ No visible UI for uploading/selecting featured images in CMS
- ✅ AI image generator can create featured images (via `ai-image-generator` edge function)
- ✅ Media library exists (`media_library` table) but not integrated into CMS form

## Recommendations

### Immediate Actions
1. ✅ **DONE**: Add Unsplash to `next.config.ts` remotePatterns
2. ⚠️ **TODO**: Fix missing image for Tax Planning article:
   - Option A: Upload `senior-couple-tax-planning.webp` to `public/images/webp/hero/`
   - Option B: Update database to use existing image: `/images/webp/hero/couple-share-coffee-meeting-home-couch.webp`
   - Option C: Generate new image via CMS and link to article

### Long-term Improvements
1. **Add Featured Image Field to CMS Form**
   - Add `featured_image_url` and `featured_image_alt` fields to `app/cms/new/page.tsx` and `app/cms/edit/[id]/page.tsx`
   - Integrate with media library or image uploader component
   - Allow users to:
     - Upload new images
     - Select from media library
     - Generate AI images
     - Use external URLs (with validation)

2. **Image Validation**
   - Validate image URLs before saving
   - Check if local files exist
   - Verify external URLs are accessible
   - Provide fallback images for missing files

3. **Media Library Integration**
   - Connect CMS forms to `media_library` table
   - Show preview of selected images
   - Allow browsing/searching existing images
   - Link images to articles via `article_images` table

## Testing Checklist

- [ ] Verify Unsplash images load after deployment
- [ ] Fix/upload missing Tax Planning image
- [ ] Test featured image rendering on both articles
- [ ] Verify images appear in article preview
- [ ] Check Open Graph meta tags include featured images
- [ ] Test image loading performance

## Files Modified

1. `next.config.ts` - Added `images.unsplash.com` to remotePatterns

## Next Steps

1. Deploy the `next.config.ts` change
2. Fix the missing Tax Planning image
3. Add featured image fields to CMS forms
4. Test complete workflow: CMS → Database → Rendering

