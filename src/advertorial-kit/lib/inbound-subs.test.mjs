/**
 * Behavioral tests for the server-side inbound-subs reader + URL appender.
 * Run with:
 *   node --experimental-strip-types src/advertorial-kit/lib/inbound-subs.test.mjs
 */

import assert from 'node:assert/strict'
import { readInboundSubsFromSearchParams, appendInboundSubs } from './inbound-subs.ts'

let ok = 0
const failed = []
function test(name, fn) {
  try { fn(); ok++ } catch (e) { failed.push({ name, error: e }) }
}

// ---------------------------------------------------------------------------
// readInboundSubsFromSearchParams — alias priority + empties + macros
// ---------------------------------------------------------------------------
test('null / undefined searchParams → all null', () => {
  assert.deepEqual(readInboundSubsFromSearchParams(null), { s2: null, s4: null, s5: null, s6: null, s8: null })
  assert.deepEqual(readInboundSubsFromSearchParams(undefined), { s2: null, s4: null, s5: null, s6: null, s8: null })
})

test('empty record → all null', () => {
  assert.deepEqual(readInboundSubsFromSearchParams({}), { s2: null, s4: null, s5: null, s6: null, s8: null })
})

test('source → s2', () => {
  const r = readInboundSubsFromSearchParams({ source: 'newsbreak' })
  assert.equal(r.s2, 'newsbreak')
})

test('s2 canonical wins over source when both present', () => {
  const r = readInboundSubsFromSearchParams({ source: 'newsbreak', s2: 'taboola' })
  // first(source, s2) — source wins because it's listed first in the aliases
  // (matches client-side reader semantics exactly). Documented behavior.
  assert.equal(r.s2, 'newsbreak')
})

test('hook alias → s4', () => {
  assert.equal(readInboundSubsFromSearchParams({ hook: 'home_equity' }).s4, 'home_equity')
})

test('s4 canonical → s4', () => {
  assert.equal(readInboundSubsFromSearchParams({ s4: 'medicare' }).s4, 'medicare')
})

test('placement / audience → s6', () => {
  assert.equal(readInboundSubsFromSearchParams({ placement: 'ios' }).s6, 'ios')
  assert.equal(readInboundSubsFromSearchParams({ audience: 'lookalike_1' }).s6, 'lookalike_1')
})

test('network click-id macros → s8', () => {
  assert.equal(readInboundSubsFromSearchParams({ ob_click_id: 'abc123' }).s8, 'abc123')
  assert.equal(readInboundSubsFromSearchParams({ tblci: 'tab-xyz' }).s8, 'tab-xyz')
  assert.equal(readInboundSubsFromSearchParams({ rcid: 'rev-999' }).s8, 'rev-999')
  assert.equal(readInboundSubsFromSearchParams({ realize_click_id: 'realize-1' }).s8, 'realize-1')
})

test('array-shaped searchParams value takes the first entry', () => {
  const r = readInboundSubsFromSearchParams({ source: ['newsbreak', 'ignored'] })
  assert.equal(r.s2, 'newsbreak')
})

test('trims whitespace', () => {
  assert.equal(readInboundSubsFromSearchParams({ s4: '  home_equity  ' }).s4, 'home_equity')
})

test('drops empty string', () => {
  assert.equal(readInboundSubsFromSearchParams({ s4: '   ' }).s4, null)
  assert.equal(readInboundSubsFromSearchParams({ s4: '' }).s4, null)
})

test('drops unsubstituted network macros ($ANYTHING$)', () => {
  assert.equal(readInboundSubsFromSearchParams({ source: '$NETWORK$' }).s2, null)
  assert.equal(readInboundSubsFromSearchParams({ ob_click_id: '$OBCLICKID$' }).s8, null)
})

test('non-string values ignored', () => {
  assert.equal(readInboundSubsFromSearchParams({ source: undefined }).s2, null)
  assert.equal(readInboundSubsFromSearchParams({ source: null }).s2, null)
})

test('does NOT read s7 (variant is owned by picker) or click_id', () => {
  const r = readInboundSubsFromSearchParams({ s7: 'A', variant: 'B', click_id: 'X', sub1: 'Y' })
  // Only the 5 propagatable subs are surfaced:
  assert.deepEqual(Object.keys(r).sort(), ['s2', 's4', 's5', 's6', 's8'])
})

// ---------------------------------------------------------------------------
// appendInboundSubs — URL rewrite rules
// ---------------------------------------------------------------------------
test('null / empty subs → URL unchanged', () => {
  assert.equal(appendInboundSubs('/out/x/1?component=listicle_entry', null), '/out/x/1?component=listicle_entry')
  assert.equal(appendInboundSubs('/out/x/1?component=listicle_entry', { s2: null, s4: null, s5: null, s6: null, s8: null }), '/out/x/1?component=listicle_entry')
})

test('appends non-empty subs, skips nulls; s2 is written as `source=`', () => {
  const out = appendInboundSubs('/out/x/1?component=listicle_entry', {
    s2: 'newsbreak', s4: 'home_equity', s5: null, s6: null, s8: null,
  })
  const qs = new URLSearchParams(out.split('?')[1])
  assert.equal(qs.get('component'), 'listicle_entry')
  // Router's captureQueryTracking reads `source` (NOT `s2`) as the s2
  // alias — writing `s2=` here would be silently dropped when it hits /out.
  assert.equal(qs.get('source'), 'newsbreak')
  assert.equal(qs.get('s2'), null)
  assert.equal(qs.get('s4'), 'home_equity')
  assert.equal(qs.get('s5'), null)
})

test('does not clobber `source` already set on the URL', () => {
  const out = appendInboundSubs('/out/x/1?component=listicle_entry&source=preset', {
    s2: 'newsbreak', s4: null, s5: null, s6: null, s8: null,
  })
  const qs = new URLSearchParams(out.split('?')[1])
  assert.equal(qs.get('source'), 'preset')
})

test('bare-path URL (no query) still gets subs (source= from s2)', () => {
  const out = appendInboundSubs('/out/x/1', { s2: 'newsbreak', s4: null, s5: null, s6: null, s8: null })
  assert.equal(out, '/out/x/1?source=newsbreak')
})

test('all 5 subs at once — s2 as source, rest canonical', () => {
  const out = appendInboundSubs('/out/x/1?component=hero', {
    s2: 'newsbreak', s4: 'home_equity', s5: 'creative_A', s6: 'ios', s8: 'tab-xyz',
  })
  const qs = new URLSearchParams(out.split('?')[1])
  assert.equal(qs.get('source'), 'newsbreak')
  assert.equal(qs.get('s4'), 'home_equity')
  assert.equal(qs.get('s5'), 'creative_A')
  assert.equal(qs.get('s6'), 'ios')
  assert.equal(qs.get('s8'), 'tab-xyz')
  assert.equal(qs.get('component'), 'hero')
})

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n[inbound-subs.test] ok=${ok} failed=${failed.length}`)
if (failed.length) {
  for (const f of failed) console.error(`  FAIL: ${f.name}\n    ${f.error?.message ?? f.error}`)
  process.exit(1)
}
