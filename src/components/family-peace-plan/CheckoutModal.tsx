'use client';

import { useEffect, useRef, useState } from 'react';

interface CheckoutModalProps {
  open: boolean;
  /**
   * If true, mount the iframe now (hidden) so the GHL order form starts
   * loading before the modal is actually opened — e.g. on CTA hover.
   * Once true, stays mounted for the rest of the session.
   */
  warm?: boolean;
  /** GHL order-form URL. Preserved as an anchor href on the fallback link so users can still escape to a new tab. */
  src: string;
  onClose: () => void;
}

/**
 * Modal iframe for the GHL order form.
 *
 * Perf strategy (2026-07-09):
 *  1. The parent page emits `<link rel="preconnect">` to `go.seniorsimple.org`
 *     so DNS + TCP + TLS are warm before the first CTA click.
 *  2. Once mounted, we keep the iframe in the DOM (`display:none` when closed)
 *     so re-opens are instant and the user's typed form state persists across
 *     an accidental close.
 *  3. A cream loading skeleton covers the iframe until `onLoad` fires, so the
 *     modal never shows a blank white area while GHL streams in.
 *
 * NOTE — cross-origin: the letter runs on `seniorsimple.org`, the GHL form on
 * `go.seniorsimple.org`. This is a cross-origin embed, in use per the Founder
 * decision 2026-07-09. Verified live that GHL's form accepts input in this
 * frame; if a future GHL change breaks that, the visible "Open it in a new
 * tab" link at the bottom is the escape hatch.
 */
export function CheckoutModal({ open, warm = false, src, onClose }: CheckoutModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Mount as soon as EITHER the modal is opened OR a CTA is warmed
  // (hovered/focused). Once mounted, stays mounted.
  useEffect(() => {
    if (open || warm) setShouldMount(true);
  }, [open, warm]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Frame-escape handshake with the GHL post-purchase pages.
  //
  // Chrome blocks cross-origin iframes from writing `window.top.location` without
  // fresh user activation, so a naive frame-buster inside the OTO page fails
  // silently after the form-submit navigation. Instead the OTO / Order
  // Confirmation pages postMessage us here, and we — the parent, alive since
  // the CTA click — navigate our own top window to the OTO URL. That closes the
  // modal (parent unloads) and lands the customer on the OTO in full-screen.
  //
  // We validate `event.origin` so nothing but go.seniorsimple.org can drive
  // navigation. This listener stays mounted for the modal's whole lifetime and
  // is idle until a message arrives.
  useEffect(() => {
    const ALLOWED_ORIGIN = 'https://go.seniorsimple.org';
    const handler = (e: MessageEvent) => {
      if (e.origin !== ALLOWED_ORIGIN) return;
      const data = e.data as { type?: string; url?: string } | null;
      if (!data || typeof data.url !== 'string') return;
      if (data.type !== 'fpp-oto-loaded' && data.type !== 'fpp-thankyou-loaded') return;
      // Sanity: only accept URLs on the GHL domain we trust
      try {
        const target = new URL(data.url);
        if (target.origin !== ALLOWED_ORIGIN) return;
        window.location.href = target.toString();
      } catch {
        /* ignore malformed */
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Nothing to render until warmed or opened.
  if (!shouldMount) return null;

  return (
    <div
      className={`fpp-modal-backdrop${open ? '' : ' fpp-modal-backdrop--hidden'}`}
      role="dialog"
      aria-modal={open ? 'true' : undefined}
      aria-hidden={open ? undefined : 'true'}
      aria-label="Get your Family Peace Plan"
      onClick={onClose}
    >
      <div className="fpp-modal-body" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeBtnRef}
          type="button"
          className="fpp-modal-close"
          onClick={onClose}
          aria-label="Close order form"
        >
          ×
        </button>
        {!iframeLoaded && (
          <div className="fpp-modal-skeleton" aria-hidden>
            <div className="fpp-modal-skeleton-spinner" />
            <p>Loading the secure order form…</p>
          </div>
        )}
        <iframe
          src={src}
          title="Family Peace Plan order form"
          className="fpp-modal-iframe"
          allow="payment"
          onLoad={() => setIframeLoaded(true)}
        />
        <p className="fpp-modal-fallback">
          Having trouble with the form?{' '}
          <a href={src} target="_blank" rel="noopener noreferrer">
            Open it in a new tab →
          </a>
        </p>
      </div>
    </div>
  );
}
