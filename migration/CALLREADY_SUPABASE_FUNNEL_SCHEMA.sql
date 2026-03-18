-- CallReady Supabase Schema for Lovable Final Expense Funnel
-- Purpose: Persist session, event, and quiz data with Meta CAPI traceability.
-- Safe to run multiple times (idempotent where possible).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Session store (one row per browser session_id)
CREATE TABLE IF NOT EXISTS public.funnel_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  site_key TEXT NOT NULL DEFAULT 'seniorsimple.org',
  funnel_type TEXT NOT NULL DEFAULT 'final-expense-quote',

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  first_page_url TEXT,
  first_referrer TEXT,
  user_agent TEXT,
  ip_address INET,

  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  fbclid TEXT,
  msclkid TEXT,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funnel_sessions_site_funnel ON public.funnel_sessions(site_key, funnel_type);
CREATE INDEX IF NOT EXISTS idx_funnel_sessions_last_seen ON public.funnel_sessions(last_seen_at DESC);

-- 2) Event store (keep compatibility with current route naming)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_label TEXT,
  event_value NUMERIC,

  user_id TEXT,
  session_id TEXT,

  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,

  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,

  -- Generic event payload (step data, CTA data, etc.)
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Optional CAPI trace fields
  capi_standard_event_name TEXT,
  capi_event_id TEXT,
  capi_value NUMERIC,
  capi_currency TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure compatibility columns exist even if table pre-exists
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS properties JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS capi_standard_event_name TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS capi_event_id TEXT;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS capi_value NUMERIC;
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS capi_currency TEXT;

CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_props_gin ON public.analytics_events USING GIN (properties);
CREATE UNIQUE INDEX IF NOT EXISTS uq_analytics_events_capi_event_id
  ON public.analytics_events(capi_event_id)
  WHERE capi_event_id IS NOT NULL;

-- 3) Quiz submission store (no email/phone required)
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id TEXT UNIQUE,

  session_id TEXT NOT NULL,
  site_key TEXT NOT NULL DEFAULT 'seniorsimple.org',
  funnel_type TEXT NOT NULL DEFAULT 'final-expense-quote',

  first_name TEXT,
  last_name TEXT,
  zip_code TEXT,
  date_of_birth TEXT,

  -- Full quiz payload from frontend
  quiz_answers JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Optional enrichment
  city TEXT,
  state TEXT,
  lead_score NUMERIC,

  -- CAPI mapping for Lead event
  capi_event_id TEXT,
  capi_value NUMERIC,

  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_session_id ON public.quiz_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_submitted_at ON public.quiz_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_zip_code ON public.quiz_submissions(zip_code);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_answers_gin ON public.quiz_submissions USING GIN (quiz_answers);
CREATE UNIQUE INDEX IF NOT EXISTS uq_quiz_submissions_capi_event_id
  ON public.quiz_submissions(capi_event_id)
  WHERE capi_event_id IS NOT NULL;

-- 4) Optional dedicated CAPI dispatch log (recommended for debugging)
CREATE TABLE IF NOT EXISTS public.capi_dispatch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  site_key TEXT NOT NULL DEFAULT 'seniorsimple.org',
  funnel_type TEXT NOT NULL DEFAULT 'final-expense-quote',

  standard_event_name TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_source_url TEXT,

  value NUMERIC,
  currency TEXT DEFAULT 'USD',

  user_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  status_code INTEGER,
  success BOOLEAN,
  response_body JSONB,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id)
);

CREATE INDEX IF NOT EXISTS idx_capi_dispatch_log_session ON public.capi_dispatch_log(session_id);
CREATE INDEX IF NOT EXISTS idx_capi_dispatch_log_event_name ON public.capi_dispatch_log(standard_event_name);
CREATE INDEX IF NOT EXISTS idx_capi_dispatch_log_created ON public.capi_dispatch_log(created_at DESC);

-- 5) Upsert helper for sessions
CREATE OR REPLACE FUNCTION public.touch_funnel_session(
  p_session_id TEXT,
  p_site_key TEXT DEFAULT 'seniorsimple.org',
  p_funnel_type TEXT DEFAULT 'final-expense-quote',
  p_page_url TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL,
  p_utm_term TEXT DEFAULT NULL,
  p_utm_content TEXT DEFAULT NULL,
  p_gclid TEXT DEFAULT NULL,
  p_fbclid TEXT DEFAULT NULL,
  p_msclkid TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS public.funnel_sessions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row public.funnel_sessions;
BEGIN
  INSERT INTO public.funnel_sessions (
    session_id, site_key, funnel_type,
    first_page_url, first_referrer, user_agent, ip_address,
    utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid, msclkid,
    metadata, last_seen_at
  ) VALUES (
    p_session_id, p_site_key, p_funnel_type,
    p_page_url, p_referrer, p_user_agent, p_ip_address,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_term, p_utm_content, p_gclid, p_fbclid, p_msclkid,
    COALESCE(p_metadata, '{}'::jsonb), now()
  )
  ON CONFLICT (session_id)
  DO UPDATE SET
    last_seen_at = now(),
    -- keep first-touch page/referrer, update if missing
    first_page_url = COALESCE(public.funnel_sessions.first_page_url, EXCLUDED.first_page_url),
    first_referrer = COALESCE(public.funnel_sessions.first_referrer, EXCLUDED.first_referrer),
    user_agent = COALESCE(EXCLUDED.user_agent, public.funnel_sessions.user_agent),
    ip_address = COALESCE(EXCLUDED.ip_address, public.funnel_sessions.ip_address),
    utm_source = COALESCE(public.funnel_sessions.utm_source, EXCLUDED.utm_source),
    utm_medium = COALESCE(public.funnel_sessions.utm_medium, EXCLUDED.utm_medium),
    utm_campaign = COALESCE(public.funnel_sessions.utm_campaign, EXCLUDED.utm_campaign),
    utm_term = COALESCE(public.funnel_sessions.utm_term, EXCLUDED.utm_term),
    utm_content = COALESCE(public.funnel_sessions.utm_content, EXCLUDED.utm_content),
    gclid = COALESCE(public.funnel_sessions.gclid, EXCLUDED.gclid),
    fbclid = COALESCE(public.funnel_sessions.fbclid, EXCLUDED.fbclid),
    msclkid = COALESCE(public.funnel_sessions.msclkid, EXCLUDED.msclkid),
    metadata = COALESCE(public.funnel_sessions.metadata, '{}'::jsonb) || COALESCE(EXCLUDED.metadata, '{}'::jsonb),
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- 6) Auto-update updated_at trigger for sessions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_funnel_sessions_updated_at ON public.funnel_sessions;
CREATE TRIGGER trg_funnel_sessions_updated_at
BEFORE UPDATE ON public.funnel_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 7) Basic RLS posture: service-role writes; authenticated read optional
ALTER TABLE public.funnel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capi_dispatch_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_full_access_funnel_sessions ON public.funnel_sessions;
CREATE POLICY service_role_full_access_funnel_sessions
  ON public.funnel_sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_full_access_analytics_events ON public.analytics_events;
CREATE POLICY service_role_full_access_analytics_events
  ON public.analytics_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_full_access_quiz_submissions ON public.quiz_submissions;
CREATE POLICY service_role_full_access_quiz_submissions
  ON public.quiz_submissions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS service_role_full_access_capi_dispatch_log ON public.capi_dispatch_log;
CREATE POLICY service_role_full_access_capi_dispatch_log
  ON public.capi_dispatch_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMIT;

-- Optional verification queries:
-- SELECT to_regclass('public.funnel_sessions');
-- SELECT to_regclass('public.analytics_events');
-- SELECT to_regclass('public.quiz_submissions');
-- SELECT to_regclass('public.capi_dispatch_log');
