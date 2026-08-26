-- WO-843 §8 — "Analytics slice: cost per qualified call by page."
--
-- Answers the ONLY question this A/B/n test exists to answer:
--   which of the three page architectures produces the cheapest
--   duration-qualified inbound call?
--
-- NOT YET APPLIED to the CRM (jqjftrlnyysqcwbbigpw). Apply with:
--   supabase db push   — or paste into the SQL editor.
--
-- ---------------------------------------------------------------------------
-- Attribution chain
-- ---------------------------------------------------------------------------
-- ad click → page (analytics_events.properties->>'gateway')
--          → Retreaver DNI number tagged ss_gateway
--          → fet_call_facts.tags->>'ss_gateway'
--
-- Spend is attributed by ad_id: each gateway gets its own final URL per ad set
-- (WO §3A + the post-Andromeda "unique URL per ad set" rule), so an ad_id maps
-- to exactly one gateway. Where an ad_id somehow sent traffic to more than one
-- gateway, its spend is split evenly rather than double-counted — and the
-- `ambiguous_ads` column flags it so you know the number is approximate.
--
-- ⚠️ Until Retreaver campaign 50184 is UNPAUSED, calls carry no ss_gateway tag
--    and `qualified_calls` will read 0 for every gateway while `cta_clicks`
--    climbs. That is the paused-DNI signature, not a tracking bug.

-- ---------------------------------------------------------------------------
-- 1. Per-gateway page-side funnel (clicks, quiz, leads)
-- ---------------------------------------------------------------------------
create or replace view public.v_fe_gateway_page_funnel as
select
  (properties ->> 'gateway')                                     as gateway,
  (properties ->> 'gateway_label')                               as gateway_label,
  date_trunc('day', created_at)::date                            as ledger_date,
  count(*) filter (where event_name = 'page_view')               as page_views,
  count(*) filter (where event_name = 'quiz_start')              as quiz_starts,
  count(*) filter (where event_name = 'quiz_complete')           as quiz_completes,
  count(*) filter (where event_name = 'lead_submit')             as lead_submits,
  count(*) filter (where event_name = 'call_cta_click')          as cta_clicks,
  -- Click-to-call rate — the WO's secondary metric.
  round(
    100.0 * count(*) filter (where event_name = 'call_cta_click')
    / nullif(count(*) filter (where event_name = 'page_view'), 0),
    2
  )                                                              as click_to_call_pct
from public.analytics_events
where event_category = 'fe_gateway'
  and properties ->> 'gateway' is not null
group by 1, 2, 3;

comment on view public.v_fe_gateway_page_funnel is
  'WO-843: page-side funnel per FE gateway (A/B/C) per day.';

-- ---------------------------------------------------------------------------
-- 2. Per-gateway call outcomes
-- ---------------------------------------------------------------------------
-- "Qualified" = duration-qualified at 95s, matching Retreaver campaign
-- "2026 - FE Inbounds - 95s". Change the threshold HERE if the campaign's
-- billable duration changes — nothing else should hardcode it.
create or replace view public.v_fe_gateway_calls as
select
  (tags ->> 'ss_gateway')                        as gateway,
  date_trunc('day', started_at)::date            as ledger_date,
  count(*)                                       as calls,
  count(*) filter (where total_duration >= 95)   as qualified_calls,
  count(*) filter (where converted)              as converted_calls,
  sum(revenue)                                   as revenue,
  round(avg(total_duration), 1)                  as avg_duration_sec,
  -- Connect rate — secondary metric per the WO.
  round(
    100.0 * count(*) filter (where total_duration >= 95) / nullif(count(*), 0),
    2
  )                                              as qualified_rate_pct
from public.fet_call_facts
where tags ->> 'ss_gateway' is not null
group by 1, 2;

comment on view public.v_fe_gateway_calls is
  'WO-843: inbound call outcomes per FE gateway. Qualified = total_duration >= 95s.';

-- ---------------------------------------------------------------------------
-- 3. Spend attributed to each gateway, by ad_id
-- ---------------------------------------------------------------------------
create or replace view public.v_fe_gateway_spend as
with ad_to_gateway as (
  -- Which gateway(s) did each ad_id actually send traffic to?
  select distinct
    coalesce(
      properties -> 'tracking_params' ->> 'ext_ad_id',
      properties -> 'tracking_params' ->> 'rt_adid'
    )                            as ad_id,
    properties ->> 'gateway'     as gateway
  from public.analytics_events
  where event_category = 'fe_gateway'
    and event_name = 'page_view'
    and coalesce(
          properties -> 'tracking_params' ->> 'ext_ad_id',
          properties -> 'tracking_params' ->> 'rt_adid'
        ) is not null
),
ad_fanout as (
  -- An ad pointing at >1 gateway breaks clean attribution. Split its spend
  -- evenly and surface the fact rather than silently double-counting.
  select ad_id, gateway, count(*) over (partition by ad_id) as gateway_count
  from ad_to_gateway
)
select
  f.gateway,
  k.ledger_date,
  sum(k.spend / f.gateway_count)                        as spend,
  sum(k.impressions / f.gateway_count)                  as impressions,
  sum(k.clicks / f.gateway_count)                       as clicks,
  count(*) filter (where f.gateway_count > 1)           as ambiguous_ads
from public.ad_day_kpis k
join ad_fanout f on f.ad_id = k.ad_id
group by 1, 2;

comment on view public.v_fe_gateway_spend is
  'WO-843: ad spend attributed to each FE gateway via ad_id. ambiguous_ads > 0 means an ad targeted multiple gateways and its spend was split evenly.';

-- ---------------------------------------------------------------------------
-- 4. THE SLICE — cost per qualified call, by page
-- ---------------------------------------------------------------------------
create or replace view public.v_fe_gateway_cost_per_qualified_call as
select
  coalesce(p.gateway, c.gateway, s.gateway)              as gateway,
  coalesce(p.ledger_date, c.ledger_date, s.ledger_date)  as ledger_date,
  p.gateway_label,

  coalesce(s.spend, 0)                                   as spend,
  coalesce(p.page_views, 0)                              as page_views,
  coalesce(p.cta_clicks, 0)                              as cta_clicks,
  coalesce(p.lead_submits, 0)                            as lead_submits,
  p.click_to_call_pct,

  coalesce(c.calls, 0)                                   as calls,
  coalesce(c.qualified_calls, 0)                         as qualified_calls,
  c.qualified_rate_pct,
  coalesce(c.revenue, 0)                                 as revenue,

  -- ★ THE WIN METRIC. Null (not zero) when there are no qualified calls yet —
  -- an unearned 0.00 would read as "free", which is the opposite of the truth.
  round(s.spend / nullif(c.qualified_calls, 0), 2)       as cost_per_qualified_call,
  round(s.spend / nullif(p.cta_clicks, 0), 2)            as cost_per_cta_click,
  round(s.spend / nullif(p.lead_submits, 0), 2)          as cost_per_lead,
  round(
    (coalesce(c.revenue, 0) - coalesce(s.spend, 0)) / nullif(s.spend, 0),
    3
  )                                                      as roas_minus_one

from public.v_fe_gateway_page_funnel p
full outer join public.v_fe_gateway_calls c
  on c.gateway = p.gateway and c.ledger_date = p.ledger_date
full outer join public.v_fe_gateway_spend s
  on s.gateway = coalesce(p.gateway, c.gateway)
 and s.ledger_date = coalesce(p.ledger_date, c.ledger_date);

comment on view public.v_fe_gateway_cost_per_qualified_call is
  'WO-843 THE SLICE: cost per duration-qualified inbound call by gateway page (A/B/C). This decides the test.';
