# GHL Runbook — Simple Estate Prep™ launch (v3.1)

> Operator checklist for the GHL half of the CoS handoff (2026-07-16).
> Every item is a pass/fail step. Nothing goes live until the CRO QA gate at the end passes end-to-end.
>
> **Location**: `vTM82D7FNpIlnPgw6XNC` (SeniorSimple.org)
> **Funnel**: `Ljz3It7G0NDxuueadKzE` (LTO FPP)
> **Rebrand rule**: layered — Simple Estate Prep™ (product/doorway) → The Family Peace Plan™ (artifact/workbook) → Sunday Afternoon Method™ (mechanism). Do NOT strip Family Peace Plan; it survives as the artifact.
> **Pricing HELD**: $47 control / $67 test #1. Never hardcode $67 in copy. Underlying price IDs unchanged.

---

## 1. Rename GHL product display names

Do this in **Payments → Products** (SeniorSimple location). Only display names change; **all price IDs stay identical**.

| Product | Current display name | New display name |
|---|---|---|
| Front-end digital ($47/$67) | The Family Peace Plan | **Simple Estate Prep — Family Peace Plan** |
| Order bump ($49 printed) | Printed Family Peace Plan | **Simple Estate Prep — Printed Edition (3-ring binder)** |
| Post-purchase OTO ($99 kit) | Family Peace Plan Protection Kit | *unchanged — stays in the FPP family per rebrand map* |

- [ ] Digital product renamed
- [ ] Printed bump renamed
- [ ] Verified all four price IDs (`6a4ee0a1111ea9800ff38582`, `6a4ee0a3e89c04adc8e6956e`, `6a4ee0a5f0f742a54cd8f496`, `6a4ee0a61c7df0744fbeac88`) untouched

---

## 2. GHL 2-step order form — Step 1 field trim

Currently Step 1 collects too much. Trim to **Name + Email** only. Anything else adds friction and drops the 55–75 audience.

- [ ] **Drop**: Company Name field
- [ ] **Make optional**: Phone
- [ ] **Conditional**: Address block only visible when a physical item (printed bump or Protection Kit) is in the cart
- [ ] Save + preview

---

## 3. OTO page (`/oto`) cleanup — leftover stock template

You added the FPP-OTO1 Custom Code block already, but the stock template's price section is still bleeding through underneath. Also the eyebrow line seems to have been stripped on paste. Fix pass:

- [ ] **Delete** the leftover section containing:
  - `NORMAL PRICE: $197`
  - `GET IT NOW FOR ONE PAYMENT`
  - `ONLY $99`
  - `YES! Add My Protection Kit!` button
  - `Access the Complete Family Protection Plan for Just $97 (Thats 52% Off)`
- [ ] **Handle** the "Important: Do Not Close This Window Or Click The 'Back Button'" bar at the top — delete if it's an editable section; disable in funnel-step settings if it's a template piece
- [ ] **Verify eyebrow** — open the Custom Code editor, scroll to the top of the pasted HTML, confirm this line is present verbatim: `<p class="eyebrow">An optional add-on</p>` — if GHL escaped it, re-paste
- [ ] Republish
- [ ] Refresh `https://go.seniorsimple.org/oto` and confirm: gold "AN OPTIONAL ADD-ON" eyebrow visible, no `$197`, no `$97 (52% Off)`, no "Do Not Close" bar, FPP $99 price shown as dominant Playfair number

---

## 4. Bump + 1-click OTO wiring

On the 2-step order form's payment step (Step 2):

- [ ] **$49 order bump** — Printed Family Peace Plan, Brunson-style checkbox card. Charges via same card being entered.
- [ ] **$99 post-purchase 1-click OTO** — Family Peace Plan Protection Kit as GHL 1-click upsell (card on file, no re-entry). Confirm the button label reads "Yes — add my Protection Kit ($99)" and truly fires without a second card entry.
- [ ] **"No thanks" declines** route to Order Confirmation (already verified via postMessage frame-escape)

---

## 5. Order Confirmation page — remove fake door, add printed-binder soft offer

Updated [FPP-ThankYou-Page.html](FPP-ThankYou-Page.html) already reflects this. Paste steps:

- [ ] Open the Order Confirmation page in page-builder
- [ ] **Delete** the current Custom Code block that contains the "Reserve my early-access spot" fake door
- [ ] **Paste** the updated `FPP-ThankYou-Page.html` (whole file) into a fresh Custom Code element
- [ ] **Swap tokens**:
  - `{{plan_access_url}}` → your GHL customer portal / product download link
  - `{{video_access_url}}` → the Sunday Afternoon Method video URL
  - `{{printed_binder_url}}` → **full-price** checkout URL for the Printed 3-ring binder product (NOT the $49 bump price — this is the retail price to the bump-decliners)
- [ ] Save + Publish
- [ ] Confirm the "Prefer a copy you can hold?" section is where the fake door used to be

---

## 6. Guided-completion deliverable wiring ($47 product)

**Blocker check**: does the fillable+printable PDF asset exist yet? If Pod 1/Design hasn't produced it, this step waits on that.

Once the PDF is in hand:

- [ ] Upload PDF to GHL Products → Digital Delivery for the $47 digital product
- [ ] Attach the Sunday Afternoon Method walkthrough video URL to the delivery email
- [ ] Include the 1-page "how to open, fill & save" guide in delivery
- [ ] Include a link to the full-price Printed Edition in the delivery email (soft backend for anyone who reconsiders the printed option days later)
- [ ] **Data-custody check**: confirm nothing about the deliverable stores customer input server-side. The PDF must be a form the customer fills on their own device — we never see it.

---

## 7. Welcome Email 5 — drop the 60-Day Club line

Template ID: `6a4d95b84c1811333b3a8c81` (SeniorSimple location).

- [ ] Open Email 5 template
- [ ] In the value stack, **remove**: `60 days of The Simple Life Club — Included`
- [ ] Confirm total stack still reads coherently (should now be 5 items, not 6)
- [ ] Confirm the price token `{{contact.fpp_price}}` is untouched
- [ ] Save

---

## 8. $47/$67 GHL split-test

The digital product has both price IDs attached. GHL runs the split at the checkout level.

- [ ] In the funnel's checkout element, verify both prices are attached: `6a4ee0a1111ea9800ff38582` ($47 control) and `6a4ee0a3e89c04adc8e6956e` ($67 test)
- [ ] Configure the split-test in GHL's funnel A/B UI (50/50 or per Founder direction)
- [ ] Confirm the Next.js letter forwards `price_bucket` via URL — ads/upstream links carrying `?price_bucket=67` should route into the $67 bucket at the GHL form
- [ ] Verify both buckets show the correct amount at checkout

---

## 9. Compliance re-check (estate runs hot)

Do a copy audit across the entire funnel. **Banned language** per the rebrand map:
- "estate plan" (say: get organized before you hire a specialist)
- "avoid probate" · "protect assets" · "replace an attorney"
- "know whether you need a trust"
- "save you thousands"
- "before it's too late" · fear/urgency

**Required disclaimers** (present now in `Simple-Estate-Prep-Letter-v3.1.md`, `FPP-OTO1-Protection-Kit-Page.html`, `FPP-ThankYou-Page.html`):
- Under hero on letter: *"This is not legal advice and does not replace a will, trust, or estate plan. It helps you organize the information that makes those conversations easier — and helps your family know where to begin."*
- Compliance footer verbatim on every page.

- [ ] Letter: banned language absent, disclaimer under hero, footer verbatim
- [ ] OTO page: footer verbatim
- [ ] Order Confirmation: footer verbatim
- [ ] Welcome emails: no banned language

---

## 10. CRO QA gate — real test purchase (ship gate)

Nothing goes live to paid traffic until this whole checklist passes on a real card (refund yourself after):

- [ ] Every letter CTA (3 in-letter) opens the modal → GHL 2-step form appears
- [ ] Step 1 asks Name + Email only (no Company field visible)
- [ ] Step 2 shows the $47 (or $67 bucket) price + the $49 printed bump checkbox
- [ ] $49 bump attaches when checked and charges correctly
- [ ] After payment: the modal escapes to full-page → lands on `/oto` (Protection Kit page)
- [ ] $99 1-click "Yes" charges the same card without re-entry
- [ ] "No thanks" on the OTO routes to `/order-confirmation`
- [ ] Order Confirmation page shows the "Prefer a copy you can hold?" printed offer (NOT the fake door)
- [ ] The purchase grants the guided-completion deliverable to the customer's email + fires the welcome sequence
- [ ] GA4 real-time shows: `offer_view` (once, with `price_bucket=47` or `67`), `offer_cta_click` (per click), and the GHL commerce webhook events (`purchase`, `order_bump_toggle`, `upsell_view`, `upsell_accept`/`upsell_decline`) — all with matching `price_bucket`

---

## Files referenced

Everything paste-ready under `_design-refs/family-peace-plan/`:
- `Simple-Estate-Prep-Letter-v3.1.md` — canonical letter copy (Next.js is already shipping this)
- `FPP-OTO1-Protection-Kit-Page.html` — standalone OTO page (already pasted, cleanup #3 pending)
- `FPP-ThankYou-Page.html` — updated Thank-You with printed-edition soft offer
- `FPP-GHL-Global.css` + slim body variants — for future funnels using shared site-wide CSS
- `GHL-Products-and-Prices.md` (`SimpleOS/02_Product/Simple Life Organizer/`) — canonical product/price IDs
