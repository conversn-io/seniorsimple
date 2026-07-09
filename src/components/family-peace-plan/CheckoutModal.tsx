'use client';

import { useEffect, useRef } from 'react';

interface CheckoutModalProps {
  open: boolean;
  /** GHL order-form URL. Preserved as an anchor href on the fallback link so users can still escape to a new tab. */
  src: string;
  onClose: () => void;
}

/**
 * Modal iframe for the GHL order form.
 *
 * NOTE — cross-origin risk (per DEV-HANDOFF-FPP-SalesLetter-NextJS.md, §Read-first):
 * the letter runs on `seniorsimple.org`, the GHL form on `go.seniorsimple.org` —
 * cross-origin. A previous test found the GHL form iframe loaded but wouldn't
 * accept text input in a cross-origin frame. This modal is used per the Founder
 * request 2026-07-09; if input is rejected, the "Open in a new tab" link at the
 * bottom is the escape hatch.
 */
export function CheckoutModal({ open, src, onClose }: CheckoutModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

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

  if (!open) return null;

  return (
    <div
      className="fpp-modal-backdrop"
      role="dialog"
      aria-modal="true"
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
        <iframe
          src={src}
          title="Family Peace Plan order form"
          className="fpp-modal-iframe"
          allow="payment"
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
