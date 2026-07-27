# Advertorial Kit — Component Registry (Catalog)

**Canonical source** for what PS-00 can compose into a kit-native advertorial
via `advertorial_items.component_type` + `component_props`. Works against
publishare Supabase (`vpysqshhafthuxvokwqj`).

**Live on:** any slug in `advertorials(status='live')`. Page is
`force-dynamic` — DB writes are live immediately, no deploy needed.

**Dispatch source of truth:** `src/advertorial-kit/components/ComponentSwitch.tsx`.
**Allow-list source of truth:** `src/advertorial-kit/lib/tap-only.ts`.

---

## Update protocol — read this first

| Tier | Who | Blast radius | Scope |
|---|---|---|---|
| **Tier 1** | PS-00 | DB row op, live in seconds | Any `component_type` **already dispatched in `ComponentSwitch.tsx`** (see below). Add / move / remove / reorder items; change copy; wire offers; edit `{{location}}` tokens; enable a split-test via `advertorials.variants`. Zero DEV involvement. |
| **Tier 2** | DEV (Claude Code order) | One-time code change + PR + deploy | A `component_type` that is **allow-listed but not dispatched** (`primary_cta`, `section_cta`, `sticky_cta`, `savings_breakdown`, `deal_card`, `deals_showcase`, `wrap_up_list`, `masthead`, `blue_anchor`, `disclosure_footer`); or a brand-new component. After the dispatch case ships → Tier 1 forever. |

**Rule of thumb:** if the `component_type` appears in this catalog's dispatched-types
table, it's Tier 1. If it's in the "reserved (not yet dispatched)" section, it's Tier 2.

---

## Shared rules (apply to every component)

- **Fail-closed guards run before every render**, in this order — a violation returns `null` + `console.warn`:
  1. `checkTapOnly()` — rejects unknown `component_type` and free-text identifying fields (`email`, `phone`, `zip*`, `firstname`, `lastname`, `name` at top level, `address`, `street`, free-text `city` at top level, `ssn`, `dob`, etc. — anywhere in `component_props` at any depth).
  2. `checkItemStrings()` — block-line scans every string in `heading`, `body_md`, `cta_text`, and recursively through `component_props` (incl. `options[].label` etc.).
- **Every `/out` anchor** carries `rel="nofollow sponsored"` and `target="_blank"`.
- **`/out` taxonomy** per W6 canonical `s1..s8`: `s1=brand`, `s2=source`, `s3=component`, `s4=hook`, `s5=creative`, `s6=placement`, `s7=variant`, `s8=network_click_id`, `sub1=UUID click_id`.
- **`{{location}}` tokens** in any string field are substituted server-side to the visitor's city (fallback `"your area"`). No location ever leaves via a URL param.
- **Split-test filter:** items with `variant_key = <chosen>` render only for that variant. Items with `variant_key IS NULL` render in every variant.

---

## The two open edges (definitive answers)

### Edge 1 — state map: is `state_selector` a tappable US map?

**Answer: NO.** `StateSelector` renders as a `<select>` dropdown. The primitive
docstring explicitly notes the upgrade path: "an SVG US map with clickable
state paths" would swap the render layer while keeping the wiring
(`useSetCtaSelection`, sub-scheme, CTA anchor).

- **Today:** `state_selector` → dropdown. **Tier 1** — PS-00 uses it as-is.
- **Tappable US map:** **Tier 2** — one-time DEV build (net-new render layer,
  same `component_type` name or a new one like `state_map`; picks up the
  same `selectionKey → sub7` wiring). Ask via a new WO if PS-00 wants this.

### Edge 2 — quiz parity: does the kit's `image_quiz` / `multi_select_quiz` match legacy `senior-discounts` UX?

**Answer: YES — full parity.** Legacy `senior-discounts` (`AngleABody.tsx`)
and legacy `things-retirees-cut` (`AngleBBody.tsx`) both call the **same**
`ImageQuiz` / `MultiSelectQuiz` primitive from `@/components/advertorial-library`
that `ComponentSwitch` dispatches for `component_type='image_quiz'` /
`'multi_select_quiz'`. Every visible behavior on legacy is available in the
kit.

- **Both quizzes:** **Tier 1** — PS-00 authors the DB row and it renders
  identically to the legacy slug.
- No one-time port needed. The only difference is dispatch mechanism (case
  in ComponentSwitch vs. hard-coded JSX in AngleABody), not rendered output.

---

## Dispatched types (Tier 1 — PS-00 can author these live)

All examples target `advertorial_id = <UUID>` and use `variant_key = NULL`
(unless a split-test is active). Change `slot_id` to the UUID of the slot
this item routes to.

---

### 1. `lead_in`

**What it renders:** the opening headline + byline + dek + optional caption image at the top of the article body.

**Props schema (`component_props`):**
| Key | Required | Type | Notes |
|---|---|---|---|
| `bylineText` | opt | string | defaults to `'By the Editorial Team · Updated this week'` |
| `dek` | opt | string | secondary line under headline |
| `headerSrc` | opt | string (URL) | falls back to `item.image_url` |
| `caption` | opt | string | image caption |

**Falls back:** headline ← `item.heading`.

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md, image_url,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 1, 'filler', NULL,
   'The list seniors quietly use to save $1,000+ this year',
   NULL, 'https://.../hero.jpg',
   'lead_in',
   jsonb_build_object(
     'bylineText','By the Editorial Team · Updated this week',
     'dek','Reward programs, member rates, and gift-card offers most people never sign up for.',
     'caption','Where seniors actually save.'
   ),
   NULL);
```

**Attribution:** no `/out` anchor. Purely chrome.
**Doctrine:** editorial voice only; no urgency claims.

---

### 2. `section`

**What it renders:** a numbered heading + markdown body (rendered inside a slate-colored block).

**Props schema:** none required — `heading` becomes the section title, `body_md` becomes the body.

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 3, 'filler', NULL,
   'The habit that separates people who save from people who don\'t',
   'It\'s not scarcity. It\'s consistency: they check *before* they spend.\n\nMost of the compounding is boring.',
   'section',
   '{}'::jsonb,
   NULL);
```

**Attribution:** no `/out`.
**Doctrine:** body_md scanned by block-line — no fabricated urgency, no gov badge, no guaranteed-payout language.

---

### 3. `editors_pick`

**What it renders:** a highlighted card with a tag, disclosure line, `body_md` content, and a CTA anchor that routes to the item's `outHref`.

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `tag` | opt | string | defaults to `'Editor's Pick'` |
| `ctaLabel` | opt | string | falls back to `item.cta_text`, then `'See if you qualify »'` |
| `disclosure` | opt | string | defaults to `'Sponsored. See disclosure at the bottom.'` |

**Example INSERT** (must be `monetized` + attached to an active slot):
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md, cta_text,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 5, 'monetized', '<slot_uuid>',
   'Editor\'s Pick — Senior Rewards Club',
   'Members-only club paying **up to $1,000** in gift cards + discounts. Check takes about a minute.',
   'See If I Qualify »',
   'editors_pick',
   jsonb_build_object('tag','Editor\'s Pick','disclosure','Sponsored. See disclosure at the bottom.'),
   NULL);
```

**Attribution:** any anchor click inside the card fires `lp_cta_click` (event delegation) → `/out/<slug>/<slot_key>?component=editors_pick&variant=<v>`. `cta_target` is not set on this component.

---

### 4. `qualify_checklist`

**What it renders:** a bulleted "you may qualify if…" list.

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `intro` | opt | string | falls back to `item.heading` |
| `items` | opt | string[] | the checklist entries — each is a plain string |
| `pointLabel` | opt | string | primitive-specific label prefix |

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 7, 'filler', NULL,
   'You may qualify if:', NULL,
   'qualify_checklist',
   jsonb_build_object(
     'items', jsonb_build_array(
       'You are 55 or older',
       'You live in the U.S.',
       'You shop online more than once a month'
     )
   ),
   NULL);
```

**Attribution:** no `/out`. Marketing device only.
**Doctrine:** items scanned by block-line; no false gate ("Only 5 spots left" etc.).

---

### 5. `quote`

**What it renders:** a pull-quote block with attribution.

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `quote` | opt | string | falls back to `item.body_md` |
| `attribution` | **REQ** | string | **skips render if missing** — mirrors compliance §5.3 |

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 4, 'filler', NULL,
   NULL, NULL,
   'quote',
   jsonb_build_object(
     'quote','I never realized how much I was leaving on the table each month.',
     'attribution','— Linda R., 68, Austin TX'
   ),
   NULL);
```

**Attribution:** no `/out`.
**Doctrine:** attribution required — bare quote without a citation trips the `fabricated_verification` block-line intent.

---

### 6. `trust_bar`

**What it renders:** a horizontal strip of trust-marks / brand logos with a label.

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `label` | opt | string | falls back to `item.heading`, then `'Trusted by:'` |
| `brands` | opt | object[] | shape: `{ name, category?, logoSrc?, source? }` — empty array renders label only |

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 2, 'filler', NULL,
   'Trusted by:', NULL,
   'trust_bar',
   jsonb_build_object(
     'brands', jsonb_build_array(
       jsonb_build_object('name','Restaurant.com','category','dining'),
       jsonb_build_object('name','Choice Hotels','category','travel')
     )
   ),
   NULL);
```

**Attribution:** no `/out`.
**Doctrine:** brand names must be real; block-line scans nested strings.

---

### 7. `image_quiz` (interactive)

**What it renders:** an icon/emoji-tile single-select qualifier + submit anchor that routes to `outHref`.

**Legacy parity:** IDENTICAL primitive as legacy `senior-discounts` (`AngleABody.tsx`). No behavioral gap.

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `question` | opt | string | falls back to `item.heading` |
| `selectionKey` | opt | string | defaults to `'spend_focus'` → routes to `sub6` per CtaContext SLOT_BY_KEY. Legal keys: `spend_focus`, `state`, `frequency`, `angle`, `click_source` |
| `options` | opt | `{value, label, icon}[]` | value goes to sub-slot; label + icon rendered |
| `submitLabel` | opt | string | falls back to `item.cta_text`, then `'See My Results »'` |
| `submitVariant` | opt | `'green' \| 'blue'` | primitive style variant |

**Example INSERT** (must be `monetized` + attached to an active slot):
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md, cta_text,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 1, 'monetized', '<slot_uuid>',
   'Which discounts matter most to you?', NULL,
   'See My Discounts »',
   'image_quiz',
   jsonb_build_object(
     'selectionKey','spend_focus',
     'options', jsonb_build_array(
       jsonb_build_object('value','dining','label','Dining','icon','🍽️'),
       jsonb_build_object('value','travel','label','Travel','icon','✈️'),
       jsonb_build_object('value','groceries','label','Groceries','icon','🛒')
     )
   ),
   NULL);
```

**Attribution:** submit → `/out/<slug>/<slot_key>?component=image_quiz&variant=<v>` (+ `source_id`, `sub5=slug`, `sub6=<selection>`). Fires `lp_step` on tile tap + `lp_cta_click` on submit.
**Doctrine:** tap-only (no free-text). Honest CTA labels only ("See My Discounts", not "See If I Qualify For Free").

---

### 8. `multi_select_quiz` (interactive)

**What it renders:** a "which of these apply?" checkbox-style qualifier + submit anchor to `outHref`.

**Legacy parity:** IDENTICAL primitive as legacy `things-retirees-cut` (`AngleBBody.tsx`).

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `question` | opt | string | falls back to `item.heading` |
| `selectionKey` | opt | string | defaults to `'spend_focus'` |
| `options` | opt | `{value, label}[]` | multi-select values |
| `submitLabel` | opt | string | falls back to `item.cta_text` |
| `submitVariant` | opt | `'green' \| 'blue'` | |

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md, cta_text,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 2, 'monetized', '<slot_uuid>',
   'Which of these apply to you?', NULL,
   'See My Matches »',
   'multi_select_quiz',
   jsonb_build_object(
     'selectionKey','spend_focus',
     'options', jsonb_build_array(
       jsonb_build_object('value','medicare','label','On Medicare'),
       jsonb_build_object('value','veteran','label','Veteran'),
       jsonb_build_object('value','retired','label','Retired')
     )
   ),
   NULL);
```

**Attribution:** same as `image_quiz` — submit routes to `/out` with the selection in the sub-scheme. `lp_step` on toggle + `lp_cta_click` on submit.
**Doctrine:** tap-only.

---

### 9. `state_selector` (interactive · dropdown)

**What it renders TODAY:** a `<select>` state picker + CTA anchor to `outHref`.

**Not a US map** — see Edge 1 above. Map render is Tier 2 (net-new build).

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `prompt` | opt | string | falls back to `item.heading` |
| `selectionKey` | opt | string | defaults to `'state'` → routes to `sub7` |
| `options` | opt | `{value, label}[]` | typically state code + name |
| `ctaLabel` | opt | string | falls back to `item.cta_text` |
| `step1Label` / `step2Label` | opt | string | step indicator labels — defaults `'Step 1 · Your state'` / `'Step 2 · See discounts'` |

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md, cta_text,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 3, 'monetized', '<slot_uuid>',
   'Pick your state', NULL,
   'See Plans in My State »',
   'state_selector',
   jsonb_build_object(
     'selectionKey','state',
     'options', jsonb_build_array(
       jsonb_build_object('value','TX','label','Texas'),
       jsonb_build_object('value','CA','label','California'),
       jsonb_build_object('value','FL','label','Florida'),
       jsonb_build_object('value','NY','label','New York')
     )
   ),
   NULL);
```

**Attribution:** CTA → `/out/<slug>/<slot_key>?component=state_selector&variant=<v>` (+ `sub7=<state>`). `lp_step` on change.
**Doctrine:** tap-only. `<select>` is compliant (no free-text). Free-text city input is BLOCKED by `tap-only.ts` — do not add a text input variant without going through Tier 2.

---

### 10. `savings_calculator` (interactive · numeric-only)

**What it renders:** a stack of number-stepper inputs (frequency × weight = yearly savings) + monthly-cost comparison + CTA anchor.

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `inputs` | opt | `SavingsInput[]` | shape below; defaults to APC's 4-input estimator |
| `ctaLabel` | opt | string | falls back to `item.cta_text` |
| `monthlyCost` | opt | number | membership monthly cost (default $9.99) |

`SavingsInput` shape:
```ts
{ label: string, weight: number, frequencyPerYear: number, defaultValue?: number, type?: 'number'|'select'|'tap'|'toggle' }
```

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md, cta_text,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 4, 'monetized', '<slot_uuid>',
   'Estimate your yearly savings', NULL,
   'See My Member Discounts »',
   'savings_calculator',
   jsonb_build_object(
     'inputs', jsonb_build_array(
       jsonb_build_object('label','Dinners out / week','weight',5,'frequencyPerYear',52),
       jsonb_build_object('label','Movie tickets / month','weight',4,'frequencyPerYear',12),
       jsonb_build_object('label','Hotel nights / year','weight',25,'frequencyPerYear',1)
     ),
     'monthlyCost',9.99
   ),
   NULL);
```

**Attribution:** CTA → `/out/<slug>/<slot_key>?component=savings_calculator&variant=<v>` (+ `sub10='calc'` once user touches any input). `lp_step` on input change.
**Doctrine:** `inputs[].type` may only be `number`, `select`, `tap`, or `toggle` — `tap-only.ts` REJECTS `text`/`email`/`zip`/etc. at any depth. Weights should be sourced (APC estimator) — no fabricated multipliers.

---

### 11. `clickable_image` (interactive)

**What it renders:** a hero-style image wrapped in an `/out` anchor, with optional caption.

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `src` | **REQ** | string (URL) | falls back to `item.image_url` — one must be present |
| `alt` | opt | string | falls back to `item.heading` |
| `caption` | opt | string | rendered below the image |

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md,
   image_url, cta_text,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 6, 'monetized', '<slot_uuid>',
   'Meet the members getting paid to shop', NULL,
   'https://.../hero.jpg', 'View Program »',
   'clickable_image',
   jsonb_build_object('caption','Sponsored'),
   NULL);
```

**Attribution:** anchor → `/out/<slug>/<slot_key>?component=clickable_image&variant=<v>` (+ `source_id`, `sub5=slug`). Reads href from the per-slot `CtaProvider`. `lp_cta_click` fired.

---

### 12. `rating`

**What it renders:** a 5-star bar (`★★★★☆`) + attribution line.

**Props schema:**
| Key | Required | Type | Notes |
|---|---|---|---|
| `starsFilled` | opt | number (0-5) | fractional rounds down; defaults to 0 |
| `attribution` | **REQ** | string | **skips render if missing** — mirrors `quote` guard |

**Example INSERT:**
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md,
   component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 8, 'filler', NULL,
   'Member rating', NULL,
   'rating',
   jsonb_build_object('starsFilled',4,'attribution','Based on 412 Trustpilot member reviews'),
   NULL);
```

**Attribution:** no `/out`. Non-interactive.
**Doctrine:** attribution required — bare stars trip `fabricated_verification`.

---

### 13. `listicle_entry` (default fallback)

**What it renders:** the classic numbered-listicle row — position badge + heading + optional image + markdown body + inline CTA button (monetized only).

**This is the default case** — any `component_type` NOT in the list above (or `NULL`) falls through here. Legacy items authored before the W1 dispatch expansion render this way unchanged.

**Props schema:** none — uses top-level `item` fields directly.
- Position badge = `item.position` styled with brand accent
- `heading` = the section H2
- `image_url` = optional above-body image
- `body_md` = markdown → HTML
- `cta_text` + `item_type='monetized'` + valid `slot_key` → renders the CTA button

**Optional `component_props.link_slot_key`** (for `filler` items only, added by Handoff Change 2): a positive integer → wraps the item's image in an `/out` anchor pointing at that slot (`?component=filler_image`). If unset, filler image is un-anchored.

**Attribution:**
- **Monetized items:**
  - Image → `/out/<slug>/<slot_key>?component=listicle_entry&variant=<v>` with `cta_target='image'`
  - Button → same URL with `cta_target='button'`
- **Filler items:** un-anchored image unless `link_slot_key` set → `?component=filler_image` with `cta_target='image'`

**Example INSERT** (monetized):
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md,
   image_url, cta_text, component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 1, 'monetized', '<slot_uuid>',
   'Senior Rewards Club Paying Out Up to $1,000 in Perks',
   'Members-only reward clubs are quietly handing seniors gift cards, cash, and discounts worth up to $1,000 — and most people never sign up. The check takes about a minute and costs nothing.',
   'https://.../reward-club.jpg', 'See If You Qualify »',
   NULL,           -- NULL component_type is fine → defaults to listicle_entry
   '{}'::jsonb,
   NULL);
```

**Example INSERT** (filler with image link to slot 3):
```sql
INSERT INTO public.advertorial_items
  (advertorial_id, position, item_type, slot_id, heading, body_md,
   image_url, cta_text, component_type, component_props, variant_key)
VALUES
  ('<advertorial>', 9, 'filler', NULL,
   'A quick reminder about what you qualified for',
   'The discount only helps if you remember it exists at the moment you\'re handed the check.',
   'https://.../reminder.jpg', NULL,
   NULL,
   jsonb_build_object('link_slot_key', 3),
   NULL);
```

---

## Hero image (page-level, not an item)

- Rendered from `advertorials.hero_image_url` inside `AdvertorialLayout`.
- When set AND `advertorial_slots(slot_key=1).is_active = true` → wrapped as
  `<a href="/out/<slug>/1?component=hero&variant=<v>" rel="nofollow sponsored" target="_blank">` (via the `HeroClickable` client component).
- Fires `lp_cta_click` with `component_type='hero'`, `cta_target='hero_image'`, `slot_key=1`.
- If slot 1 is inactive → passive `<img>` (no anchor, no analytics).

---

## Reserved (allow-listed but NOT yet dispatched — Tier 2)

Setting any of these on an item today will NOT render a distinct component —
it falls through to `listicle_entry`. Adding a dispatch case = one Tier-2 order.

| `component_type` | Primitive (in `advertorial-library/`) | Ask via Tier-2 WO if PS-00 wants it |
|---|---|---|
| `masthead` | `Masthead.tsx` | Already rendered by `AdvertorialLayout` chrome — a per-item override would be new dispatch |
| `disclosure_footer` | `DisclosureFooter.tsx` | Same — chrome, not item-level today |
| `blue_anchor` | `BlueAnchor.tsx` | Used inline via markdown links today — item-level dispatch would be net-new |
| `primary_cta` | `PrimaryCTA.tsx` | Standalone CTA row |
| `section_cta` | `SectionCTA.tsx` | End-of-section CTA row |
| `sticky_cta` | `StickyCTA.tsx` | Bottom-of-viewport sticky CTA |
| `savings_breakdown` | `SavingsBreakdown.tsx` | Read-only savings summary (paired w/ calculator) |
| `deal_card` | `DealCard.tsx` | Single-offer card |
| `deals_showcase` | `DealsShowcase.tsx` | Multi-offer grid |
| `wrap_up_list` | `WrapUpList.tsx` | End-of-article recap list |

---

## Common `component_props` sub-scheme mapping (`CtaContext`)

Locked per CtaContext.tsx `SLOT_BY_KEY`:

| `selectionKey` | Sub-slot | Semantic |
|---|---|---|
| `spend_focus` | `sub6` | user's spend focus (image_quiz, multi_select_quiz) |
| `state` | `sub7` | user's state (state_selector) |
| `frequency` | `sub8` | secondary quiz — reserved |
| `angle` | `sub9` | creative angle — reserved |
| `click_source` | `sub10` | `'calc'` when calculator was touched |

Only these keys route; unknown keys log a console warning and are dropped.

---

## Reference paths (for the next Tier-2 order)

- **Add a dispatch case:** `src/advertorial-kit/components/ComponentSwitch.tsx`
- **Extend the allow-list:** `src/advertorial-kit/lib/tap-only.ts` → `ALLOWED_COMPONENT_TYPES`
- **Block-line rules:** `src/advertorial-kit/lib/block-line.ts`
- **Barrel export:** `src/components/advertorial-library/index.ts`
- **Analytics helper:** `src/advertorial-kit/lib/analytics.ts` (`fireKitEvent`)
- **Router (out click):** `src/advertorial-kit/lib/router.ts`

---

*Last updated: 2026-07-17. Owner: DEV (kit). Change protocol: PS-00 changes DB rows freely (Tier 1); a new `component_type` requires a DEV order (Tier 2). This document tracks the live dispatched set — any change to `ComponentSwitch.tsx` cases MUST be reflected here in the same PR.*
