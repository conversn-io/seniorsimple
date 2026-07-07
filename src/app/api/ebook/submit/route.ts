import { NextRequest, NextResponse } from 'next/server';
import { callreadyQuizDb } from '@/lib/callready-quiz-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EBOOK_FUNNELS = {
  'annuity-dos-donts': "Annuity Do's and Don'ts for Baby Boomers",
  'advanced-annuity-strategies': 'Advanced Annuity Strategies',
  'retirement-made-simple': 'Retirement Made Simple',
} as const;
type EbookFunnelKey = keyof typeof EBOOK_FUNNELS;

const SENIORSIMPLE_WEBHOOK = process.env.EBOOK_SENIORSIMPLE_GHL_WEBHOOK_URL || '';
const RETIREMENT_RESCUE_WEBHOOK = process.env.EBOOK_RETIREMENT_RESCUE_GHL_WEBHOOK_URL || '';
const SLACK_WEBHOOK = process.env.SLACK_LEADS_WEBHOOK_URL || '';

// Real fires only on production Vercel deploys. Preview + local simulate.
const IS_PROD = process.env.VERCEL_ENV === 'production';

type SubmitBody = {
  funnel?: EbookFunnelKey;
  first_name?: string;
  email?: string;
  page_url?: string;
  utm_session_id?: string | null;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function tagsFor(funnel: EbookFunnelKey): string[] {
  return ['reactivation', `ebook:${funnel}`, 'source:ebook-funnel', 'site:seniorsimple'];
}

async function fireWebhook(url: string, body: unknown, label: string) {
  if (!url) return { ok: false, skipped: 'no-url', label };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.warn(`[ebook-submit] ${label} webhook returned ${res.status}`);
    return { ok: res.ok, status: res.status, label };
  } catch (err) {
    console.error(`[ebook-submit] ${label} webhook error`, err);
    return { ok: false, error: String(err), label };
  }
}

export async function POST(req: NextRequest) {
  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }

  const funnel = body.funnel;
  const email = (body.email || '').trim().toLowerCase();
  const first_name = (body.first_name || '').trim();

  if (!funnel || !EBOOK_FUNNELS[funnel]) {
    return NextResponse.json({ ok: false, error: 'invalid-funnel' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid-email' }, { status: 400 });
  }

  const ebook_title = EBOOK_FUNNELS[funnel];
  const tags = tagsFor(funnel);
  const now = new Date().toISOString();
  const page_url = body.page_url || '';

  const { error: contactErr } = await callreadyQuizDb.from('contacts').upsert(
    {
      email,
      first_name,
      source: 'ebook-funnel',
      last_activity_at: now,
      metadata: {
        ebook_funnel: funnel,
        ebook_title,
        campaign: 'list-reactivation',
        site_key: 'seniorsimple.org',
        tags,
      },
    },
    { onConflict: 'email' }
  );
  if (contactErr) console.error('[ebook-submit] contacts upsert failed', contactErr);

  const { error: eventErr } = await callreadyQuizDb.from('analytics_events').insert({
    event_name: 'ebook_submit',
    event_category: 'ebook_funnel',
    event_label: funnel,
    session_id: body.utm_session_id || null,
    page_url,
    properties: {
      funnel_type: funnel,
      ebook_title,
      campaign: 'list-reactivation',
      site_key: 'seniorsimple.org',
      email,
      first_name,
      tags,
    },
  });
  if (eventErr) console.error('[ebook-submit] analytics_events insert failed', eventErr);

  const ghlPayload = {
    first_name,
    email,
    tags,
    ebook_title,
    ebook_funnel: funnel,
    campaign: 'list-reactivation',
    site_key: 'seniorsimple.org',
    source: 'ebook-funnel',
    page_url,
    submitted_at: now,
  };

  const slackText =
    `📖 New ebook lead — *${ebook_title}*\n` +
    `• ${first_name || '(no name)'} <${email}>\n` +
    `• tags: ${tags.join(', ')}` +
    (page_url ? `\n• page: ${page_url}` : '');

  if (!IS_PROD) {
    console.log('[ebook-submit simulated]', { funnel, email, tags });
    return NextResponse.json({
      ok: true,
      simulated: true,
      would_fire: {
        seniorsimple_ghl: Boolean(SENIORSIMPLE_WEBHOOK),
        retirement_rescue_ghl: Boolean(RETIREMENT_RESCUE_WEBHOOK),
        slack: Boolean(SLACK_WEBHOOK),
      },
    });
  }

  const [ss, rr, sl] = await Promise.all([
    fireWebhook(SENIORSIMPLE_WEBHOOK, ghlPayload, 'seniorsimple'),
    fireWebhook(RETIREMENT_RESCUE_WEBHOOK, ghlPayload, 'retirement_rescue'),
    fireWebhook(SLACK_WEBHOOK, { text: slackText }, 'slack'),
  ]);

  return NextResponse.json({ ok: true, fired: { seniorsimple: ss, retirement_rescue: rr, slack: sl } });
}
