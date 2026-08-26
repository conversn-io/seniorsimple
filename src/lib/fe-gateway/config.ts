/**
 * WO-843 — SeniorSimple final-expense inbound-call gateway landers.
 *
 * Single source of truth for everything the three gateways hold CONSTANT.
 * The whole point of the test is that A, B and C differ ONLY in page
 * architecture (acceptance criterion 6), so offer copy, compliance text,
 * call routing and brand tokens all live here — never inline in a page.
 *
 * If you are tempted to hardcode a phone number, a disclosure sentence or a
 * legal entity inside a gateway page: don't. Put it here and import it.
 */

/* ------------------------------------------------------------------ *
 * Operating entity + call routing
 * ------------------------------------------------------------------ */

/**
 * Operating legal entity named in the compliance footer and TCPA consent.
 * Confirmed by Keenan 2026-08-26 (WO-843 §7 open item 2).
 */
export const LEGAL_ENTITY = 'Keenan Shaw LLC dba CallReady';

/**
 * Retreaver campaign that owns the DNI number pool for this test.
 * `2026 - FE Inbounds - 95s` — campaign id 50184, 6-number pool.
 *
 * `campaignKey` is Retreaver's `show_key`. It is a PUBLIC key designed to be
 * embedded in client-side JS (it can only request a number, never read call
 * data), so it is safe in the bundle.
 *
 * ⚠️ LAUNCH GATE: campaign 50184 was `paused: true` as of 2026-08-26. DNI
 * returns no number while paused, so every visitor silently falls back to
 * FALLBACK_NUMBER below and per-page attribution is lost. Unpause it in
 * Retreaver before spending a dollar against these pages.
 */
export const RETREAVER = {
  campaignKey:
    process.env.NEXT_PUBLIC_RETREAVER_FE_CAMPAIGN_KEY ||
    'b31c0b4fd2f9725f7bc33eaecba24936',
  campaignId: 50184,
  /** Retreaver's DNI script. Loaded lazily, never blocking. */
  scriptSrc: 'https://dtxnwt40zg4dj.cloudfront.net/retreaver.min.js',
  /** Give up on DNI after this long and show the fallback number. */
  timeoutMs: 2500,
} as const;

/**
 * Live FET licensed line. Used when Retreaver DNI is unavailable (campaign
 * paused, script blocked, JS off, timeout). A visitor must ALWAYS have a
 * working number to call — losing attribution beats losing the call.
 *
 * Verified against CRM `fet_call_facts`: 18,620 calls, FET campaign 52955.
 */
export const FALLBACK_NUMBER = {
  e164: '+18337196331',
  display: '(833) 719-6331',
} as const;

export function formatPhoneDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, '').replace(/^1/, '');
  if (digits.length !== 10) return e164;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/* ------------------------------------------------------------------ *
 * The three gateways
 * ------------------------------------------------------------------ */

export type GatewayId = 'a' | 'b' | 'c';

export interface GatewayMeta {
  id: GatewayId;
  /** Route path, used as the Retreaver tag + ledger key. */
  path: string;
  /** Human label for dashboards. */
  label: string;
  /** funnel_type — must contain "final-expense" so CAPI picks the FEX pixel. */
  funnelType: string;
  /** Does this page capture a lead? (Only C does.) */
  capturesLead: boolean;
}

export const GATEWAYS: Record<GatewayId, GatewayMeta> = {
  a: {
    id: 'a',
    path: '/fe-benefits',
    label: 'Gateway A — The Qualifier',
    funnelType: 'final-expense-gateway-a',
    capturesLead: false,
  },
  b: {
    id: 'b',
    path: '/fe-coverage',
    label: 'Gateway B — The Brochure',
    funnelType: 'final-expense-gateway-b',
    capturesLead: false,
  },
  c: {
    id: 'c',
    path: '/fe-qualify',
    label: 'Gateway C — The Niche Hook',
    funnelType: 'final-expense-gateway-c',
    capturesLead: true,
  },
};

export const GATEWAY_PATHS = Object.values(GATEWAYS).map((g) => g.path);

/**
 * True on any of the three gateway routes. Used by ConditionalHeader /
 * ConditionalFooter to suppress site chrome — these are paid-traffic landers
 * with a single primary action, not site pages.
 */
export function isGatewayPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return GATEWAY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/* ------------------------------------------------------------------ *
 * Offer constants — identical across all three (held-constant column)
 * ------------------------------------------------------------------ */

export const OFFER = {
  minAge: 45,
  maxAge: 85,
  /**
   * Conservative underwriting language. WO-843 §7 open item 3 (is the product
   * genuinely guaranteed-issue?) is unconfirmed, so every gateway ships the
   * safe reading per §1 of the compliance firewall: no "guaranteed acceptance",
   * no "instant approval", no "cannot be denied". If product truth is later
   * confirmed as guaranteed-issue, change it HERE and all three inherit.
   */
  underwriting: 'No medical exam — just a few health questions.',
} as const;

/* ------------------------------------------------------------------ *
 * Compliance copy — §1 firewall + §4 footer. Shared verbatim by all three.
 * ------------------------------------------------------------------ */

export const COMPLIANCE = {
  advertisement: 'This is an advertisement for life insurance.',

  notACarrier:
    `${LEGAL_ENTITY} is not an insurance carrier, is not affiliated with any ` +
    'government agency, and does not issue policies or make underwriting or ' +
    'eligibility decisions. We are a marketing organization that connects ' +
    'consumers with licensed insurance agents.',

  gradedBenefit:
    'Some final expense policies are issued with a graded or limited death ' +
    'benefit, meaning the full benefit may not be payable if death occurs ' +
    'within the first two policy years — typically the premiums paid plus ' +
    'interest are returned instead. Waiting periods, benefit amounts and ' +
    'terms vary by carrier, product, state and applicant. Your agent will ' +
    'explain which applies to any policy you are offered.',

  stateAvailability:
    'Products and benefit amounts are not available in all states and are ' +
    'subject to carrier underwriting. Not all applicants will qualify.',

  licensedAgent:
    'Callers will be connected with a licensed insurance agent who can ' +
    'discuss products they are appointed to sell in your state.',

  callsRecorded:
    'Calls may be recorded or monitored for quality and training purposes.',

  /** A + B: implied consent by dialing. No form, so no express consent needed. */
  consentByCalling:
    'By calling, you consent to speak with a licensed insurance agent about ' +
    'final expense coverage. Standard call and message rates may apply.',

  /** C: express written TCPA consent. Must sit directly above the submit. */
  tcpaExpress:
    `By clicking below, I give my express written consent for ${LEGAL_ENTITY} ` +
    'and one or more licensed insurance agents or their partners to contact me ' +
    'at the phone number and email address I provided — including by ' +
    'autodialer, pre-recorded or artificial voice, and SMS — about final ' +
    'expense and related insurance products. I understand consent is not a ' +
    'condition of purchase, that message and data rates may apply, and that I ' +
    'may revoke consent at any time by replying STOP or calling us. I am the ' +
    'subscriber or customary user of this number and am at least 18 years old.',

  /* Rate-basis footnotes. Referenced by symbol in body copy. */
  footnotes: {
    /** º — attach to any "no medical exam" claim. */
    healthQuestion:
      'º No medical exam is required for the simplified-issue products ' +
      'commonly used for final expense. A short series of health questions ' +
      'is asked on the application, and answers affect eligibility, benefit ' +
      'amount and premium.',
    /** * — attach to any dollar figure or rate claim. */
    rateBasis:
      '* Any premium or benefit figure shown is illustrative only. Actual ' +
      'rates depend on your age, gender, state, tobacco use, health answers ' +
      'and the carrier and benefit amount selected. Figures shown are not an ' +
      'offer, a quote, or a guarantee of coverage or price.',
    /** ** — attach to level-premium claims. */
    levelPremium:
      '** Level premium means the premium does not increase with age for the ' +
      'life of the policy, provided premiums are paid as scheduled. ' +
      'Availability varies by carrier and product.',
  },
} as const;

/* ------------------------------------------------------------------ *
 * Brand tokens — SeniorSimple consumer skin (warm, senior-friendly),
 * NOT the SMN corporate editorial system. Identical across all three.
 * ------------------------------------------------------------------ */

export const BRAND = {
  primary: '#36596A',
  primaryDark: '#26414E',
  accent: '#E4CDA1',
  accentDeep: '#C9A96A',
  sand: '#F5F5F0',
  ink: '#1B2A32',
  body: '#33454E',
  /** Call-to-action green — high contrast on both sand and white, WCAG-AA. */
  cta: '#1F7A4D',
  ctaDark: '#186139',
} as const;
