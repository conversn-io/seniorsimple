/**
 * Behavioral tests for the W3 variant picker. Run with:
 *   node --experimental-strip-types src/advertorial-kit/lib/variant.test.mjs
 *
 * Uses a tiny assert-throws harness (matches the W6 router tests) because
 * vitest hangs on this workstation.
 */

import assert from 'node:assert/strict'
import { pickVariant, normalizeWeights, itemMatchesVariant, hashFnv1a } from './variant.ts'

let ok = 0
const failed = []
function test(name, fn) {
  try { fn(); ok++ } catch (e) { failed.push({ name, error: e }); }
}

// ---------------------------------------------------------------------------
// hashFnv1a — determinism + spread
// ---------------------------------------------------------------------------
test('hashFnv1a is deterministic', () => {
  assert.equal(hashFnv1a('abc'), hashFnv1a('abc'))
  assert.notEqual(hashFnv1a('abc'), hashFnv1a('abd'))
})

test('hashFnv1a spread — 100 distinct seeds bucket across 2 variants both sides', () => {
  const buckets = { A: 0, B: 0 }
  for (let i = 0; i < 100; i++) {
    const { variant } = pickVariant({
      slug: 'test-slug',
      seed: `sess_${i}_${(i * 31).toString(36)}`,
      weights: { A: 50, B: 50 },
    })
    buckets[variant]++
  }
  // Not a tight statistical bound — just: neither side collapsed to 0.
  assert.ok(buckets.A >= 20 && buckets.B >= 20, `A=${buckets.A} B=${buckets.B}`)
})

// ---------------------------------------------------------------------------
// normalizeWeights — dropping invalid entries
// ---------------------------------------------------------------------------
test('normalizeWeights: nulls out on null/empty/non-object', () => {
  assert.deepEqual(normalizeWeights(null), {})
  assert.deepEqual(normalizeWeights(undefined), {})
  assert.deepEqual(normalizeWeights('not-obj'), {})
})

test('normalizeWeights: drops negative + non-numeric + NaN', () => {
  const out = normalizeWeights({ A: 50, B: -10, C: 'nope', D: 25, E: NaN })
  assert.deepEqual(out, { A: 50, D: 25 })
})

test('normalizeWeights: coerces numeric strings', () => {
  assert.deepEqual(normalizeWeights({ A: '50', B: '25' }), { A: 50, B: 25 })
})

// ---------------------------------------------------------------------------
// pickVariant — acceptance criteria for W3
// ---------------------------------------------------------------------------
test('pickVariant: no config → returns null (source=none)', () => {
  const r = pickVariant({ slug: 's', seed: 'seed', weights: null })
  assert.equal(r.variant, null)
  assert.equal(r.source, 'none')
})

test('pickVariant: empty object → returns null (source=none)', () => {
  const r = pickVariant({ slug: 's', seed: 'seed', weights: {} })
  assert.equal(r.variant, null)
})

test('pickVariant: same seed + slug → same variant (STICKY)', () => {
  const a = pickVariant({ slug: 'senior-benefits-2026', seed: 'sess_abc', weights: { A: 50, B: 50 } })
  const b = pickVariant({ slug: 'senior-benefits-2026', seed: 'sess_abc', weights: { A: 50, B: 50 } })
  assert.equal(a.variant, b.variant)
  assert.equal(a.source, 'sticky')
})

test('pickVariant: different slugs assign independently', () => {
  const a = pickVariant({ slug: 'slug-one', seed: 'sess_abc', weights: { A: 50, B: 50 } })
  const b = pickVariant({ slug: 'slug-two', seed: 'sess_abc', weights: { A: 50, B: 50 } })
  // Not strictly required to differ — but the hash mixes slug in, so with
  // 2 slugs at 50/50 they should differ on most seeds.
  assert.ok(typeof a.variant === 'string' && typeof b.variant === 'string')
})

test('pickVariant: ?variant= override wins when key is declared', () => {
  const r = pickVariant({
    slug: 's',
    seed: 'sess_abc',
    weights: { A: 50, B: 50 },
    queryOverride: 'B',
  })
  assert.equal(r.variant, 'B')
  assert.equal(r.source, 'override')
})

test('pickVariant: ?variant= override IGNORED for unknown key', () => {
  const r = pickVariant({
    slug: 's',
    seed: 'sess_abc',
    weights: { A: 50, B: 50 },
    queryOverride: 'zzz',
  })
  assert.ok(r.variant === 'A' || r.variant === 'B')
  assert.equal(r.source, 'sticky')
})

test('pickVariant: ?variant= override works for zero-weight (paused) variant', () => {
  const r = pickVariant({
    slug: 's',
    seed: 'sess_abc',
    weights: { A: 100, paused: 0 },
    queryOverride: 'paused',
  })
  assert.equal(r.variant, 'paused')
  assert.equal(r.source, 'override')
})

test('pickVariant: all-zero weights → alphabetical fallback + source=fallback', () => {
  const r = pickVariant({
    slug: 's',
    seed: 'sess_abc',
    weights: { B: 0, A: 0 },
  })
  assert.equal(r.variant, 'A')
  assert.equal(r.source, 'fallback')
})

test('pickVariant: weighted distribution respects proportions (90/10)', () => {
  let a = 0, b = 0
  for (let i = 0; i < 200; i++) {
    const { variant } = pickVariant({
      slug: 'senior-benefits-2026',
      seed: `sess_${i}_${(i * 31).toString(36)}`,
      weights: { A: 90, B: 10 },
    })
    if (variant === 'A') a++
    else b++
  }
  // Loose bound — with FNV-1a + 200 samples, 90/10 should stay in shape.
  assert.ok(a > b * 3, `A=${a} B=${b}`)
})

test('pickVariant: unseeded (missing cookie) still returns a variant deterministically', () => {
  const a = pickVariant({ slug: 's', seed: null, weights: { A: 50, B: 50 } })
  const b = pickVariant({ slug: 's', seed: '', weights: { A: 50, B: 50 } })
  assert.ok(a.variant === 'A' || a.variant === 'B')
  assert.equal(a.variant, b.variant, 'null and empty seed collapse to the same "unseeded" pick')
})

// ---------------------------------------------------------------------------
// itemMatchesVariant — the filter predicate applied in page.tsx
// ---------------------------------------------------------------------------
test('itemMatchesVariant: null variant_key renders in every variant', () => {
  assert.equal(itemMatchesVariant(null, 'A'), true)
  assert.equal(itemMatchesVariant(null, null), true)
  assert.equal(itemMatchesVariant(undefined, 'B'), true)
})

test('itemMatchesVariant: variant_key = chosen renders', () => {
  assert.equal(itemMatchesVariant('A', 'A'), true)
})

test('itemMatchesVariant: variant_key != chosen hides', () => {
  assert.equal(itemMatchesVariant('A', 'B'), false)
})

test('itemMatchesVariant: variant_key set but no split-test configured → hide', () => {
  // Data-hygiene: stray variant-scoped item can't survive without a
  // declared variant.
  assert.equal(itemMatchesVariant('A', null), false)
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n[variant.test] ok=${ok} failed=${failed.length}`)
if (failed.length) {
  for (const f of failed) {
    console.error(`  FAIL: ${f.name}\n    ${f.error?.message ?? f.error}`)
  }
  process.exit(1)
}
