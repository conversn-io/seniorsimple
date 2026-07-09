# DEV HANDOFF — Family Peace Plan™ Sales Letter as a Next.js page

**To:** SeniorSimple dev (repo `conversn-io/seniorsimple`) · **From:** Pod 2 — Creative & Media Studio · 2026-07-08
**Goal:** ship the standalone FPP **sales letter** as a Next.js route on `seniorsimple.org`, matching the PR #35 architecture (Next owns content, GHL owns commerce). Commerce stays in GHL.

---

## ⚠️ Read first — the one architecture rule (don't skip)

**The CTA must navigate to the GHL order form as a full page. Do NOT embed the order form in an iframe/popup on the Next.js page.**

Why: the order form lives on **`go.seniorsimple.org`** (GHL). A Next.js page on `seniorsimple.org` (or any Vercel/preview origin) is **cross-origin** to it. We tested this — a cross-origin embed of the GHL form **loads but won't accept text input** (GHL's form session breaks in a cross-origin frame). It only works same-origin (i.e., when the page is hosted inside GHL). Since we're now hosting in Next.js, the popup-iframe pattern from `FPP-Sales-Letter-Page.html` is **off the table** — that file's popup was built for the GHL-hosted case only.

**Do this instead:** every CTA → **top-level navigation to the GHL order form** `https://go.seniorsimple.org/family-peace-plan`, carrying `price_bucket`, `band?`, and `utm_*`. This is exactly what PR #35's `buildCheckoutUrl()` already does. GHL then runs order → OTO ($99 Protection Kit) → thank-you (all in GHL; see `FPP-GHL-Popup-and-OTO-Setup.md` §3). Optional: open in a new tab (`target="_blank"`) if you prefer to keep the letter open; same-tab nav is the standard funnel choice and preserves attribution.

---

## Source material (everything you need is in `SimpleOS/02_Product/Simple Life Organizer/`)

| File | Use |
|---|---|
| `FPP-Sales-Letter-Page.html` | **Design + structure + inline CSS reference.** Port the markup/sections/CSS to React. **Ignore** its base64 `data:` images and its popup `<script>`/modal (see rule above) — those don't come across. |
| `FPP-Sales-Letter-Page-postform.html` | The trust / FAQ / footer block that follows the CTA. Port the FAQ as native `<details>` or your own accordion. |
| `Family-Peace-Plan-Sales-Letter-v2.md` | **Canonical copy** (verbatim). If the HTML and this ever differ, the copy doc wins. |
| `FPP-Ad-Pack/renders/FPP_Product_0{1,2,3,4,5}_gpt-image-2_high_v1.png` | **Product photos.** Add to the repo as static assets and serve via `next/image` (not base64). Mapping below. |
| `Family-Peace-Plan-Funnel-Design-Spec-v1.md` | Fuller design system + rationale if you want context. |

**Image mapping (hero-first, workbook not binder-in-hero):**
hero = `01_hero` · Sunday-Afternoon-Method interior = `04_openflat` · "how it feels" relief = `03_inhands` · offer/value block = `02_straighton` · close ("five years from now") = `05_shelf`.

---

## Where it goes in the repo (reuse PR #35 primitives)

You already have the `family-peace-plan` module from PR #35 — reuse it, don't reinvent:

- **Route:** add a sales-letter route under `src/app/the-simple-life/…` (e.g. `family-peace-plan-letter/page.tsx`, or repurpose the offer route). Server component + `metadata` with `robots:{index:false,follow:false}` while in draft, same as #35's pages.
- **Gate:** wrap with `gateFamilyPeacePlan()` (`_lib/featureFlag.ts`) so it 404s until `NEXT_PUBLIC_ENABLE_FAMILY_PEACE_PLAN=true`.
- **Component:** new `SalesLetterPage.tsx` in `src/components/family-peace-plan/` (long-form letter) + reuse `CtaButton`, `ComplianceFooter`, `FunnelLayout`.
- **CTA:** use `CtaButton` with `href={buildCheckoutUrl({priceBucket:47, utm})}` (`_lib/checkoutUrl.ts`) pointed at the GHL order form. Set `NEXT_PUBLIC_FPP_CHECKOUT_URL=https://go.seniorsimple.org/family-peace-plan`. Fire `fppAnalytics.offerView(47)` on mount and `offerCtaClick(47)` on click (`_lib/analytics.ts`).
- **Tokens:** the palette already exists in `_lib/tokens.css` — extend it; don't hardcode hexes. (Design spec uses teal `#36596A`, cream `#F5F5F0`, gold `#E4CDA1`.)

> Note on scope: per DEV-HANDOFF §v1.1 the **sales letter is the launch page** — the advertorial/quiz/offer trio from #35 is deferred. This route is the single Direct MVF landing page; its only forward action is the GHL order form.

---

## Build spec

**Sections (in order — see the HTML for exact copy + structure):** brand bar → eyebrow → H1 → deck → **hero image (#01)** → Bob lead (drop cap) → pull-quote → puzzle → **Guessing Gap™ mechanism** (3-chip CSS diagram, no image) → "mistake almost every family makes" (question block) → "started before / hardest part is opening the cover" → **Sunday Afternoon Method™** (3 numbered steps + interior image #04) → "what became clear" + relief image #03 → what's-inside checklist → identity → "picture the afternoon" → **value stack $181 + $47** (image #02) → **cream pull-quote above CTA** → **CTA #1** → **Peace of Mind Promise** guarantee box → CTA #2 → "five years from now" (image #05) → CTA #3 → compliance footer. Then the **post-form block** (guarantee restate, trust row, FAQ, footer).

**Fonts:** Playfair Display (serif headline) + Geist (body) via `next/font/google` (Geist is first-party to Next — trivial). Fallbacks Georgia / system-ui.

**Type/a11y (55–75 audience):** body ≥16px (spec uses ~18px), line-height 1.6–1.7, high contrast, mobile-first, full-width CTAs under ~560px, `next/image` with real `alt`. Serif H1 is a brand signature — keep it.

**Price:** on-page **$47** dominant, `$181` value anchor struck/muted (Founder decision 2026-07-08; `$67` is a later swap, not a live split — keep `priceBucket` but default 47).

---

## Compliance / trust (carry over from #35 — non-negotiable)

- Compliance footer **verbatim**: "The Family Peace Plan is an organizational tool — not legal, financial, tax, or medical advice, and not a will…" (`ComplianceFooter`).
- **Testimonials are illustrative** — render the real-story slot as a placeholder/comment, never as "verified." Nothing fake ships.
- **Data-safety:** the copy already frames "where it's kept, not the secret." Don't add any field that collects account numbers/passwords.
- Draft: `robots noindex/nofollow` + feature flag until sign-off.

---

## Out of scope for you (handled in GHL — pointer only)

The GHL order form, the **$49 printed bump**, the **$99 Protection Kit OTO**, thank-you, and the Club/welcome workflow all live in GHL. Wiring is in `FPP-GHL-Popup-and-OTO-Setup.md` (§3 routing). Your only handoff point is the CTA URL. The GHL order-form Step 1 is already trimmed to **Full Name + Email** (verified live).

---

## Open items / decisions for the dev team

1. **Final route path** for the sales letter (new `…/family-peace-plan-letter` vs. repurposing the existing offer route). Your call — match your IA.
2. **Same-tab vs new-tab** CTA to the GHL form. Recommend same-tab (attribution); confirm preference.
3. **`utm_*` passthrough** — read from the incoming URL and append to `buildCheckoutUrl` so paid attribution survives the Next→GHL hop.
4. Add the 5 product PNGs to the repo (or your asset pipeline) and optimize via `next/image`.

## Definition of Done

Sales-letter route renders the full letter + post-form block on brand (Playfair/Geist, teal/cream/gold, large-print), product photos via `next/image`, copy verbatim from v2, all CTAs navigate to the GHL order form with `price_bucket=47` + `utm_*`, `offer_view`/`offer_cta_click` fire, compliance + illustrative-testimonial handling intact, gated + noindex until sign-off. **No iframe/popup embed of the GHL form.**
