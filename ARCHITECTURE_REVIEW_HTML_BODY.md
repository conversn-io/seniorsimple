# SeniorSimple Architecture Review: `html_body` vs `content` Field Usage

**Review Date:** 2025-01-XX  
**Reviewer:** Senior Architect  
**Scope:** Article content rendering consistency across codebase

---

## Executive Summary

**Current State:**
- Database schema defines only `content TEXT NOT NULL` (no `html_body` column)
- TypeScript interface includes optional `html_body?: string`
- Database verification: **0 articles have `html_body` populated** (all null/undefined)
- Main article page uses fallback: `article.html_body || article.content`
- 12+ strategy guide components use `article.content` directly
- `EnhancedArticleDisplay.tsx` uses `article.content` directly

**Recommendation:** **STANDARDIZE ON `article.content`** - Remove `html_body` from interface and main page since it doesn't exist in database.

---

## Detailed Analysis

### 1. Database Schema Reality

**Schema Definition** (`database-schema.sql`):
```sql
CREATE TABLE IF NOT EXISTS articles (
    ...
    content TEXT NOT NULL,
    ...
);
```

**No `html_body` column exists in the schema.**

**Database Verification:**
```javascript
// Sample query results:
Article 1: content length: 49, html_body: null
Article 2: content length: 4620, html_body: null  
Article 3: content length: 5369, html_body: null
```

**Conclusion:** `html_body` is **not a database field** - it's a TypeScript interface artifact with no backing data.

---

### 2. Current Code Usage

#### ✅ **Main Article Page** (`src/app/articles/[slug]/page.tsx`)
```typescript
dangerouslySetInnerHTML={{ __html: article.html_body || article.content }}
```
- **Status:** Safe (fallback works, but unnecessary)
- **Issue:** References non-existent field first

#### ✅ **Strategy Guide Components** (12 files)
- `SocialSecurityStrategyGuide.tsx`
- `MedicareCostStrategyGuide.tsx`
- `TaxImpactStrategyGuide.tsx`
- `RothConversionStrategyGuide.tsx`
- `DisabilityInsuranceStrategyGuide.tsx`
- `LongTermCareStrategyGuide.tsx`
- `HSAStrategyGuide.tsx`
- `HomeModificationPlannerStrategyGuide.tsx`
- `HealthcareCostStrategyGuide.tsx`
- `WithdrawalPlannerStrategyGuide.tsx`
- `BeneficiaryPlanningStrategyGuide.tsx`
- `TaxEfficientWithdrawalsStrategyGuide.tsx`

All use:
```typescript
dangerouslySetInnerHTML={{ __html: article.content }}
```
- **Status:** ✅ Correct (matches database reality)

#### ⚠️ **EnhancedArticleDisplay.tsx**
```typescript
dangerouslySetInnerHTML={{ __html: article.content }}
```
- **Status:** ✅ Correct (matches database reality)

---

## Architectural Decision

### Option 1: Remove `html_body` (RECOMMENDED) ⭐

**Rationale:**
- Field doesn't exist in database
- No data migration needed
- Simplifies codebase
- Eliminates confusion
- Zero risk (field is never populated)

**Changes Required:**
1. Remove `html_body?: string` from `Article` interface
2. Update main article page to use `article.content` directly
3. No changes needed to strategy guides (already correct)

**Risk Level:** 🟢 **LOW** - Field is never used, removal is safe

---

### Option 2: Keep Fallback Pattern (Future-Proofing)

**Rationale:**
- Allows future migration to `html_body` without code changes
- Maintains backward compatibility

**Changes Required:**
1. Update all 12+ strategy guide components to use `article.html_body || article.content`
2. Update `EnhancedArticleDisplay.tsx` to use fallback
3. Keep `html_body` in interface

**Risk Level:** 🟡 **MEDIUM** - Adds complexity for non-existent feature

**When to Use:** Only if `html_body` migration is planned within 30 days

---

### Option 3: Add `html_body` Column to Database

**Rationale:**
- Separates raw content from rendered HTML
- Enables content transformation pipeline

**Changes Required:**
1. Database migration: `ALTER TABLE articles ADD COLUMN html_body TEXT;`
2. Data migration: Populate `html_body` from `content` (or markdown→HTML conversion)
3. Update all components to use `article.html_body || article.content`
4. Consider deprecating `content` field long-term

**Risk Level:** 🔴 **HIGH** - Requires database migration, data transformation, and deployment coordination

**When to Use:** Only if there's a clear business need for separate HTML storage

---

## Recommended Action Plan

### Phase 1: Immediate (This Commit)

**Action:** Standardize on `article.content` everywhere

1. **Update TypeScript Interface:**
   ```typescript
   // src/lib/articles.ts
   export interface Article {
     // ... other fields
     content: string  // Remove: html_body?: string
   }
   ```

2. **Update Main Article Page:**
   ```typescript
   // src/app/articles/[slug]/page.tsx (line 114)
   dangerouslySetInnerHTML={{ __html: article.content }}
   ```

3. **No changes needed to:**
   - Strategy guide components (already correct)
   - EnhancedArticleDisplay.tsx (already correct)

**Testing:**
- Verify all article pages render correctly
- Check that no TypeScript errors are introduced
- Confirm database queries still work

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing articles | 🟢 Low | 🟢 Low | Field never populated, safe removal |
| TypeScript compilation errors | 🟢 Low | 🟡 Medium | Update interface + 1 file |
| Database query issues | 🟢 Low | 🟢 Low | No schema changes needed |
| Future feature blocked | 🟡 Medium | 🟡 Medium | Can add `html_body` later if needed |

---

## Migration Path (If `html_body` Needed Later)

If business requirements change and `html_body` is needed:

1. **Database Migration:**
   ```sql
   ALTER TABLE articles ADD COLUMN html_body TEXT;
   ```

2. **Data Migration:**
   ```sql
   -- Option A: Copy content to html_body
   UPDATE articles SET html_body = content;
   
   -- Option B: Convert markdown to HTML (if content is markdown)
   -- Requires markdown→HTML conversion script
   ```

3. **Code Update:**
   - Add `html_body?: string` back to interface
   - Update all components to use `article.html_body || article.content`

---

## Conclusion

**RECOMMENDATION: Option 1 - Remove `html_body`**

The `html_body` field is a phantom field that doesn't exist in the database. Standardizing on `article.content` will:
- ✅ Simplify the codebase
- ✅ Eliminate confusion
- ✅ Reduce maintenance burden
- ✅ Have zero risk (field never used)
- ✅ Make future migrations clearer if needed

**Approval Status:** ✅ **APPROVED FOR COMMIT**

---

## Files to Modify

1. `src/lib/articles.ts` - Remove `html_body?: string` from interface
2. `src/app/articles/[slug]/page.tsx` - Change `article.html_body || article.content` to `article.content`

**Files Already Correct (No Changes Needed):**
- All 12 strategy guide components
- `EnhancedArticleDisplay.tsx`

---

**Review Complete** ✅


