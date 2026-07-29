/**
 * Pure helpers for the /postback/[network] route.
 *
 * Split so we can test secret-comparison / payload parsing / idempotency logic
 * without needing Supabase.
 */

import { timingSafeEqual } from 'crypto'

// ---------------------------------------------------------------------------
// Network whitelist — the [network] path param must match this list to reach
// the DB. Prevents an attacker from probing arbitrary strings for a leaked
// per-network env var.
// ---------------------------------------------------------------------------

// Whitelist of the [network] path segment the postback URL can end with.
// This is auditability + typo-guard — the ONE shared POSTBACK_SECRET is used
// across every entry here, so adding a new network is a one-line change and
// doesn't require a new env var.
//
// Network vs platform: `network` = who owes us money (Montecito, 1up,
// Prismique, owned). `platform` = what tracker they use (Everflow, ClickGo,
// owned). Only network matters for reconciliation, so that's what we log.
export const KNOWN_NETWORKS = [
  // Networks we work with today
  'montecito',      // Everflow-hosted (RateZip reverse mortgage)
  'prismique',      // Everflow-hosted (AmericanPerksClub gift-card SOI)
  '1up',            // ClickGo-hosted
  'owned',          // our own tracker / direct S2S from any advertiser
  // Direct programs / other networks
  'maxbounty',      // AutoQuoteGuide + generic MaxBounty
  'cj',             // eHealth Medicare + generic CJ
  'debtcom',        // Debt.com direct
  'ndr',            // National Debt Relief
  'selectquote',    // SelectQuote life
  // Test network — used for local /postback verification only
  'test',
] as const

export type KnownNetwork = (typeof KNOWN_NETWORKS)[number]

export function isKnownNetwork(name: string): name is KnownNetwork {
  return (KNOWN_NETWORKS as readonly string[]).includes(name)
}

// ---------------------------------------------------------------------------
// Secret lookup + timing-safe compare.
//   Per-network secret env var: POSTBACK_SECRET_<NETWORK_UPPER>
//   Fallback:                   POSTBACK_SECRET
// ---------------------------------------------------------------------------

export function getExpectedSecret(
  network: string,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const perNetwork = env[`POSTBACK_SECRET_${network.toUpperCase()}`]
  if (perNetwork && perNetwork.length > 0) return perNetwork
  const fallback = env.POSTBACK_SECRET
  if (fallback && fallback.length > 0) return fallback
  return null
}

/**
 * Constant-time string compare so we don't leak secret length or a match
 * position via response-time side channels.
 */
export function secretsMatch(supplied: string, expected: string): boolean {
  if (typeof supplied !== 'string' || typeof expected !== 'string') return false
  // Pad both to the same length so timingSafeEqual doesn't throw on length
  // mismatch. Length itself is not sensitive after padding — the compare
  // still returns false when lengths differed originally.
  const suppliedBuf = Buffer.from(supplied, 'utf8')
  const expectedBuf = Buffer.from(expected, 'utf8')
  if (suppliedBuf.length !== expectedBuf.length) {
    // Feed timingSafeEqual equal-length buffers so it does not throw, then
    // always return false.
    const dummy = Buffer.alloc(expectedBuf.length)
    timingSafeEqual(dummy, expectedBuf)
    return false
  }
  return timingSafeEqual(suppliedBuf, expectedBuf)
}

// ---------------------------------------------------------------------------
// Payload parsing
// ---------------------------------------------------------------------------

export interface ParsedPostback {
  clickId: string
  payout: number | null            // null when not provided or unparsable
  status: string | null            // 'approved' | 'reversed' | provider-specific
  network: string
}

export interface PostbackParseError {
  ok: false
  code: 'missing_click_id' | 'invalid_click_id' | 'invalid_network' | 'bad_status'
  message: string
}

export type PostbackParseResult =
  | { ok: true; value: ParsedPostback }
  | PostbackParseError

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function parsePostback(
  network: string,
  params: URLSearchParams,
): PostbackParseResult {
  if (!isKnownNetwork(network)) {
    return { ok: false, code: 'invalid_network', message: `Unknown network: ${network}` }
  }

  const clickId = params.get('click_id') || params.get('sub1') || params.get('clickid')
  if (!clickId) {
    return { ok: false, code: 'missing_click_id', message: 'click_id (or sub1) is required' }
  }
  if (!UUID_RE.test(clickId)) {
    return { ok: false, code: 'invalid_click_id', message: 'click_id must be a UUID' }
  }

  const payoutRaw = params.get('payout') || params.get('amount') || params.get('sum')
  let payout: number | null = null
  if (payoutRaw !== null && payoutRaw !== '') {
    const parsed = Number.parseFloat(payoutRaw)
    payout = Number.isFinite(parsed) ? parsed : null
  }

  const statusRaw = (params.get('status') || '').trim().toLowerCase()
  // Accept a small allow-list; anything else (including empty) is treated as
  // 'approved' by default because most networks only fire on approval and
  // don't send a status field at all.
  const APPROVED = new Set(['', 'approved', 'confirmed', 'converted', 'paid', 'success', 'ok'])
  const REVERSED = new Set(['reversed', 'refund', 'refunded', 'chargeback', 'invalid', 'rejected'])
  let status: string | null = 'approved'
  if (REVERSED.has(statusRaw)) status = 'reversed'
  else if (APPROVED.has(statusRaw)) status = 'approved'
  else {
    // Unknown status — treat as bad request rather than silently approving.
    return { ok: false, code: 'bad_status', message: `Unrecognized status: ${statusRaw}` }
  }

  return {
    ok: true,
    value: { clickId, payout, status, network },
  }
}
