/**
 * Guard: verify every magnet's `defaultArticleSlug` resolves to a published
 * article in the CMS. Fails loudly (exit 1) so CI or a cron catches renames /
 * unpublishes before they cause `slug_not_a_page` violations in
 * `v_capture_contract_compliance`.
 *
 * Usage:
 *   npm run verify:magnet-slugs
 *   # or in CI: `tsx src/scripts/verify-magnet-slugs.ts`
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { MAGNETS } from '../lib/medicare-capture-config'

config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env')
  process.exit(2)
}
const supabase = createClient(url, key)

// site_id every magnet's defaultArticleSlug must resolve against. If we ever
// add non-SeniorSimple magnets, plumb this per-magnet.
const SITE_ID = 'seniorsimple'

async function main() {
  const magnets = Object.values(MAGNETS)
  const slugs = magnets.map((m) => m.defaultArticleSlug)

  const { data, error } = await supabase
    .from('articles')
    .select('slug, status')
    .eq('site_id', SITE_ID)
    .in('slug', slugs)

  if (error) {
    console.error('Query failed:', error.message)
    process.exit(2)
  }

  const publishedSlugs = new Set(
    (data ?? []).filter((r) => r.status === 'published').map((r) => r.slug),
  )
  const foundStatuses = new Map(
    (data ?? []).map((r) => [r.slug, r.status]),
  )

  const problems: { magnetId: string; slug: string; reason: string }[] = []
  for (const m of magnets) {
    if (publishedSlugs.has(m.defaultArticleSlug)) continue
    const status = foundStatuses.get(m.defaultArticleSlug)
    problems.push({
      magnetId: m.id,
      slug: m.defaultArticleSlug,
      reason: status ? `article status='${status}' (must be 'published')` : `no article with this slug on site_id='${SITE_ID}'`,
    })
  }

  if (problems.length === 0) {
    console.log(`✓ All ${magnets.length} magnet defaultArticleSlug values resolve to published articles.`)
    process.exit(0)
  }

  console.error(`✗ ${problems.length}/${magnets.length} magnet defaultArticleSlug values are broken:`)
  for (const p of problems) {
    console.error(`  - magnet '${p.magnetId}' → '${p.slug}': ${p.reason}`)
  }
  console.error('')
  console.error('These will cause `slug_not_a_page` violations on LP direct-nav submits.')
  console.error('Fix by updating MAGNETS[*].defaultArticleSlug in src/lib/medicare-capture-config.ts')
  console.error('to a slug that exists as a published article on this site.')
  process.exit(1)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(2)
})
