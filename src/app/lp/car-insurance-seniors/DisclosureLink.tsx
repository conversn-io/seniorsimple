'use client';

/**
 * Two small client controls for the disclosure smooth-scroll:
 *   - DisclosureButton: masthead "Advertiser Disclosure" text-button
 *   - DisclosureAnchor: inline "full disclosure" link that prevents the
 *     default hash jump and smooth-scrolls to #disc instead
 *
 * Isolated so the rest of the page can stay server-rendered.
 */

import type { MouseEvent, ReactNode } from 'react';

function scrollToDisclosure() {
  document.getElementById('disc')?.scrollIntoView({ behavior: 'smooth' });
}

export function DisclosureButton({ className }: { className: string }) {
  return (
    <button type="button" className={className} onClick={scrollToDisclosure}>
      Advertiser Disclosure
    </button>
  );
}

export function DisclosureAnchor({ children }: { children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToDisclosure();
  };
  return (
    <a href="#disc" onClick={onClick}>
      {children}
    </a>
  );
}
