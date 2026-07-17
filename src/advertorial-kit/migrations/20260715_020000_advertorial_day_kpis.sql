-- ============================================================================
-- 020000 — Mega-Listicle Advertorial Backend (Phase 4)
-- Design doc: 00 - Reports/mega_listicle_backend_design_2026-07-15.md §2 postback
--
-- advertorial_day_kpis: daily rollup keyed by (ledger_date, advertorial, slot,
-- offer). Fed on-write by triggers on advertorial_clicks so no cron is needed
-- and totals never lag the click stream by more than one insert.
--
-- Join model: uses the same `ledger_date` name as ad_day_kpis (over in the CRM
-- Supabase project) so downstream analytics can join by (ledger_date, site_id)
-- when tying revenue to Meta spend. This table is authoritative for revenue;
-- ad_day_kpis is authoritative for spend.
-- ============================================================================

create table if not exists public.advertorial_day_kpis (
  id              uuid        primary key default gen_random_uuid(),
  ledger_date     date        not null,
  site_id         text        not null,
  advertorial_id  uuid        not null references public.advertorials(id)      on delete cascade,
  -- slot_id / offer_id may be NULL when a click hit the fallback URL. NULLS
  -- NOT DISTINCT (Postgres 15+) treats those nulls as equal for uniqueness so
  -- ON CONFLICT still hits one canonical "unattributed" bucket per day.
  slot_id         uuid        references public.advertorial_slots(id) on delete set null,
  offer_id        uuid        references public.affiliate_offers(id)  on delete set null,
  clicks          integer     not null default 0,
  conversions     integer     not null default 0,
  revenue         numeric     not null default 0,
  updated_at      timestamptz not null default now(),
  unique nulls not distinct (ledger_date, advertorial_id, slot_id, offer_id)
);

create index if not exists idx_advertorial_day_kpis_site_date
  on public.advertorial_day_kpis (site_id, ledger_date desc);
create index if not exists idx_advertorial_day_kpis_offer_date
  on public.advertorial_day_kpis (offer_id, ledger_date desc)
  where offer_id is not null;

alter table public.advertorial_day_kpis enable row level security;

create policy "service_role_all_advertorial_day_kpis"
  on public.advertorial_day_kpis
  for all to service_role using (true) with check (true);

create policy "authenticated_read_advertorial_day_kpis"
  on public.advertorial_day_kpis
  for select to authenticated using (true);

comment on table public.advertorial_day_kpis is
  'Daily rollup of advertorial performance keyed by (ledger_date, advertorial, slot, offer). Maintained on-write by triggers on advertorial_clicks. Join to ad_day_kpis (CRM Supabase) by ledger_date + site_id for CPL/EPC/ROAS math.';
comment on column public.advertorial_day_kpis.ledger_date is
  'UTC calendar date the click landed. Matches the ad_day_kpis.ledger_date convention.';
comment on column public.advertorial_day_kpis.site_id is
  'Denormalized from advertorials.site_id so property-slice reports do not need a join.';

-- ---------------------------------------------------------------------------
-- Upsert helper — one code path for click/conversion increments.
--   Keyed by (ledger_date, advertorial, slot, offer) via the UNIQUE NULLS NOT
--   DISTINCT constraint above, so slot_id / offer_id NULLs collapse into one
--   "unattributed" bucket per advertorial per day.
-- ---------------------------------------------------------------------------

create or replace function public.tg_advertorial_day_kpis_apply(
  p_ledger_date   date,
  p_site_id       text,
  p_advertorial   uuid,
  p_slot          uuid,
  p_offer         uuid,
  p_clicks        integer,
  p_conversions   integer,
  p_revenue       numeric
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.advertorial_day_kpis as k (
    ledger_date, site_id, advertorial_id, slot_id, offer_id,
    clicks, conversions, revenue, updated_at
  ) values (
    p_ledger_date, p_site_id, p_advertorial, p_slot, p_offer,
    coalesce(p_clicks, 0), coalesce(p_conversions, 0), coalesce(p_revenue, 0), now()
  )
  on conflict (ledger_date, advertorial_id, slot_id, offer_id)   -- NULLS NOT DISTINCT
  do update set
    clicks      = k.clicks      + coalesce(p_clicks, 0),
    conversions = k.conversions + coalesce(p_conversions, 0),
    revenue     = k.revenue     + coalesce(p_revenue, 0),
    updated_at  = now();
end;
$$;

-- ---------------------------------------------------------------------------
-- INSERT trigger — every new click bumps the day's click count.
-- ---------------------------------------------------------------------------

create or replace function public.tg_advertorial_clicks_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site text;
begin
  -- Resolve site_id from the parent advertorial (denorm target).
  select a.site_id into v_site
  from public.advertorials a
  where a.id = new.advertorial_id;

  perform public.tg_advertorial_day_kpis_apply(
    (new.ts at time zone 'UTC')::date,
    coalesce(v_site, 'unknown'),
    new.advertorial_id,
    new.slot_id,
    new.offer_id,
    1,          -- clicks
    0,          -- conversions
    0           -- revenue
  );
  return null;
end;
$$;

drop trigger if exists advertorial_clicks_after_insert on public.advertorial_clicks;
create trigger advertorial_clicks_after_insert
  after insert on public.advertorial_clicks
  for each row
  execute function public.tg_advertorial_clicks_after_insert();

-- ---------------------------------------------------------------------------
-- UPDATE trigger — when `converted` flips false → true, add the conversion +
-- payout. If the postback fires twice (idempotent by design), only the first
-- true-transition counts.
-- ---------------------------------------------------------------------------

create or replace function public.tg_advertorial_clicks_after_convert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_site text;
begin
  -- Only act on the false → true transition.
  if new.converted = true and (old.converted is null or old.converted = false) then
    select a.site_id into v_site
    from public.advertorials a
    where a.id = new.advertorial_id;

    perform public.tg_advertorial_day_kpis_apply(
      (coalesce(new.conversion_ts, new.ts) at time zone 'UTC')::date,
      coalesce(v_site, 'unknown'),
      new.advertorial_id,
      new.slot_id,
      new.offer_id,
      0,                            -- clicks (already counted at insert)
      1,                            -- conversions
      coalesce(new.payout, 0)       -- revenue
    );
  end if;
  return null;
end;
$$;

drop trigger if exists advertorial_clicks_after_convert on public.advertorial_clicks;
create trigger advertorial_clicks_after_convert
  after update of converted, payout, conversion_ts on public.advertorial_clicks
  for each row
  execute function public.tg_advertorial_clicks_after_convert();
