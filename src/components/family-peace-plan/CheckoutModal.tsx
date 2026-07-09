'use client';

import { useEffect, useRef, useState } from 'react';

interface CheckoutModalProps {
  open: boolean;
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
export function CheckoutModal({ open, src, onClose }: CheckoutModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [hasEverOpened, setHasEverOpened] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (open) setHasEverOpened(true);
  }, [open]);

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

  // If it's never been opened, don't render anything (no wasted DOM).
  if (!hasEverOpened) return null;

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
