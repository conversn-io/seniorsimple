/**
 * Behavioral tests for the W4 location resolver + substitutor. Run with:
 *   node --experimental-strip-types src/advertorial-kit/lib/location.test.mjs
 */

import assert from 'node:assert/strict'
import {
  FALLBACK_LOCATION,
  resolveLocation,
  sanitizeGeoHeader,
  substituteLocation,
  substituteLocationDeep,
} from './location.ts'

let ok = 0
const failed = []
function test(name, fn) {
  try { fn(); ok++ } catch (e) { failed.push({ name, error: e }); }
}

// Tiny header polyfill for tests — .get(name) semantics only.
function h(map) {
  return {
    get(name) {
      return map[name.toLowerCase()] ?? null
    },
  }
}

// ---------------------------------------------------------------------------
// sanitizeGeoHeader — decoding + rejection
// ---------------------------------------------------------------------------
test('sanitizeGeoHeader: URL-decodes Vercel-style header values', () => {
  assert.equal(sanitizeGeoHeader('S%C3%A3o%20Paulo'), 'São Paulo')
})

test('sanitizeGeoHeader: trims + returns simple ASCII', () => {
  assert.equal(sanitizeGeoHeader(' Austin '), 'Austin')
})

test('sanitizeGeoHeader: rejects null / empty / undefined', () => {
  assert.equal(sanitizeGeoHeader(null), null)
  assert.equal(sanitizeGeoHeader(undefined), null)
  assert.equal(sanitizeGeoHeader(''), null)
  assert.equal(sanitizeGeoHeader('   '), null)
})

test('sanitizeGeoHeader: rejects HTML/interpolation-breaking chars', () => {
  assert.equal(sanitizeGeoHeader('<script>'), null)
  assert.equal(sanitizeGeoHeader('Aust{in'), null)
  assert.equal(sanitizeGeoHeader('Aust`in'), null)
})

test('sanitizeGeoHeader: rejects unreasonably long strings', () => {
  const huge = 'A'.repeat(100)
  assert.equal(sanitizeGeoHeader(huge), null)
})

// ---------------------------------------------------------------------------
// resolveLocation — headers → structured KitLocation
// ---------------------------------------------------------------------------
test('resolveLocation: full geo headers', () => {
  const loc = resolveLocation(h({
    'x-vercel-ip-city': 'Austin',
    'x-vercel-ip-country-region': 'TX',
    'x-vercel-ip-country': 'US',
  }))
  assert.equal(loc.city, 'Austin')
  assert.equal(loc.region, 'TX')
  assert.equal(loc.country, 'US')
  assert.equal(loc.display, 'Austin')
})

test('resolveLocation: missing city → display = FALLBACK_LOCATION', () => {
  const loc = resolveLocation(h({
    'x-vercel-ip-country-region': 'TX',
    'x-vercel-ip-country': 'US',
  }))
  assert.equal(loc.city, null)
  assert.equal(loc.display, FALLBACK_LOCATION)
  assert.equal(loc.region, 'TX')
})

test('resolveLocation: no headers at all (local dev) → all null + fallback', () => {
  const loc = resolveLocation(h({}))
  assert.equal(loc.city, null)
  assert.equal(loc.region, null)
  assert.equal(loc.country, null)
  assert.equal(loc.display, FALLBACK_LOCATION)
})

test('resolveLocation: null headers input → fallback', () => {
  const loc = resolveLocation(null)
  assert.equal(loc.display, FALLBACK_LOCATION)
})

test('resolveLocation: URL-encoded city decodes', () => {
  const loc = resolveLocation(h({ 'x-vercel-ip-city': 'S%C3%A3o%20Paulo' }))
  assert.equal(loc.display, 'São Paulo')
})

test('resolveLocation: rejects poisoned city header', () => {
  const loc = resolveLocation(h({ 'x-vercel-ip-city': '<script>' }))
  assert.equal(loc.city, null)
  assert.equal(loc.display, FALLBACK_LOCATION)
})

// ---------------------------------------------------------------------------
// substituteLocation — the token replace contract
// ---------------------------------------------------------------------------
const AUSTIN = {
  city: 'Austin', region: 'TX', country: 'US', display: 'Austin',
}
const FALLBACK = {
  city: null, region: null, country: null, display: FALLBACK_LOCATION,
}

test('substituteLocation: {{location}} → city', () => {
  const out = substituteLocation('Seniors in {{location}} qualify', AUSTIN)
  assert.equal(out, 'Seniors in Austin qualify')
})

test('substituteLocation: fallback (no city) → "your area"', () => {
  const out = substituteLocation('Seniors in {{location}} qualify', FALLBACK)
  assert.equal(out, 'Seniors in your area qualify')
})

test('substituteLocation: {{ location }} with whitespace inside braces', () => {
  assert.equal(substituteLocation('Hi {{ location }}!', AUSTIN), 'Hi Austin!')
})

test('substituteLocation: case-insensitive token', () => {
  assert.equal(substituteLocation('{{Location}} rules', AUSTIN), 'Austin rules')
  assert.equal(substituteLocation('{{LOCATION}}', AUSTIN), 'Austin')
})

test('substituteLocation: multiple tokens in one string', () => {
  const out = substituteLocation(
    'Seniors in {{location}}, {{region}} qualify — call our {{location}} office',
    AUSTIN,
  )
  assert.equal(out, 'Seniors in Austin, TX qualify — call our Austin office')
})

test('substituteLocation: {{city}} synonym', () => {
  assert.equal(substituteLocation('Live in {{city}}?', AUSTIN), 'Live in Austin?')
})

test('substituteLocation: null/undefined pass through', () => {
  assert.equal(substituteLocation(null, AUSTIN), null)
  assert.equal(substituteLocation(undefined, AUSTIN), null)
})

test('substituteLocation: unknown token → generic fallback (loud but not broken)', () => {
  // Unknown token stays as a fallback string, not the raw {{…}} token.
  const out = substituteLocation('{{locaton}} typo', AUSTIN)
  assert.ok(!out.includes('{{'), 'no raw token should leak on unknown key')
})

test('substituteLocation: strings without any token pass through untouched', () => {
  assert.equal(substituteLocation('nothing to see', AUSTIN), 'nothing to see')
})

// ---------------------------------------------------------------------------
// substituteLocationDeep — walks nested objects/arrays
// ---------------------------------------------------------------------------
test('substituteLocationDeep: nested object strings', () => {
  const input = {
    tag: 'Best of {{location}}',
    disclosure: 'sponsored',
    items: ['Are you in {{location}}?', 'Answer honestly'],
    weight: 42,
    enabled: true,
    when: null,
  }
  const out = substituteLocationDeep(input, AUSTIN)
  assert.equal(out.tag, 'Best of Austin')
  assert.equal(out.items[0], 'Are you in Austin?')
  assert.equal(out.items[1], 'Answer honestly')
  assert.equal(out.weight, 42)
  assert.equal(out.enabled, true)
  assert.equal(out.when, null)
})

test('substituteLocationDeep: returns fresh object, does not mutate input', () => {
  const input = { headline: '{{location}} seniors' }
  const out = substituteLocationDeep(input, AUSTIN)
  assert.notEqual(out, input)
  assert.equal(input.headline, '{{location}} seniors')
  assert.equal(out.headline, 'Austin seniors')
})

test('substituteLocationDeep: preserves array shape', () => {
  const out = substituteLocationDeep(
    ['a', ['b', '{{location}}'], { c: '{{location}}' }],
    AUSTIN,
  )
  assert.deepEqual(out, ['a', ['b', 'Austin'], { c: 'Austin' }])
})

test('substituteLocationDeep: null/undefined input passes through', () => {
  assert.equal(substituteLocationDeep(null, AUSTIN), null)
  assert.equal(substituteLocationDeep(undefined, AUSTIN), undefined)
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n[location.test] ok=${ok} failed=${failed.length}`)
if (failed.length) {
  for (const f of failed) {
    console.error(`  FAIL: ${f.name}\n    ${f.error?.message ?? f.error}`)
  }
  process.exit(1)
}
