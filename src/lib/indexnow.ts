/**
 * IndexNow Implementation
 * Protocol for instant search engine notifications when content is added, updated, or deleted
 * Documentation: https://www.indexnow.org/documentation
 */

// IndexNow key - should be stored in environment variable
// Generate a secure key: 8-128 hex characters (a-z, A-Z, 0-9, dashes)
// For production, set INDEXNOW_KEY in your environment variables
// You can generate a secure key using: openssl rand -hex 16
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'seniorsimple-indexnow-key-2024'

// Canonical origin. seniorsimple.org 307-redirects to www, so every URL we submit (and the
// key file, which must sit on the same host as the URLs) uses www.
export const SITE_ORIGIN = 'https://www.seniorsimple.org'
const SITE_HOST = 'www.seniorsimple.org'
const SITE_HOSTS = new Set(['seniorsimple.org', SITE_HOST])

// Key file at the site root, the spec's default location (next.config rewrites
// /<key>.txt → /api/indexnow/key). Not under /api/, which robots.txt disallows.
// Note: a 32-hex INDEXNOW_KEY would be caught by the vercel.json /<32-hex>.txt rewrite
// (SEO-agency key route) instead — keep the key non-hex or register it there.
const KEY_LOCATION = `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`

/**
 * Canonical www form of a seniorsimple.org URL (apex or www, https), or null if the URL is
 * not on this site. IndexNow only accepts URLs on the host the key is verified for.
 */
export function canonicalizeUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null
  let u: URL
  try {
    u = new URL(input)
  } catch {
    return null
  }
  if (u.protocol !== 'https:' || !SITE_HOSTS.has(u.hostname.toLowerCase()) || u.port) return null
  u.hostname = SITE_HOST
  u.hash = ''
  const out = u.toString()
  // Bare origin: drop the trailing slash URL() adds, to match the canonical homepage URL.
  return u.pathname === '/' && !u.search ? SITE_ORIGIN : out
}

// Supported search engines that support IndexNow
const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  // Add more as they become available
]

interface IndexNowResponse {
  success: boolean
  engine: string
  status: number
  message?: string
}

/**
 * Submit a single URL to IndexNow
 */
export async function submitUrlToIndexNow(url: string): Promise<IndexNowResponse[]> {
  const results: IndexNowResponse[] = []
  const canonical = canonicalizeUrl(url)
  if (!canonical) {
    return [{ success: false, engine: 'none', status: 0, message: `Not a seniorsimple.org URL: ${url}` }]
  }
  const encodedUrl = encodeURIComponent(canonical)
  const keyLocation = KEY_LOCATION

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(
        `${endpoint}?url=${encodedUrl}&key=${INDEXNOW_KEY}&keyLocation=${encodeURIComponent(keyLocation)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      results.push({
        success: response.ok || response.status === 202,
        engine: endpoint,
        status: response.status,
        message: response.ok
          ? 'URL submitted successfully'
          : response.status === 202
          ? 'URL received, validation pending'
          : `HTTP ${response.status}`,
      })
    } catch (error) {
      results.push({
        success: false,
        engine: endpoint,
        status: 0,
        message: error instanceof Error ? error.message : 'Network error',
      })
    }
  }

  return results
}

/**
 * Submit multiple URLs to IndexNow (bulk submission)
 * Can submit up to 10,000 URLs per request
 */
export async function submitUrlsToIndexNow(
  urls: string[]
): Promise<IndexNowResponse[]> {
  if (urls.length === 0) {
    return []
  }

  // Canonicalize to www, drop off-site URLs and duplicates, then cap at the spec's 10,000.
  const canonical = Array.from(
    new Set(urls.map(canonicalizeUrl).filter((u): u is string => u !== null))
  )
  if (canonical.length === 0) {
    return []
  }
  const urlBatch = canonical.slice(0, 10000)
  const results: IndexNowResponse[] = []
  const keyLocation = KEY_LOCATION

  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: keyLocation,
    urlList: urlBatch,
  }

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      })

      results.push({
        success: response.ok || response.status === 202,
        engine: endpoint,
        status: response.status,
        message: response.ok
          ? `${urlBatch.length} URLs submitted successfully`
          : response.status === 202
          ? 'URLs received, validation pending'
          : `HTTP ${response.status}`,
      })
    } catch (error) {
      results.push({
        success: false,
        engine: endpoint,
        status: 0,
        message: error instanceof Error ? error.message : 'Network error',
      })
    }
  }

  return results
}

/**
 * Submit a content page URL when it's published or updated
 */
export async function notifyIndexNowForContent(
  slug: string,
  contentType: 'article' | 'content' = 'article'
): Promise<void> {
  const url = `${SITE_ORIGIN}/${contentType === 'article' ? 'articles' : 'content'}/${slug}`
  
  try {
    const results = await submitUrlToIndexNow(url)
    const successCount = results.filter((r) => r.success).length
    
    console.log(`📢 IndexNow: Submitted ${url} to ${successCount}/${results.length} search engines`)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('IndexNow results:', results)
    }
  } catch (error) {
    console.error('❌ IndexNow submission error:', error)
  }
}

/**
 * Submit homepage and key pages to IndexNow
 */
export async function notifyIndexNowForHomepage(): Promise<void> {
  const keyPages = [
    SITE_ORIGIN,
    `${SITE_ORIGIN}/retirement`,
    `${SITE_ORIGIN}/estate`,
    `${SITE_ORIGIN}/tax`,
    `${SITE_ORIGIN}/insurance`,
    `${SITE_ORIGIN}/housing`,
  ]

  try {
    const results = await submitUrlsToIndexNow(keyPages)
    const successCount = results.filter((r) => r.success).length
    
    console.log(`📢 IndexNow: Submitted ${keyPages.length} key pages to ${successCount}/${results.length} search engines`)
  } catch (error) {
    console.error('❌ IndexNow bulk submission error:', error)
  }
}

/**
 * Submit article URLs to IndexNow (matches ParentSimple pattern)
 * Submits both /articles/[slug] and /content/[slug] URLs
 */
export async function submitArticleToIndexNow(slug: string): Promise<{ success: boolean; errors: string[] }> {
  const urls = [
    `${SITE_ORIGIN}/articles/${slug}`,
    `${SITE_ORIGIN}/content/${slug}`,
  ]
  
  try {
    const results = await submitUrlsToIndexNow(urls)
    const successCount = results.filter((r) => r.success).length
    const errors = results
      .filter((r) => !r.success)
      .map((r) => `${r.engine}: ${r.message || `HTTP ${r.status}`}`)
    
    return {
      success: successCount > 0,
      errors: errors,
    }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
    }
  }
}

/**
 * Get the IndexNow key (for key file generation)
 */
export function getIndexNowKey(): string {
  return INDEXNOW_KEY
}

