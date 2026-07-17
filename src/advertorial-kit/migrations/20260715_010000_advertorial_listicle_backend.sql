-- ============================================================================
-- 010000 — Mega-Listicle Advertorial Backend (Phase 1)
-- Design doc: 00 - Reports/mega_listicle_backend_design_2026-07-15.md
--
-- Four tables that back the /lp/[slug] listicle + /out/[slug]/[slot] click
-- router + /postback conversion pipeline. Shared utility: same schema serves
-- SeniorSimple, MoneySimple, RateRoots — scoped per property by site_id.
--
-- Ordering: slots is created before items so items.slot_id FK resolves.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) advertorials — the listicle page itself
-- ---------------------------------------------------------------------------
create table if not exists public.advertorials (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  site_id           text not null default 'seniorsimple',
  title             text not null,
  headline          text not null,
  subhead           text,
  intro_md          text,
  hero_image_url    text,
  framing           text not null default 'senior-benefits',
  status            text not null default 'draft'
                    check (status in ('draft','live','paused','archived')),
  compliance_state  text not null default 'flag_and_test'
                    check (compliance_state in ('clear','flag_and_test','blocked')),
  noindex           boolean not null default true,
  disclosure_md     text,
  meta              jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_advertorials_site_status
  on public.advertorials (site_id, status);

-- ---------------------------------------------------------------------------
-- 2) advertorial_slots — one per monetized slot (WalletWatcher's offer_id=N)
--    Created before advertorial_items so the item.slot_id FK resolves.
-- ---------------------------------------------------------------------------
create table if not exists public.advertorial_slots (
  id              uuid primary key default gen_random_uuid(),
  advertorial_id  uuid not null references public.advertorials(id) on delete cascade,
  slot_key        int  not null,
  label           text not null,
  category        text,
  offer_id        uuid references public.affiliate_offers(id) on delete set null,
  rotation        jsonb not null default '[]'::jsonb,
  fallback_url    text,
  is_active       boolean not null default true,
  unique (advertorial_id, slot_key)
);

create index if not exists idx_advertorial_slots_advertorial
  on public.advertorial_slots (advertorial_id);
create index if not exists idx_advertorial_slots_offer
  on public.advertorial_slots (offer_id) where offer_id is not null;

-- ---------------------------------------------------------------------------
-- 3) advertorial_items — ordered content blocks. Monetized items bind to a slot.
-- ---------------------------------------------------------------------------
create table if not exists public.advertorial_items (
  id              uuid primary key default gen_random_uuid(),
  advertorial_id  uuid not null references public.advertorials(id) on delete cascade,
  position        int  not null,
  item_type       text not null default 'filler'
                  check (item_type in ('monetized','filler','bonus','recap')),
  heading         text,
  body_md         text,
  image_url       text,
  cta_text        text,
  slot_id         uuid references public.advertorial_slots(id) on delete set null,
  unique (advertorial_id, position)
);

create index if not exists idx_advertorial_items_advertorial_pos
  on public.advertorial_items (advertorial_id, position);

-- Guardrail: a monetized item must bind to a slot; a non-monetized item must not.
alter table public.advertorial_items
  add constraint advertorial_items_monetized_has_slot
  check (
    (item_type = 'monetized' and slot_id is not null)
    or (item_type <> 'monetized' and slot_id is null)
  );

-- ---------------------------------------------------------------------------
-- 4) advertorial_clicks — the click_id IS this row's id (passed as sub1).
--    Rollup source for ad_day_kpis. No anon access at all.
-- ---------------------------------------------------------------------------
create table if not exists public.advertorial_clicks (
  id              uuid primary key default gen_random_uuid(),
  advertorial_id  uuid references public.advertorials(id) on delete set null,
  slot_id         uuid references public.advertorial_slots(id) on delete set null,
  offer_id        uuid references public.affiliate_offers(id) on delete set null,
  ts              timestamptz not null default now(),
  ip_hash         text,
  user_agent      text,
  referrer        text,
  -- paid-native tracking taxonomy (project_tracking_convention s1..s8)
  s1 text, s2 text, s3 text, s4 text,
  s5 text, s6 text, s7 text, s8 text,
  source          text,
  sub_id          text,
  dest_url        text,
  converted       boolean not null default false,
  conversion_ts   timestamptz,
  payout          numeric,
  postback_raw    jsonb
);

create index if not exists idx_advertorial_clicks_advertorial_ts
  on public.advertorial_clicks (advertorial_id, ts desc);
create index if not exists idx_advertorial_clicks_offer_ts
  on public.advertorial_clicks (offer_id, ts desc);
create index if not exists idx_advertorial_clicks_converted
  on public.advertorial_clicks (converted, conversion_ts desc) where converted = true;

-- ---------------------------------------------------------------------------
-- updated_at trigger for advertorials
-- ---------------------------------------------------------------------------
create or replace function public.tg_advertorials_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists advertorials_touch_updated_at on public.advertorials;
create trigger advertorials_touch_updated_at
  before update on public.advertorials
  for each row
  execute function public.tg_advertorials_touch_updated_at();

-- ============================================================================
-- Row Level Security
--   • advertorials / advertorial_slots / advertorial_items → anon SELECT only
--     when the parent advertorial is status='live'. The page must render
--     publicly. All writes are service-role.
--   • advertorial_clicks → service-role only. Click PII (ua/referrer/ip_hash)
--     never exposed to anon or authenticated. The router runs server-side.
-- ============================================================================

alter table public.advertorials         enable row level security;
alter table public.advertorial_slots    enable row level security;
alter table public.advertorial_items    enable row level security;
alter table public.advertorial_clicks   enable row level security;

-- advertorials --------------------------------------------------------------
create policy "service_role_all_advertorials"
  on public.advertorials
  for all to service_role using (true) with check (true);

create policy "anon_read_live_advertorials"
  on public.advertorials
  for select to anon
  using (status = 'live');

create policy "authenticated_read_advertorials"
  on public.advertorials
  for select to authenticated using (true);

-- advertorial_slots ---------------------------------------------------------
create policy "service_role_all_advertorial_slots"
  on public.advertorial_slots
  for all to service_role using (true) with check (true);

create policy "anon_read_live_advertorial_slots"
  on public.advertorial_slots
  for select to anon
  using (
    exists (
      select 1 from public.advertorials a
      where a.id = advertorial_slots.advertorial_id
        and a.status = 'live'
    )
  );

create policy "authenticated_read_advertorial_slots"
  on public.advertorial_slots
  for select to authenticated using (true);

-- advertorial_items ---------------------------------------------------------
create policy "service_role_all_advertorial_items"
  on public.advertorial_items
  for all to service_role using (true) with check (true);

create policy "anon_read_live_advertorial_items"
  on public.advertorial_items
  for select to anon
  using (
    exists (
      select 1 from public.advertorials a
      where a.id = advertorial_items.advertorial_id
        and a.status = 'live'
    )
  );

create policy "authenticated_read_advertorial_items"
  on public.advertorial_items
  for select to authenticated using (true);

-- advertorial_clicks --------------------------------------------------------
--   NO anon policy. NO authenticated policy. Service-role only.
create policy "service_role_all_advertorial_clicks"
  on public.advertorial_clicks
  for all to service_role using (true) with check (true);

-- ============================================================================
-- Comments
-- ============================================================================
comment on table public.advertorials is
  'Listicle advertorial pages rendered at /lp/[slug]. Scoped per property via site_id. noindex=true always.';
comment on table public.advertorial_slots is
  'Monetized slots on an advertorial. slot_key is the stable N in /out/[slug]/[N]. Decouples copy from the current offer so we can swap/AB without editing the article. offer_id or weighted rotation resolves the destination.';
comment on table public.advertorial_items is
  'Ordered content blocks (list items). Monetized items bind to a slot; filler/bonus/recap do not.';
comment on table public.advertorial_clicks is
  'One row per outbound click through /out/[slug]/[slot]. id IS the click_id passed to the network as sub1. Postback flips converted=true + payout. Rollup source for ad_day_kpis. Service-role only — no anon access.';

comment on column public.advertorial_slots.slot_key is
  'Stable integer used in the /out/[slug]/[slot_key] URL. Renaming a slot label is fine; slot_key must not change once live traffic hits it.';
comment on column public.advertorial_clicks.id is
  'click_id — sent to the affiliate network as sub1 via {CLICK_ID} substitution. The postback returns this value so we can flip converted=true.';
comment on column public.advertorial_clicks.sub_id is
  'Encoded s1..s8 string sent to the network as sub2 for reconciliation. Never contains PII.';
