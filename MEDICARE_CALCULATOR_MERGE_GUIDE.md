# Medicare Calculator Content Merge Guide

## ✅ SEO Strategy: Preserve Existing URL

**Correct Approach**: Merge optimized content into existing `medicare-cost-calculator` URL (which has traffic/rankings) rather than creating a new canonical.

## 📊 Why This Approach

### SEO Benefits
1. **Preserves Existing Authority**: Keeps all backlinks, rankings, and traffic
2. **No Value Loss**: Doesn't abandon an established URL
3. **Consolidates Signals**: All SEO value goes to one URL
4. **Avoids Duplicate Content**: Single canonical URL
5. **Maintains Simplicity**: Shorter, cleaner URL structure

### What We're Doing
- **Existing Article** (`medicare-cost-calculator`): Gets all optimized content merged in
- **New Article** (`medicare-cost-calculator-complete-guide...`): Content merged, then deleted
- **Result**: One canonical URL with all optimized content

## 🚀 Execution Steps

### Step 1: Run SQL Merge Script

**Option A: Supabase SQL Editor (Recommended)**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/merge-medicare-calculator-content.sql`
3. Execute the script
4. Verify results

**Option B: Command Line (if you have psql access)**
```bash
psql -h [host] -U [user] -d [database] -f scripts/merge-medicare-calculator-content.sql
```

### Step 2: Verify Merge

After running the SQL script, verify:

```sql
-- Check merged article
SELECT 
  id,
  title,
  slug,
  canonical_url,
  status,
  CASE 
    WHEN content LIKE '%[EMBEDDED CALCULATOR WILL APPEAR HERE]%' THEN '✅'
    ELSE '❌'
  END as has_calculator_marker,
  CASE 
    WHEN content LIKE '%[LEAD FORM WILL APPEAR HERE]%' THEN '✅'
    ELSE '❌'
  END as has_form_marker,
  aeo_answer_first,
  schema_validated
FROM articles
WHERE id = 'ad30aeec-eee5-489d-85ba-99c584d9537a';

-- Verify duplicate is deleted
SELECT COUNT(*) as duplicate_count
FROM articles
WHERE id = '4cf33b5a-575f-499d-b4c1-f58846720b53';
-- Should return 0
```

## 📋 What Gets Merged

### Content Fields
- ✅ `content` - Full markdown content
- ✅ `html_body` - Rendered HTML
- ✅ `title` - Optimized title
- ✅ `excerpt` - Meta description

### SEO Metadata
- ✅ `meta_title` - SEO title
- ✅ `meta_description` - Meta description
- ✅ `focus_keyword` - Primary keyword
- ✅ `canonical_url` - Set to itself
- ✅ `breadcrumb_title` - Navigation title

### Social Media
- ✅ `og_title`, `og_description`, `og_image`
- ✅ `twitter_title`, `twitter_description`, `twitter_image`

### AEO Optimization
- ✅ `aeo_answer_first` - Answer-first format
- ✅ `aeo_summary` - AEO summary
- ✅ `schema_markup` - JSON-LD schema
- ✅ `schema_validated` - Validation status

### Media
- ✅ `featured_image_url` - Optimized image
- ✅ `featured_image_alt` - Alt text

## 🏗️ Content Structure

After merge, the article will have:

1. **#article Section**: Introduction and educational content
2. **Calculator Marker**: `[EMBEDDED CALCULATOR WILL APPEAR HERE]`
3. **#calculator Section**: MedicareCostCalculator component (auto-embedded)
4. **#summary Section**: Summary and next steps
5. **Form Marker**: `[LEAD FORM WILL APPEAR HERE]`
6. **#form Section**: MedicareLeadForm component (appears after calculator)

## ✅ Expected Results

### Before Merge
- ❌ Two articles with similar content
- ❌ New article has no traffic/rankings
- ❌ Duplicate content risk
- ❌ SEO value split

### After Merge
- ✅ One canonical article
- ✅ All optimized content in existing URL
- ✅ SEO value preserved and enhanced
- ✅ No duplicate content
- ✅ Proper structure with calculator/form markers

## 🔍 Verification Checklist

After running the merge:

- [ ] Existing article (`medicare-cost-calculator`) has optimized content
- [ ] Calculator marker `[EMBEDDED CALCULATOR WILL APPEAR HERE]` exists
- [ ] Form marker `[LEAD FORM WILL APPEAR HERE]` exists
- [ ] Canonical URL is `https://seniorsimple.org/medicare-cost-calculator`
- [ ] AEO fields are populated
- [ ] Schema markup is present
- [ ] Duplicate article is deleted
- [ ] Page renders correctly with calculator and form

## 📝 Files

- `scripts/merge-medicare-calculator-content.sql` - SQL script to execute
- `scripts/merge-medicare-calculator-content.sh` - Shell script (helper)
- `MEDICARE_CALCULATOR_MERGE_GUIDE.md` - This guide

## ⚠️ Important Notes

1. **Transaction Safety**: The SQL script uses `BEGIN`/`COMMIT`, so if anything fails, it rolls back
2. **Backup First**: Consider backing up articles table before running (optional but safe)
3. **Test First**: If possible, test on a staging environment first
4. **Monitor After**: Check Google Search Console after merge to ensure rankings are maintained

---

**Status**: Ready to execute  
**Strategy**: ✅ SEO-correct (preserve existing URL)  
**Next Step**: Run SQL script in Supabase SQL Editor

