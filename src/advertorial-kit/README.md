# advertorial-kit

Server-rendered listicle advertorials, per-slot click routing, and postback-driven KPI rollup for the Simple Media Network property Next.js apps.

**Data lives in publishare Supabase** (`vpysqshhafthuxvokwqj`). Property apps (SeniorSimple, MoneySimple, RateRoots, HomeSimple, ParentSimple) install this kit and read/write into that one Supabase using their existing service-role key.

Design doc: `00 - Reports/mega_listicle_backend_design_2026-07-15.md`

---

## What ships

```
packages/advertorial-kit/
├── lib/                     # pure helpers (import into any server code)
│   ├── router.ts            # macro capture, sub_id encoding, template substitution
│   ├── postback.ts          # secret compare, payload parsing
│   ├── markdown.ts          # safe minimal markdown → HTML
│   ├── brand-config.ts      # per-site editorial identity
│   ├── preview-fixture.ts   # dev-only sample data
│   ├── get-site-id.ts       # env-driven site_id lookup
│   └── supabase-admin.ts    # service-role client for publishare Supabase
├── components/
│   ├── AdvertorialLayout.tsx
│   └── AdvertorialItem.tsx
├── app-templates/           # copy into your property app's app/ directory
│   ├── lp/[slug]/page.tsx
│   ├── out/[slug]/[slot]/route.ts
│   └── postback/[network]/route.ts
├── migrations/              # reference copies (apply once, in publishare Supabase)
│   ├── 20260715_010000_advertorial_listicle_backend.sql
│   └── 20260715_020000_advertorial_day_kpis.sql
└── tests/router.test.ts
```

Zero build step. Zero private-npm setup. Pure copy-install.

---

## Install into a property app

Assumes the property app uses Next.js 15 App Router and has an `@/*` → `./src/*` (or similar) tsconfig alias, matching seniorsimple-production / RateRoots-Platform / moneysimple's shape.

### 1. Copy the kit

From the publishare repo root, into your property app:

```bash
PROP=/path/to/05-Web-Applications/seniorsimple-production
cp -r packages/advertorial-kit "$PROP/src/advertorial-kit"

# Route stubs. Directory names use Next.js's [param] convention — the folders
# already exist in the kit, so the copy preserves them.
mkdir -p "$PROP/src/app/lp" "$PROP/src/app/out" "$PROP/src/app/postback"
cp -r packages/advertorial-kit/app-templates/lp/*        "$PROP/src/app/lp/"
cp -r packages/advertorial-kit/app-templates/out/*       "$PROP/src/app/out/"
cp -r packages/advertorial-kit/app-templates/postback/*  "$PROP/src/app/postback/"
```

The kit's internal imports use `@/advertorial-kit/*`. Your property app's existing `@/*` → `./src/*` alias makes `@/advertorial-kit/lib/router` resolve to `src/advertorial-kit/lib/router` — no tsconfig edits needed.

### 2. Env vars

Add to the property app's Vercel project (and `.env.local` for dev):

```bash
# Publishare Supabase — usually already set for the CMS newsletter routes
NEXT_PUBLIC_SUPABASE_URL=<publishare project URL>
SUPABASE_SERVICE_ROLE_KEY=<publishare service role key>

# Property identity (matches advertorials.site_id in the DB)
ADVERTORIAL_SITE_ID=seniorsimple      # or moneysimple, rateroots.com, homesimple, parentsimple

# Postback secrets (per network) — generate strong random per network.
# Set at least one for every network you activate; fallback secret used only if
# the per-network var is unset.
POSTBACK_SECRET_PRISMIQUE=<random>
POSTBACK_SECRET_EVERFLOW=<random>
POSTBACK_SECRET_MAXBOUNTY=<random>
POSTBACK_SECRET_CJ=<random>
POSTBACK_SECRET=<optional shared fallback>
```

### 3. Hide app chrome on advertorials

Advertorials render their own property-specific masthead + footer. Suppress the app's normal header/footer on `/lp/*` so they don't stack.

If your app's header component uses `usePathname` (client), add:
```tsx
if (pathname?.startsWith('/lp/')) return null
```

If your header/footer is a server component, convert it to a client component first (add `'use client'` and `import { usePathname } from 'next/navigation'`).

### 4. Apply migrations to publishare Supabase (once, globally)

The tables are shared across every property. Apply in this order:

```
supabase/migrations/20260715_010000_advertorial_listicle_backend.sql
supabase/migrations/20260715_020000_advertorial_day_kpis.sql
```

These already live in `publishare/supabase/migrations/`. Copies in `packages/advertorial-kit/migrations/` are for reference only — do NOT apply them from a property app.

### 5. Verify

```
npm run dev
open http://localhost:3000/lp/anything?preview=1
```

Should render the sample SeniorSimple listicle (6 items, 3 monetized CTAs pointing at `/out/anything/{slot_key}`). `?preview=1` bypasses the DB.

---

## Configure the affiliate network postback

Portal action (do NOT automate). In Prismique / Everflow / MaxBounty / CJ, set the global (or offer-level) conversion postback:

```
https://<property-domain>/postback/<network>?click_id={sub1}&payout={payout}&status=approved&secret=<POSTBACK_SECRET_XXX>
```

Networks and their `{sub1}` / `{payout}` macro names vary — check each portal's docs. The router always sends our click_id as `sub1` and expects it back the same way.

---

## Architecture recap (Architecture B)

- Each property app owns its domain (seniorsimple.org / moneysimple.org / rateroots.com) and installs this kit.
- The kit's `/lp`, `/out`, `/postback` routes run inside each property app — same-origin, same Vercel project, per-property env vars.
- One publishare Supabase holds the four tables (`advertorials`, `advertorial_items`, `advertorial_slots`, `advertorial_clicks`) plus the daily rollup (`advertorial_day_kpis`).
- `advertorial.site_id` scopes each row to a property. The renderer/router 404 any slug whose `site_id` doesn't match the app's `ADVERTORIAL_SITE_ID`.
- Copy → slot → offer indirection: monetized CTAs always link `/out/<slug>/<slot_key>`, never a raw affiliate URL.

---

## Updating the kit

The canonical source is `publishare/packages/advertorial-kit/`. To update a property app after a kit change:

```bash
PROP=/path/to/property-app
rsync -av --delete packages/advertorial-kit/lib/        "$PROP/src/advertorial-kit/lib/"
rsync -av --delete packages/advertorial-kit/components/ "$PROP/src/advertorial-kit/components/"
# Route stubs rarely change — re-copy only if a template changed.
```

If the kit ever adds a new template, run the `mkdir` + `cp` steps for that route.
