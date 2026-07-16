/**
 * GET /postback/[network]
 *
 * Affiliate-network conversion postback. Called server-to-server by the network
 * when a click converts. Marks the matching advertorial_clicks row as converted
 * (idempotent by design — a second postback for the same click is a no-op),
 * which fires the after-update trigger to add revenue to advertorial_day_kpis.
 *
 * Query params (accepted names — network-specific aliases in parentheses):
 *   click_id  (sub1, clickid)  — our advertorial_clicks.id (UUID) [required]
 *   payout    (amount, sum)    — network payout amount [optional]
 *   status                     — approved | reversed [optional, defaults approved]
 *   secret                     — shared secret [required]
 *
 * Secret env vars:
 *   POSTBACK_SECRET_<NETWORK>  (e.g. POSTBACK_SECRET_PRISMIQUE)
 *   POSTBACK_SECRET            (fallback if per-network unset)
 *
 * Design: 00 - Reports/mega_listicle_backend_design_2026-07-15.md §2 postback.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getExpectedSecret,
  isKnownNetwork,
  parsePostback,
  secretsMatch,
} from '@/advertorial-kit/lib/postback'
import { getAdvertorialSupabase } from '@/advertorial-kit/lib/supabase-admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Uniform response — every failure returns the same body shape so a probe
// can't distinguish "wrong secret" from "missing click" from "unknown network"
// beyond the HTTP status we choose to expose.
function fail(status: number, code: string): NextResponse {
  return NextResponse.json({ ok: false, code }, { status })
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ network: string }> },
) {
  const { network: networkParam } = await ctx.params
  const network = (networkParam || '').toLowerCase()

  // Reject unknown networks BEFORE inspecting the secret so an attacker who
  // guesses a network name doesn't get a length-based oracle on our env vars.
  if (!isKnownNetwork(network)) {
    return fail(404, 'unknown_network')
  }

  const url = new URL(req.url)
  const suppliedSecret = url.searchParams.get('secret') || ''
  const expectedSecret = getExpectedSecret(network)

  if (!expectedSecret) {
    // Secret env var not configured — refuse to proceed rather than accept.
    return fail(503, 'secret_not_configured')
  }
  if (!secretsMatch(suppliedSecret, expectedSecret)) {
    return fail(401, 'bad_secret')
  }

  const parsed = parsePostback(network, url.searchParams)
  if (!parsed.ok) {
    return fail(400, parsed.code)
  }
  const { clickId, payout, status } = parsed.value

  const supabase = getAdvertorialSupabase()

  // Look up the click first so we can (a) 404 on unknown click_ids without
  // touching the row, and (b) detect the already-converted case (idempotency).
  const { data: click, error: clickErr } = await supabase
    .from('advertorial_clicks')
    .select('id, converted, payout, postback_raw')
    .eq('id', clickId)
    .maybeSingle()

  if (clickErr) {
    return fail(500, 'db_error')
  }
  if (!click) {
    return fail(404, 'click_not_found')
  }

  // Idempotent: same click posted twice as approved → no-op, 200 OK.
  if (click.converted && status === 'approved') {
    return NextResponse.json({ ok: true, code: 'already_converted', click_id: clickId })
  }

  const nowIso = new Date().toISOString()

  // Preserve prior postback payloads in an array under postback_raw.history so
  // debugging can see re-tries + reversals in order.
  const existingRaw = (click.postback_raw ?? {}) as Record<string, unknown>
  const history = Array.isArray(existingRaw.history)
    ? [...existingRaw.history]
    : []
  history.push({
    network,
    status,
    payout,
    query: Object.fromEntries(url.searchParams.entries()),
    received_at: nowIso,
  })
  const postbackRaw = { ...existingRaw, network, status, history }

  if (status === 'reversed') {
    // Downgrade a previously-approved conversion. Flip converted back to
    // false; the after-update trigger only reacts to false→true, so no
    // negative revenue is added — the operator should reconcile with a
    // manual adjustment in advertorial_day_kpis if needed.
    const { error: updErr } = await supabase
      .from('advertorial_clicks')
      .update({
        converted: false,
        conversion_ts: null,
        payout: null,
        postback_raw: postbackRaw,
      })
      .eq('id', clickId)
    if (updErr) return fail(500, 'db_update_failed')
    return NextResponse.json({ ok: true, code: 'reversed', click_id: clickId })
  }

  // status === 'approved': flip converted → true. The AFTER UPDATE trigger
  // (tg_advertorial_clicks_after_convert) picks up the false→true transition
  // and rolls +1 conversion + payout into advertorial_day_kpis in the same TX.
  const { error: updErr } = await supabase
    .from('advertorial_clicks')
    .update({
      converted: true,
      conversion_ts: nowIso,
      payout,
      postback_raw: postbackRaw,
    })
    .eq('id', clickId)

  if (updErr) return fail(500, 'db_update_failed')

  return NextResponse.json({
    ok: true,
    code: 'converted',
    click_id: clickId,
    payout,
  })
}
