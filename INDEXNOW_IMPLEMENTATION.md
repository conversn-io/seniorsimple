# IndexNow Implementation

This project implements the [IndexNow protocol](https://www.indexnow.org/documentation) for instant search engine notifications when content is added, updated, or deleted.

## Overview

IndexNow allows websites to instantly notify search engines (Bing, Yandex, and others) when content changes, resulting in faster indexing and better SEO performance.

## Implementation Details

### Files Created

1. **`src/lib/indexnow.ts`** - Core IndexNow functionality
   - `submitUrlToIndexNow()` - Submit single URL
   - `submitUrlsToIndexNow()` - Submit multiple URLs (up to 10,000)
   - `notifyIndexNowForContent()` - Helper for content pages
   - `notifyIndexNowForHomepage()` - Helper for key pages

2. **`src/app/api/indexnow/key/route.ts`** - Key file endpoint
   - Serves the IndexNow key file for ownership verification
   - Accessible at: `https://seniorsimple.org/api/indexnow/key`
   - Also accessible at root: `https://seniorsimple.org/{key}.txt` (via rewrite)

3. **`src/app/api/indexnow/submit/route.ts`** - Submission API
   - POST endpoint for manual URL submission
   - Supports single URL or bulk submission

### Configuration

#### Environment Variable

Set the `INDEXNOW_KEY` environment variable in your Vercel project:

```bash
INDEXNOW_KEY=your-secure-key-here
```

**Key Requirements:**
- 8-128 characters
- Can contain: lowercase (a-z), uppercase (A-Z), numbers (0-9), and dashes (-)
- Should be kept secret (only you and search engines should know it)

**Generate a secure key:**
```bash
openssl rand -hex 16
# or
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

#### Key File Location

The key file is automatically accessible at:
- `https://seniorsimple.org/api/indexnow/key`
- `https://seniorsimple.org/{INDEXNOW_KEY}.txt` (via Next.js rewrite)

## Usage

### Automatic Submission (Recommended)

When content is published or updated, automatically notify IndexNow:

```typescript
import { notifyIndexNowForContent } from '@/lib/indexnow'

// After publishing an article
await notifyIndexNowForContent('my-article-slug', 'article')

// After publishing content
await notifyIndexNowForContent('my-content-slug', 'content')
```

### Manual Submission via API

#### Single URL
```bash
curl -X POST https://seniorsimple.org/api/indexnow/submit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://seniorsimple.org/articles/my-article"}'
```

#### Multiple URLs
```bash
curl -X POST https://seniorsimple.org/api/indexnow/submit \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://seniorsimple.org/articles/article1",
      "https://seniorsimple.org/articles/article2",
      "https://seniorsimple.org/content/guide1"
    ]
  }'
```

### Programmatic Submission

```typescript
import { submitUrlToIndexNow, submitUrlsToIndexNow } from '@/lib/indexnow'

// Single URL
const results = await submitUrlToIndexNow('https://seniorsimple.org/articles/my-article')
console.log('Submitted to:', results.filter(r => r.success).length, 'search engines')

// Multiple URLs
const results = await submitUrlsToIndexNow([
  'https://seniorsimple.org/articles/article1',
  'https://seniorsimple.org/articles/article2',
])
```

## Supported Search Engines

The implementation submits to:
- **api.indexnow.org** (shared endpoint - distributes to all participating engines)
- **Bing** (`www.bing.com/indexnow`)
- **Yandex** (`yandex.com/indexnow`)

## Integration Points

### Content Publishing Workflow

When integrating with your CMS or content publishing system:

1. **After Article/Content is Published:**
   ```typescript
   // In your content publishing API route
   import { notifyIndexNowForContent } from '@/lib/indexnow'
   
   // After successful publish
   if (status === 'published') {
     await notifyIndexNowForContent(slug, 'article')
   }
   ```

2. **After Content Update:**
   ```typescript
   // In your content update API route
   import { notifyIndexNowForContent } from '@/lib/indexnow'
   
   // After successful update
   await notifyIndexNowForContent(slug, 'article')
   ```

3. **After Content Deletion:**
   ```typescript
   // IndexNow also supports deletion notifications
   import { submitUrlToIndexNow } from '@/lib/indexnow'
   
   // Notify about deleted content
   await submitUrlToIndexNow(`https://seniorsimple.org/articles/${slug}`)
   ```

## Response Codes

- **200 OK** - URL submitted successfully
- **202 Accepted** - URL received, validation pending
- **400 Bad Request** - Invalid format
- **403 Forbidden** - Key not valid
- **422 Unprocessable Entity** - URL doesn't belong to host
- **429 Too Many Requests** - Rate limit exceeded

## Best Practices

1. **Automate Submissions** - Submit URLs immediately when content is published/updated
2. **Batch Submissions** - For bulk updates, use `submitUrlsToIndexNow()` (up to 10,000 URLs)
3. **Don't Over-Submit** - Only submit when content actually changes
4. **Keep Key Secure** - Store `INDEXNOW_KEY` in environment variables, never commit to git
5. **Monitor Results** - Log submission results for debugging

## Testing

### Test Key File Access
```bash
curl https://seniorsimple.org/api/indexnow/key
# Should return your IndexNow key
```

### Test URL Submission
```bash
curl -X POST https://seniorsimple.org/api/indexnow/submit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://seniorsimple.org"}'
```

## References

- [IndexNow Documentation](https://www.indexnow.org/documentation)
- [IndexNow FAQ](https://www.indexnow.org/faq)
- [Bing IndexNow](https://www.bing.com/indexnow)



