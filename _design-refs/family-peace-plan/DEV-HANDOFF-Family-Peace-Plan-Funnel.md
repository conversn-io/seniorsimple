# Dev Handoff — Family Peace Plan Funnel on seniorsimple.org (Next.js)

**For:** SeniorSimple dev team (Claude Code)
**From:** Marketing / growth
**Goal:** Ship a 3-step acquisition + monetization funnel — **Advertorial → Family Readiness Quiz (email capture) → Family Peace Plan offer ($27)** — natively in the seniorsimple.org Next.js app. HTML prototypes exist and are the source of truth for copy, layout, and design; rebuild them as real components/routes, don't iframe or paste raw HTML.

---

## How to use this doc with Claude Code

Paste the section **"Claude Code build prompt"** at the bottom into Claude Code from the root of the seniorsimple.org repo. It references the three prototype files below — copy those into the repo (e.g. `/_design-refs/family-peace-plan/`) so Claude Code can read them, or paste their contents when prompted.

**Prototype files (source of truth):**
- `Family-Peace-Plan-Advertorial.html` — the pre-sell article
- `Family-Readiness-Quiz.html` — 6-question quiz + email capture + scored result
- `Family-Peace-Plan-Offer.html` — longform $27 sales letter / offer page

---

## The funnel & why each step exists

```
Cold ad ─▶ /the-simple-life/family-peace-plan-story   (Advertorial — pre-sells the belief, soft CTA)
        └▶ /the-simple-life/family-readiness-check     (Quiz — scores readiness, CAPTURES EMAIL → newsletter)
             └▶ /the-simple-life/family-peace-plan     (Offer — $27, self-liquidating front end)
                  └▶ checkout (Stripe/existing cart)
```

Economic intent: the quiz is the **list-growth engine** (email capture = new Simple Life subscriber); the $27 offer is the **self-liquidator** that offsets ad cost. Every step must fire analytics events (below) so we can measure cost-per-subscriber vs. front-end revenue. **Instrumentation is not optional — it's the whole point.**

Routes are suggestions; match existing seniorsimple.org conventions (App Router assumed). Keep them under a `/the-simple-life/` segment if that fits the IA.

---

## Design system (already the SeniorSimple brand — reuse existing tokens)

Prototypes use these; map to existing Tailwind/theme tokens rather than hardcoding if the app already defines them.

| Token | Hex | Use |
|---|---|---|
| Teal (primary) | `#36596A` | Headlines, nav, buttons, CTA-card bg |
| Teal ink | `#274655` | Pull-quote text |
| Cream | `#F7F5EF` | Section/card backgrounds |
| Cream-2 | `#EFEBDF` | Progress track, subtle fills |
| Gold (accent) | `#E4CDA1` | CTA buttons, eyebrows, highlights |
| Gold ink | `#A98B4E` | Eyebrow text, dashed borders |
| Ink | `#26313A` | Body text |
| Muted | `#6E6A5F` | Captions, helper text |
| Good/green | `#1D7A5A` | Success/confirm states |

Type: **serif headlines** (Georgia / `ui-serif`), **sans body** (Arial/Helvetica/system). Body ≥16px, line-height ≥1.5 (55+ audience — keep large-print). Content column max ~720px.

Voice/compliance rules (SeniorSimple brand): benefit-first, never fear-based; "no obligation, ever"; the product is an organizational tool, **not** legal/financial/medical advice and not a will. Keep the compliance footer from each prototype verbatim.

---

## Components to build

**Shared**
- `FunnelLayout` — narrow content column, teal top bar, brand eyebrow, compliance `Footer`.
- `CtaButton` — gold, large touch target, analytics `onClick`.
- `ComplianceFooter` — per-page legal text (props for the specific disclaimer).

**Advertorial route**
- Server component, mostly static. Renders article + `SoftCtaCard` (→ quiz route). Hero image slot (currently a placeholder — wire to real asset). Add `<Suspense>`/metadata for SEO (title/description/OG — it's a paid-traffic landing page).

**Quiz route** (`"use client"`)
- `QuizFlow` state machine: `intro → q0..q5 → capture → result`. Progress bar, back button, one question per screen, "why we ask" helper text.
- Questions + scoring live in a typed config (`questions.ts`) — see prototype `QUESTIONS`/`BANDS`. Score = sum(0/1/2), max 12. Bands: **9–12** "Ahead of Most Families", **5–8** "A Few Gaps to Close", **0–4** "Real Guessing Gap".
- `CaptureForm` gates the result: first name + email → POST to opt-in endpoint (below) → render `ResultCard` → CTA to offer route.
- Persist the score/band to query param or state so the offer page can optionally personalize (optional).

**Offer route**
- Mostly static longform + sticky/refreshed `OfferCard` ($27, value-anchor stack, `Get` → checkout). `PeaceOfMindPromise` guarantee block. Order-bump note (printed edition) — bump itself handled at checkout.

---

## Integrations (the two hooks that make it live)

### 1. Email capture → newsletter/subscriber store
The quiz `CaptureForm` must POST to the SeniorSimple subscribe path (Supabase edge function / SendGrid — same pipeline the newsletter uses; see the `seniorsimple-newsletter` infra). Prototype calls this `OPTIN_ENDPOINT`.

**Payload the prototype sends (keep or adapt):**
```json
{
  "source": "family-readiness-quiz",
  "fname": "Carol",
  "email": "you@example.com",
  "score": 7,
  "maxScore": 12,
  "band": "A Few Gaps to Close",
  "answers": [{ "q": "…", "value": 1 }],
  "ts": "2026-07-01T00:00:00.000Z"
}
```
Requirements: double opt-in per existing newsletter policy; store `source`, `score`, `band` on the subscriber for segmentation (welcome sequence can branch on band); handle duplicate email idempotently; server-side validate email; send the "Family Map™ Starter" lead magnet + trigger the welcome sequence on confirm.

### 2. Offer → checkout → post-purchase upsell (RESTRUCTURED — offer approved 2026-07)

**Core shift:** completion is the product. The **Sunday Afternoon Method video walkthrough is now bundled INTO the front end** (not a bump), which is why the frontend price moved $27 → $47. Position as a *guided, watch-anytime system* — **never** as a course, webinar, live workshop, Zoom class, or printable-PDF-only.

**The checkout stack:**

| Stage | Product | SKU (suggested) | Price (A/B) | Fulfillment |
|---|---|---|---|---|
| **Frontend** | Family Peace Plan + Sunday Afternoon Method (guided system: 12-section workbook + video walkthrough + Open First + completion checklist + Family Letter + Annual Peace Review) | `family-peace-plan` | **$47 control / $67 premium** | Instant digital access, watch-anytime |
| **Order bump** (checkbox) | Printed Family Peace Plan | `family-peace-plan-print` | **$49 / $59** | **Dropshipped** POD → residential; require shipping address only if checked |
| **Post-purchase 1-click upsell** | Family Peace Protection Kit — a **fireproof/water-resistant keepsake box** that holds the finished printed plan + documents (+ Open First envelope, family access card, annual review card) | `family-peace-protection-kit` | **$99** | **Dropshipped** physical kit; shown AFTER the frontend purchase is banked, before the thank-you page. *Fire/water protection lives HERE — no separate pouch bump.* |
| **Post-purchase bonus** (not a charge) | 60 Days of The Simple Life Club | `simple-life-club-60` | included | Auto-granted on purchase — the continuity/relationship rail |

Notes: single bump (workshop is core, not a bump). The $99 Protection Kit is a **one-click post-purchase upsell** — NOT on the sales page.

#### v1 CHECKOUT = EMBEDDED GHL — do NOT build a native cart for v1 (decision 2026-07-08)
GHL (GoHighLevel) owns **commerce + email**; the Next.js app owns the **content pages only** (advertorial, quiz, offer). This removes the biggest build risk and is the launch architecture.
- **Build in GHL:** an order form / funnel with the frontend product (**$47 control / $67 test** — two order forms or GHL split-test); the **native order bump** (printed edition **$49**, styled as the Brunson bump box — GHL supports this); a **native one-click post-purchase upsell** (Protection Kit **$99**, card-on-file, true 1-click); and a **workflow** that on purchase grants the **60-Day Club** + fires the **welcome sequence** (Pod 1's 11 GHL templates already target GHL).
- **Cart-page separation is satisfied for free:** the Next.js offer page shows value + ~10x anchor + CTA with **no hard price**; the CTA hands to the **GHL order form**, where price is revealed and the bump + upsell live. The **$47/$67 A/B is controlled in GHL.**
- **Handoff:** offer CTA → GHL order form (embed as an iframe on a `/checkout` route, or redirect to the GHL funnel URL). Pass `price_bucket`, `band`, and `utm_*` as URL params so GHL + analytics stay aligned.
- Native checkout is a **post-v1** upgrade (only if GHL limits us) — don't block launch on it.

---

## Analytics events (required — feed the unit economics)

**Use the EXISTING analytics framework already in the Claude Code repo — do NOT build a new one (decision 2026-07-08).** Wire these events into it. Split of responsibility: **content-funnel events** (advertorial/quiz/offer) fire client-side from the Next.js pages into the existing framework + GA4; **commerce events** (`purchase`, `order_bump_toggle`, `upsell_*`) originate in **GHL** — capture them via GHL webhook/postback into the same framework so the full funnel reconciles. Preserve `price_bucket`, `band`, `utm_*` across the Next.js→GHL boundary. Minimum set:

| Event | Where | Key props |
|---|---|---|
| `advertorial_view` | Advertorial load | `utm_*`, `referrer` |
| `advertorial_cta_click` | Soft CTA → quiz | — |
| `quiz_start` | Intro "Start" | — |
| `quiz_question_answered` | each answer | `q_index`, `value` |
| `quiz_capture_view` | capture screen shown | — |
| `quiz_optin_submit` | email submitted | `band`, `score` |
| `quiz_result_view` | result shown | `band`, `score` |
| `offer_view` | offer page load | `band` (if passed), `price_bucket` (47/67) |
| `offer_cta_click` | Get / checkout click | `price_bucket` |
| `order_bump_toggle` | printed bump check/uncheck | `bump_sku`, `checked` |
| `purchase` | frontend purchase complete | `price_bucket`, `bump_attached` (bool), `order_value` |
| `upsell_view` | Protection Kit shown post-purchase | — |
| `upsell_accept` / `upsell_decline` | 1-click upsell decision | `sku=family-peace-protection-kit` |

These let us compute: ad→advertorial→quiz-start→opt-in→offer-view→purchase→bump→upsell, and therefore **cost-per-subscriber, CPA, AOV, bump take-rate, and upsell take-rate** (the approved success metrics — see below). Preserve `utm_*` across the whole funnel (query params or first-party cookie).

## Success metrics (approved targets)

| Metric | Acceptable | Strong |
|---|---|---|
| CPA | ≤ $80 | ≤ $60 |
| AOV | ≥ $65 | ≥ $85 |
| Bump take-rate (printed) | ≥ 25% | ≥ 30% |
| Upsell take-rate (Protection Kit) | ≥ 6% | ≥ 8% |

The dashboard must report these live, split by `price_bucket` (47 vs 67), so we can pick the winning front-end price on real AOV/CPA — not raw conversion alone.

---

## Acceptance criteria

- [ ] Three routes live, responsive, mobile-first, ≥16px body, WCAG AA contrast, keyboard-navigable quiz.
- [ ] Advertorial CTA → quiz; quiz result CTA → offer; offer Get → checkout ($47/$67) → printed bump → post-purchase Protection Kit upsell → 60-Day Club bonus granted.
- [ ] Email capture writes a real subscriber (double opt-in) with `source`/`score`/`band`; welcome sequence + lead magnet fire.
- [ ] All analytics events firing with correct props; `utm_*` preserved end-to-end.
- [ ] Copy/design match prototypes; compliance footers intact; no fear-based language.
- [ ] Lighthouse: performance ≥90 mobile, accessibility ≥95. SEO metadata + OG tags on all three routes.
- [ ] Feature-flag or draft the routes until Keenan signs off on price ($27 confirmed), product name, and testimonials (currently illustrative — must be replaced with verified stories before publish).

---

## Open items owner = Keenan (don't block dev scaffolding, but block publish)
1. **Product name** inside the plan: *Simple Life Organizer™* vs *The Family Organizer™* vs *The Family Guide™* (prototypes use "Simple Life Organizer"). 
2. ~~Order-bump price~~ — **DECIDED: two bumps — Fillable Digital Edition +$17, printed spiral edition +$47 (dropshipped).**
3. **Real testimonials** to replace Carol M. / Patricia D. (illustrative placeholders).
4. Value-anchor figures on the offer stack ($49/$29/$19/$19 = $116) — confirm these are defensible or adjust.
5. **Bump product assets to produce:** the Guided Completion Workshop (short "Sunday Afternoon Method" video series) and the print-on-demand file for the dropship partner.

---

## Claude Code build prompt (paste into the repo)

> You are working in the seniorsimple.org Next.js codebase. Build a 3-step marketing funnel — Advertorial, Family Readiness Quiz (with email capture), and a $27 Family Peace Plan offer page — as native routes and components following this repo's existing conventions (App Router, TypeScript, Tailwind, existing theme tokens, existing analytics and newsletter-subscribe utilities).
>
> Source of truth for copy, layout, and design is three HTML prototypes in `/_design-refs/family-peace-plan/` (`Family-Peace-Plan-Advertorial.html`, `Family-Readiness-Quiz.html`, `Family-Peace-Plan-Offer.html`). Reproduce their content and visual design using our component system — do not embed raw HTML.
>
> Requirements:
> 1. Routes (adapt to our IA): `/the-simple-life/family-peace-plan-story` (advertorial, server component + SEO/OG metadata), `/the-simple-life/family-readiness-check` (client quiz), `/the-simple-life/family-peace-plan` (offer). Wire the CTAs in that order; offer Get → our checkout with the `$27` digital SKU.
> 2. Quiz: state machine intro→6 questions→capture→result, progress bar, back button, "why we ask" helper text. Put questions/scoring/bands in a typed config. Score 0–12; bands 9–12 / 5–8 / 0–4 (see prototype `QUESTIONS` and `BANDS`, copy verbatim). Capture form (first name + email) gates the result and must call our existing newsletter-subscribe function with `{source:"family-readiness-quiz", fname, email, score, maxScore, band, answers, ts}`, double opt-in, storing source/score/band on the subscriber; then show the scored result with a CTA to the offer.
> 3. Fire analytics events via our existing layer: advertorial_view, advertorial_cta_click, quiz_start, quiz_question_answered, quiz_capture_view, quiz_optin_submit, quiz_result_view, offer_view, offer_cta_click (price=27). Preserve utm params across all three routes.
> 4. Match the SeniorSimple brand (serif headlines, sans body, teal/cream/gold, ≥16px body, AA contrast, large touch targets). Keep the compliance footer text from each prototype verbatim. No fear-based language.
> 5. Feature-flag/draft the routes; testimonials are illustrative placeholders — mark them clearly so they aren't published as real.
>
> Deliver: the routes, components (FunnelLayout, CtaButton, ComplianceFooter, QuizFlow, CaptureForm, ResultCard, OfferCard, PeaceOfMindPromise), the quiz config, and wiring to our subscribe + analytics + checkout utilities. Note any repo utilities you assumed. Ask before changing checkout or newsletter backend contracts.
