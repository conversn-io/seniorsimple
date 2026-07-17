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

export function AdvertorialCta({ href, ctaText, brand }: Props) {
  function handleClick() {
    // Taboola form_submit — upper-funnel conversion signal on CTA click.
    // _tfa is defined by Taboola's base pixel loaded in the root layout.
    // Wrapped in try/catch so a missing pixel never blocks the CTA navigation.
    try {
      const w = window as Window & { _tfa?: Array<Record<string, unknown>> };
      w._tfa = w._tfa || [];
      w._tfa.push({
        notify: 'event',
        name: 'form_submit',
        id: TABOOLA_ACCOUNT_ID,
      });
    } catch {
      /* never block navigation on pixel error */
    }
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
