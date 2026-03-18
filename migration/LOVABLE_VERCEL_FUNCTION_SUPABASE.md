# Lovable Handoff: Vercel Function -> Supabase (`jqjftrlnyysqcwbbigpw`)

Use this only for form submit persistence.

## Goal
When quiz form submits, call a Vercel Function that writes to Supabase project `jqjftrlnyysqcwbbigpw`.

## Environment variables (Vercel)
- `SUPABASE_URL=https://jqjftrlnyysqcwbbigpw.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=<service_role_key_for_jqjftrlnyysqcwbbigpw>`

Do not expose `SUPABASE_SERVICE_ROLE_KEY` to frontend.

## Table target
Current guaranteed table in this project: `analytics_events`.

Store form payload in `properties` JSONB.

## Vercel Function (copy/paste)
Create `api/quiz-submit.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type QuizSubmitBody = {
  session_id: string;
  page_url?: string;
  referrer?: string;
  funnel_type?: string;
  site_key?: string;
  first_name?: string;
  last_name?: string;
  zip_code?: string;
  date_of_birth?: string;
  quiz_answers?: Record<string, unknown>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Missing Supabase env vars' });
  }

  const body = req.body as QuizSubmitBody;

  if (!body?.session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  const funnelType = body.funnel_type || 'final-expense-quote';
  const siteKey = body.site_key || 'seniorsimple.org';

  const { data, error } = await supabase
    .from('analytics_events')
    .insert({
      event_name: 'quiz_form_submit',
      event_category: 'lead_generation',
      event_label: funnelType,
      user_id: body.session_id,
      session_id: body.session_id,
      page_url: body.page_url || null,
      referrer: body.referrer || null,
      user_agent: req.headers['user-agent'] || null,
      ip_address:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        (req.headers['x-real-ip'] as string) ||
        null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_term: body.utm_term || null,
      utm_content: body.utm_content || null,
      properties: {
        site_key: siteKey,
        funnel_type: funnelType,
        first_name: body.first_name || null,
        last_name: body.last_name || null,
        zip_code: body.zip_code || null,
        date_of_birth: body.date_of_birth || null,
        quiz_answers: body.quiz_answers || {},
      },
    })
    .select('id')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, event_id: data.id });
}
```

## Frontend call (copy/paste)
```ts
await fetch('/api/quiz-submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id,
    page_url: window.location.href,
    referrer: document.referrer || null,
    funnel_type: 'final-expense-quote',
    site_key: 'seniorsimple.org',
    first_name,
    last_name,
    zip_code,
    date_of_birth,
    quiz_answers,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
  }),
});
```

## Notes for Lovable
- Keep function server-side on Vercel.
- Never put service role key in browser code.
- Form UX should not block on this request; submit asynchronously, then continue flow.
