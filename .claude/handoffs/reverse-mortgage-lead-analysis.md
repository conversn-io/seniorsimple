# Handoff: Reverse Mortgage Lead Analysis

**Created**: 2026-05-20
**For**: Any agent (Claude or analyst) tasked with finding, segmenting, or analyzing reverse-mortgage leads.

---

## Mission

Find and analyze qualified/accepted reverse-mortgage leads in production Supabase. The funnel just rolled out a **35% LTV pre-contact gate** (deployed 2026-05-19); we want to measure quality, acceptance rate, self-correction lift from the verify step, and segment >35% LTV leads for offer-wall / alt-buyer routing.

---

## DB connection

- **Supabase CRM project ID**: `jqjftrlnyysqcwbbigpw`
- **Table**: `leads`
- **Tool**: use the supabase MCP `execute_sql` with that `project_id`. If unavailable, use `psql` with credentials from `.env.local` (key `SUPABASE_QUIZ_DB_URL` or equivalent).

---

## What was deployed 2026-05-19 (deploy marker)

1. **Pre-contact verify step** (quiz step 5/6): BatchData lookup + user-confirmable property/mortgage sliders. Lead capture moved from step 4 to step 6.
2. **Buyer-1 LTV gate**: leads with verified existing-mortgage LTV >35% never deliver to LynqFlux. Lead is still captured + tagged.
3. **Alt routing**: >35% LTV leads land on `/reverse-mortgage-calculator/results-alt` (placeholder for offer wall / alt buyer).
4. **Column persistence**: `leads.property_value` and `leads.current_mortgage` now populated on every delivery or DQ tag. **These columns are empty for leads created before 2026-05-19.**

---

## Schema you need

### `leads` columns
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `session_id` | varchar | Quiz session |
| `funnel_type` | varchar | Filter on `'reverse-mortgage'` |
| `created_at` | timestamptz | Lead capture timestamp |
| `contact` | jsonb | `firstName`, `lastName`, `email`, `phone` |
| `quiz_answers` | jsonb | See below |
| `property_value` | numeric | **Populated from 2026-05-19 forward** |
| `current_mortgage` | numeric | **Populated from 2026-05-19 forward** |
| `ghl_status` | jsonb | Delivery + DQ tags — see below |
| `utm_source`, `utm_medium`, `utm_campaign` | text | Attribution |
| `state`, `zip_code` | text | Geo |
| `attributed_spend`, `cost_per_lead` | numeric | If populated by BigQuery sync |

### `ghl_status` JSONB paths

| Path | Meaning |
|---|---|
| `ghl_status->'lynqflux'->>'success' = 'true'` | **Buyer 1 (LynqFlux) accepted** — this is "qualified/accepted" |
| `ghl_status->'lynqflux'->>'skipped' = 'true'` | Server-side 35% LTV gate blocked delivery (post-2026-05-19) |
| `ghl_status->'lynqflux'->>'mocked' = 'true'` | **LOCAL DEV TEST — ALWAYS EXCLUDE** |
| `ghl_status->'lynqflux'->>'user_verified' = 'true'` | Delivered with user-confirmed (not BatchData) property numbers |
| `ghl_status->'lynqflux'->>'ltv'` | numeric LTV at delivery (max of client-supplied + server-computed) |
| `ghl_status->'lynqflux'->'response'->>'message'` | LynqFlux API response text |
| `ghl_status->'lynqflux'->'response'->'errors'` | Array of rejection reasons (phone dupe, suppression, state, etc.) |
| `ghl_status->'buyer1_dq'` | Object — leads routed to `/results-alt` because LTV >35% |
| `ghl_status->'buyer1_dq'->>'reason' = 'ltv_above_35'` | DQ reason (currently only one) |
| `ghl_status->'buyer1_dq'->>'ltv'` | LTV that triggered the DQ |
| `ghl_status->'buyer1_dq'->>'batch_data_used'` | true = BatchData LTV; false = user-typed LTV |

### `quiz_answers` JSONB paths (post-2026-05-19 leads)

| Path | Meaning |
|---|---|
| `quiz_answers->>'reason'` | Why they want RM (eliminate-mortgage-payments, pay-off-debts, etc.) |
| `quiz_answers->>'is62Plus'` | Age qualifier (only 62+ pass) |
| `quiz_answers->>'age'` | **Always '70' — placeholder, never real age collected** |
| `quiz_answers->'addressInfo'` | street, city, state, zip |
| `quiz_answers->'verifiedProperty'` | `{ propertyValue, mortgageBalance, ltv, batchDataUsed }` — NEW |

---

## Production filter (always apply)

```sql
WHERE funnel_type = 'reverse-mortgage'
  AND COALESCE((ghl_status->'lynqflux'->>'mocked')::boolean, false) = false
  AND COALESCE(contact->>'email', '') NOT ILIKE 'test+%'
  -- exclude historical test address (Keenan, appears 15+ times):
  AND COALESCE(quiz_answers->'addressInfo'->>'street', '') != '1026 40th St'
```

---

## Canonical lead buckets

### Qualified & accepted (Buyer 1)
```sql
WHERE ghl_status->'lynqflux'->>'success' = 'true'
```

### Delivered but rejected by LynqFlux tech filters (dupe / suppression / state / loan-amount)
```sql
WHERE ghl_status->'lynqflux' IS NOT NULL
  AND COALESCE((ghl_status->'lynqflux'->>'success')::boolean, false) = false
  AND COALESCE((ghl_status->'lynqflux'->>'skipped')::boolean, false) = false
```

### Gated out by our 35% LTV server-side check (post-2026-05-19)
```sql
WHERE ghl_status->'lynqflux'->>'skipped' = 'true'
```

### Captured but routed to alt path (LTV >35%, new flow)
```sql
WHERE ghl_status->'buyer1_dq' IS NOT NULL
```

### Captured, no delivery attempt yet (mid-funnel abandonment or pending)
```sql
WHERE ghl_status->'lynqflux' IS NULL
  AND ghl_status->'buyer1_dq' IS NULL
```

---

## Starter queries

### 1. Acceptance funnel snapshot (last 30d)
```sql
SELECT
  date_trunc('day', created_at) AS day,
  count(*) AS captured,
  count(*) FILTER (WHERE ghl_status->'lynqflux'->>'success' = 'true') AS accepted,
  count(*) FILTER (WHERE ghl_status->'lynqflux' IS NOT NULL
    AND COALESCE((ghl_status->'lynqflux'->>'success')::boolean, false) = false
    AND COALESCE((ghl_status->'lynqflux'->>'skipped')::boolean, false) = false) AS lynq_tech_reject,
  count(*) FILTER (WHERE ghl_status->'lynqflux'->>'skipped' = 'true') AS server_ltv_gate,
  count(*) FILTER (WHERE ghl_status->'buyer1_dq' IS NOT NULL) AS alt_routed_dq
FROM leads
WHERE funnel_type = 'reverse-mortgage'
  AND COALESCE((ghl_status->'lynqflux'->>'mocked')::boolean, false) = false
  AND created_at > now() - interval '30 days'
GROUP BY 1 ORDER BY 1 DESC;
```

### 2. LTV distribution of accepted leads (post-2026-05-19 only — pre-deploy has no LTV data)
```sql
SELECT
  CASE
    WHEN (ghl_status->'lynqflux'->>'ltv')::numeric <= 0.20 THEN '≤20%'
    WHEN (ghl_status->'lynqflux'->>'ltv')::numeric <= 0.30 THEN '20-30%'
    WHEN (ghl_status->'lynqflux'->>'ltv')::numeric <= 0.35 THEN '30-35%'
    ELSE '>35% (shouldnt happen post-gate — investigate)'
  END AS ltv_bucket,
  count(*) AS accepted,
  count(*) FILTER (WHERE (ghl_status->'lynqflux'->>'user_verified')::boolean) AS user_verified,
  count(*) FILTER (WHERE NOT (ghl_status->'lynqflux'->>'user_verified')::boolean) AS batchdata_trusted
FROM leads
WHERE funnel_type = 'reverse-mortgage'
  AND ghl_status->'lynqflux'->>'success' = 'true'
  AND created_at >= '2026-05-19'
GROUP BY 1 ORDER BY 1;
```

### 3. Self-correction lift (post-2026-05-19)
How many leads that got delivered did so via the user-verified path (i.e., would have been gated as >35% LTV based on BatchData alone but user corrected):
```sql
SELECT
  count(*) AS delivered,
  count(*) FILTER (WHERE (ghl_status->'lynqflux'->>'user_verified')::boolean) AS user_verified,
  round(100.0 * count(*) FILTER (WHERE (ghl_status->'lynqflux'->>'user_verified')::boolean) / NULLIF(count(*), 0), 1) AS pct_user_verified
FROM leads
WHERE funnel_type = 'reverse-mortgage'
  AND ghl_status->'lynqflux'->>'success' = 'true'
  AND created_at >= '2026-05-19';
```

### 4. Source attribution for accepted leads
```sql
SELECT
  utm_source,
  utm_campaign,
  count(*) AS captured,
  count(*) FILTER (WHERE ghl_status->'lynqflux'->>'success' = 'true') AS accepted,
  round(100.0 * count(*) FILTER (WHERE ghl_status->'lynqflux'->>'success' = 'true') / NULLIF(count(*), 0), 1) AS acceptance_pct,
  avg(attributed_spend) FILTER (WHERE ghl_status->'lynqflux'->>'success' = 'true') AS avg_cost_per_accepted
FROM leads
WHERE funnel_type = 'reverse-mortgage'
  AND created_at > now() - interval '30 days'
  AND COALESCE((ghl_status->'lynqflux'->>'mocked')::boolean, false) = false
GROUP BY 1,2 ORDER BY accepted DESC LIMIT 20;
```

### 5. Tech-reject breakdown (LynqFlux rejection reasons)
```sql
SELECT
  ghl_status->'lynqflux'->'response'->'errors'->>0 AS error,
  count(*)
FROM leads
WHERE funnel_type = 'reverse-mortgage'
  AND ghl_status->'lynqflux' IS NOT NULL
  AND COALESCE((ghl_status->'lynqflux'->>'success')::boolean, false) = false
  AND COALESCE((ghl_status->'lynqflux'->>'skipped')::boolean, false) = false
  AND COALESCE((ghl_status->'lynqflux'->>'mocked')::boolean, false) = false
GROUP BY 1 ORDER BY 2 DESC;
```

### 6. Alt-routed DQ cohort (for offer wall / alt buyer sizing)
```sql
SELECT
  count(*) AS dq_leads,
  avg((ghl_status->'buyer1_dq'->>'ltv')::numeric) AS avg_ltv,
  avg(property_value) AS avg_property_value,
  avg(current_mortgage) AS avg_mortgage,
  count(*) FILTER (WHERE (ghl_status->'buyer1_dq'->>'batch_data_used')::boolean) AS confirmed_via_batchdata,
  count(*) FILTER (WHERE NOT (ghl_status->'buyer1_dq'->>'batch_data_used')::boolean) AS user_typed_numbers
FROM leads
WHERE funnel_type = 'reverse-mortgage'
  AND ghl_status->'buyer1_dq' IS NOT NULL;
```

---

## Analyses worth running

1. **Pre-gate vs post-gate acceptance rate** — split at 2026-05-19 boundary. Expected: pre-gate ~72% LynqFlux tech accept, post-gate similar (gate is upstream of tech) but `delivered_count` drops sharply.
2. **Total delivered volume change** — Expected ~70-80% drop in delivered count after the gate. If smaller, self-correction at the verify step is doing more work than projected.
3. **User-verified vs BatchData-trusted accepted leads** — quality comparison if buyer DNQ data becomes available.
4. **LTV distribution of accepted leads** — confirms gate is working (should be 0 leads with LTV>0.35 in the accepted bucket).
5. **Alt-routed cohort sizing** — basis for offer-wall ROI / alt-buyer pitch.
6. **Source-level CPL impact** — does the gate hit some Meta campaigns harder than others? Refine targeting if so.
7. **State distribution** — LynqFlux rejects 3 states; check whether reverse mortgage targeting is hitting those geos.

---

## Critical gotchas

| Gotcha | Mitigation |
|---|---|
| Local-dev test leads pollute the data | Filter `ghl_status->'lynqflux'->>'mocked' != 'true'` AND `contact->>'email' NOT ILIKE 'test+%'` |
| Keenan's San Diego test address (`1026 40th St`) appears 15+ times in historical data | Exclude that specific street |
| `quiz_answers->>'age'` is always `'70'` (placeholder) | Don't use as a real age signal — the funnel only collects 62+ yes/no |
| `property_value` / `current_mortgage` columns are empty for pre-2026-05-19 leads | Filter `created_at >= '2026-05-19'` for any column-based analysis |
| Historical LTV data lives only in Vercel runtime logs (~7 day retention) | If asked about pre-deploy LTV, pull from logs; otherwise use 2026-05-19+ DB data |
| `funnel_type` value is the string `'reverse-mortgage'` (with hyphen) | Don't use 'reverse_mortgage' or 'reverseMortgage' |
| LynqFlux "Already delivered" log lines are not failures — they're idempotency skips | Count only first delivery attempts when measuring volume |

---

## LynqFlux wire schema (what we send to Buyer 1)

Endpoint: `POST https://lynqflux.com/data/244/incoming.php` (form-encoded body).

| Field | Format | Example | Notes |
|---|---|---|---|
| `propertyvalue` | integer USD | `684899` | No commas, no `$` |
| `loanamount` | integer USD | `456659` | Min 10000 (LynqFlux validation) |
| `ltv` | **decimal 0–1, 2 places** | **`0.67`** | NOT percentage. Historical format LynqFlux accepts. Confirm before changing. |
| `loantype` | enum | `FHA` | One of: Fixed, ARM, Balloon, FHA, VA, Fannie, Freddie, USDA |
| `creditrating` | enum | `Good` | One of: Excellent, Good, Fair, Poor |
| `zip` | 5-digit string | `92102` | ZIP+4 is split — only first 5 sent |
| `state` | 2-letter code | `CA` | |
| `phone` | 10-digit | `4083927876` | Validated client-side (no 555, no fake sequences) |
| `email`, `fname`, `lname`, `address`, `city` | strings | — | |
| `leadid` | Jornaya/LeadID token | — | From `lead.jornaya_lead_id` |
| `trustedformurl` | URL | — | From `lead.trustedform_cert_url` |
| `listcode` | always `callready` | — | |
| `ip` | client IP | — | From request headers or stored |
| `url` | landing page | — | Query params stripped |
| `timestamp` | ISO-like `YYYY-MM-DD HH:MM:SS` | — | |
| `pswd`, `lid` | LynqFlux auth | — | Hardcoded in route |

**On `ltv` specifically**: we send the decimal ratio (e.g. `0.67`), not percentage (e.g. `67`). This is the format LynqFlux has accepted historically. There's some risk LynqFlux is interpreting `0.67` as `0.67%` and silently ignoring the field — they may be recomputing LTV from `propertyvalue` and `loanamount` for their downstream "short-to-close" DQ logic. If you're analyzing the `ltv` field they store on their side, confirm format with them first.

## Reference: deploy-day baselines (for comparison)

From the 6 days of Vercel logs preceding 2026-05-19:
- 85 unique delivered leads
- **Median LTV: 66.7% / Mean LTV: 58.0%**
- **81.2% had BatchData LTV > 35%** (the gate would have caught these)
- 18.8% had BatchData LTV ≤ 35% (would have sailed through)
- LynqFlux tech-accept rate: ~72% (51 of 180 lifetime attempts rejected — 21% phone dupes, 4% email suppression, 2% state, 1% loan-amount range)

Use these as the "before" benchmarks for any post-deploy lift analysis.

---

## If you find anything weird

- Leads with `ghl_status->'lynqflux'->>'success' = 'true'` AND LTV >0.35 → **bug**, the server-side gate failed. Report immediately.
- Leads with `ghl_status->'buyer1_dq'` AND `ghl_status->'lynqflux'->>'success' = 'true'` → **bug**, lead got tagged as DQ but also delivered. Report.
- Empty `property_value` on post-2026-05-19 delivered leads → deliver-lynqflux endpoint write may have failed. Worth investigating.

---

*Source: this brief was built from the May 2026 reverse-mortgage funnel rebuild. The full context lives in [src/app/api/leads/deliver-lynqflux/route.ts](../../src/app/api/leads/deliver-lynqflux/route.ts), [src/app/api/leads/mark-buyer1-dq/route.ts](../../src/app/api/leads/mark-buyer1-dq/route.ts), [src/components/reverse-mortgage/](../../src/components/reverse-mortgage/), and [src/app/reverse-mortgage-calculator/](../../src/app/reverse-mortgage-calculator/).*
