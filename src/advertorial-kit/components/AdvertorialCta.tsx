"use client";

/**
 * Client-side CTA wrapper for advertorial items. Fires network-specific
 * conversion pixels (Taboola form_submit, etc.) on click BEFORE navigating
 * to /out — so browser-side analytics see the click even though the server-side
 * S2S dispatch also fires from /out route.
 *
 * Extracted from AdvertorialItem so the item can remain a server component while
 * the CTA gets client-side event handlers.
 */

import Link from 'next/link'

interface Props {
  href: string;
  ctaText: string;
  brand: { accent: string; accentText: string };
}

const TABOOLA_ACCOUNT_ID = 2006370;
// RevContent conversion pixel token (per-account). Hardcoded for MVP; refactor
// to per-brand config when we run RevContent on multiple advertiser accounts.
const REVCONTENT_CONV_TOKEN =
  'Xw2W2S9nP8K6Jffy5vGx6VnYE9SE1rb8aXnxRzJrzJ15lFNNWHxWyzR7FZdud2Dm';

export function AdvertorialCta({ href, ctaText, brand }: Props) {
  function handleClick() {
    // Fire all network-side conversion pixels in one handler. Each is wrapped
    // in its own try/catch so a broken pixel never blocks CTA navigation OR
    // prevents other pixels from firing.

    // Taboola form_submit — upper-funnel conversion signal.
    try {
      const w = window as Window & { _tfa?: Array<Record<string, unknown>> };
      w._tfa = w._tfa || [];
      w._tfa.push({
        notify: 'event',
        name: 'form_submit',
        id: TABOOLA_ACCOUNT_ID,
      });
    } catch { /* never block navigation */ }

    // RevContent conversion pixel (image beacon). Loads a 1x1 tracking pixel
    // via new Image() — no need for a preloaded SDK. `t=` param is our
    // conversion tracking token from the RevContent dashboard.
    try {
      new Image().src =
        'https://trends.revcontent.com/conv.php?t=' + REVCONTENT_CONV_TOKEN;
    } catch { /* never block navigation */ }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="inline-block px-6 py-3 rounded-md font-sans font-semibold text-base shadow-sm hover:opacity-90 transition"
      style={{ background: brand.accent, color: brand.accentText }}
      rel="nofollow sponsored"
      prefetch={false}
    >
      {ctaText}
    </Link>
  )
}
