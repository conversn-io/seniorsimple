/**
 * POST /api/advertorial-impressions
 *
 * Batched impression ingest for the position-optimization engine (SPEC
 * 2026-07-29 §Phase 2). Accepts an array of impression rows from the
 * client-side IntersectionObserver (KitImpressionTracker) and writes them
 * to publishare.advertorial_impressions with server-stamped bot/prefetch
 * classification + ip_hash.
 *
 * The client sends a JSON body:
 *   { impressions: [ImpressionInput, ...] }
 *
 * where each ImpressionInput is
 *   {
 *     advertorial_id: uuid,
 *     slot_id?: uuid | null,
 *     item_id: uuid,
 *     rank: number,          // reader-visible listicleNumber (post-suppression fix)
 *     position?: number,     // raw advertorial_items.position
 *     component_type?: string | null,
 *     variant_key?: string | null,
 *     chosen_variant?: string | null,
 *     site_id: string,
 *     session_id: string,    // ss_kit_seed cookie
 *     ts?: string,           // client-observed impression time (ISO)
 *   }
 *
 * Server responsibilities:
 *   1. Bot/prefetch classify from request headers (mirrors /out router
 *      commit 54408c5 so downstream views can filter both sides of the
 *      CTR ratio consistently).
 *   2. Compute ip_hash the same way /out does (SHA-256 of IP + Supabase URL
 *      salt) — enables CTR-by-rank joins in v_position_decay.
 *   3. Attach user_agent, ts (server) to each row.
 *   4. Batch upsert into advertorial_impressions with
 *      ON CONFLICT (session_id, item_id) DO NOTHING — the unique index
 *      enforces "one impression per session per item" even if the client
 *      double-flushes (visibilitychange + beforeunload can both fire).
 *
 * Non-blocking to the reader — the client fetch is `keepalive: true` +
 * `sendBeacon` fallback so a page nav doesn't drop the batch.
 *
 * Runtime: Node (crypto import). No caching — every request is a fresh
 * insert path.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getAdvertorialSupabase } from '@/advertorial-kit/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ImpressionInput {
  advertorial_id?: string;
  slot_id?: string | null;
  item_id?: string;
  rank?: number;
  position?: number | null;
  component_type?: string | null;
  variant_key?: string | null;
  chosen_variant?: string | null;
  site_id?: string;
  session_id?: string;
  ts?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mirrors the /out route classifier so bot/prefetch counts match on both
// sides of the CTR ratio.
const BOT_UA_RE =
  /(curl|wget|python-requests|httpx|go-http|axios|node-fetch|headless|phantom|puppeteer|playwright|bot|crawler|spider|slurp|facebookexternalhit|bingpreview|google favicon|ahrefs|semrush|dataforseo)/i;

function classifyBot(userAgent: string | null): boolean {
  if (!userAgent || !userAgent.trim()) return true;
  return BOT_UA_RE.test(userAgent);
}

function classifyPrefetch(req: NextRequest): boolean {
  const purpose = req.headers.get('purpose')?.toLowerCase() ?? '';
  const secPurpose = req.headers.get('sec-purpose')?.toLowerCase() ?? '';
  const xMoz = req.headers.get('x-moz')?.toLowerCase() ?? '';
  const xPurpose = req.headers.get('x-purpose')?.toLowerCase() ?? '';
  return (
    purpose.includes('prefetch') ||
    secPurpose.includes('prefetch') ||
    secPurpose.includes('prerender') ||
    xMoz.includes('prefetch') ||
    xPurpose.includes('preview')
  );
}

function readClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous'
  );
}

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + (process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''))
    .digest('hex');
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

function coerceRank(input: unknown): number | null {
  if (typeof input !== 'number' || !Number.isFinite(input) || input < 1) return null;
  const n = Math.floor(input);
  if (n > 10_000) return null; // sanity — advertorials rarely have >100 items
  return n;
}

function coercePosition(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input !== 'number' || !Number.isFinite(input) || input < 0) return null;
  return Math.floor(input);
}

function coerceString(input: unknown, maxLen: number): string | null {
  if (typeof input !== 'string') return null;
  const t = input.trim();
  if (!t) return null;
  return t.slice(0, maxLen);
}

export async function POST(req: NextRequest) {
  let payload: { impressions?: ImpressionInput[] };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400);
  }

  const raw = Array.isArray(payload?.impressions) ? payload.impressions : [];
  if (raw.length === 0) return json({ ok: true, inserted: 0 });
  if (raw.length > 200) {
    // Sanity — one page-view shouldn't exceed ~50 items. Reject obvious spam.
    return json({ ok: false, error: 'batch_too_large', received: raw.length }, 400);
  }

  const userAgent = req.headers.get('user-agent') ?? null;
  const ipHash = hashIp(readClientIp(req));
  const isBot = classifyBot(userAgent);
  const isPrefetch = !isBot && classifyPrefetch(req);
  const nowIso = new Date().toISOString();

  // Validate + normalize each row. Drop invalid entries silently (they'd
  // fail the DB check anyway) rather than 400 the whole batch.
  const rows = raw
    .map((r) => {
      const advertorial_id = coerceString(r.advertorial_id, 40);
      const item_id = coerceString(r.item_id, 40);
      const session_id = coerceString(r.session_id, 128);
      const site_id = coerceString(r.site_id, 64);
      const rank = coerceRank(r.rank);
      if (!advertorial_id || !UUID_RE.test(advertorial_id)) return null;
      if (!item_id || !UUID_RE.test(item_id)) return null;
      if (!session_id) return null;
      if (!site_id) return null;
      if (rank === null) return null;
      const slot_id_raw = coerceString(r.slot_id ?? '', 40);
      const slot_id = slot_id_raw && UUID_RE.test(slot_id_raw) ? slot_id_raw : null;
      return {
        advertorial_id,
        slot_id,
        item_id,
        rank,
        position: coercePosition(r.position),
        component_type: coerceString(r.component_type ?? '', 60),
        variant_key: coerceString(r.variant_key ?? '', 60),
        chosen_variant: coerceString(r.chosen_variant ?? '', 60),
        site_id,
        session_id,
        ip_hash: ipHash,
        user_agent: userAgent,
        is_bot: isBot,
        is_prefetch: isPrefetch,
        ts: nowIso,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) return json({ ok: true, inserted: 0, note: 'no_valid_rows' });

  try {
    const supabase = getAdvertorialSupabase();
    // ON CONFLICT (session_id, item_id) DO NOTHING via the unique partial
    // index — client double-flushes (visibilitychange + beforeunload both
    // fire) don't inflate counts. supabase-js upsert with ignoreDuplicates
    // matches the intent.
    const { error, count } = await supabase
      .from('advertorial_impressions')
      .upsert(rows, {
        onConflict: 'session_id,item_id',
        ignoreDuplicates: true,
        count: 'exact',
      });
    if (error) {
      console.error('[advertorial-impressions] insert failed', error, { batch_size: rows.length });
      return json({ ok: false, error: 'insert_failed', message: error.message }, 500);
    }
    return json({ ok: true, inserted: count ?? rows.length, is_bot: isBot, is_prefetch: isPrefetch });
  } catch (err) {
    console.error('[advertorial-impressions] threw', err);
    return json({ ok: false, error: 'server_error', message: (err as Error).message }, 500);
  }
}
