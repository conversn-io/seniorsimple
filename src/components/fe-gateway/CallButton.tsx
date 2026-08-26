'use client';

/**
 * WO-843 §3B — the tracked call CTA.
 *
 * Every call button on all three gateways is this component, so
 * `call_cta_click` (the primary optimization event) can never be missed on a
 * variant. Acceptance criterion 3.
 *
 * It is a real <a href="tel:…">, not a JS handler: the tap must work with JS
 * broken, mid-hydration, or when the tracking POST fails. Tracking fires
 * alongside navigation via `keepalive`, never in front of it.
 */

import { useGateway } from './GatewayProvider';
import { BRAND } from '@/lib/fe-gateway/config';

interface Props {
  /** Where on the page this button sits — becomes a ledger dimension. */
  placement: string;
  /** Button label. `{number}` is replaced with the resolved display number. */
  label?: string;
  /** Small line under the label. */
  subLabel?: string;
  size?: 'lg' | 'md';
  className?: string;
}

export default function CallButton({
  placement,
  label = 'Call {number}',
  subLabel,
  size = 'lg',
  className = '',
}: Props) {
  const { number, track } = useGateway();

  const text = label.replace('{number}', number.display);

  const pad = size === 'lg' ? 'px-7 py-5 text-[21px]' : 'px-5 py-3.5 text-[18px]';

  return (
    <a
      href={`tel:${number.e164}`}
      onClick={() => {
        track('call_cta_click', {
          placement,
          number: number.e164,
          number_tracked: number.tracked,
        });
      }}
      className={`inline-flex w-full flex-col items-center justify-center rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] sm:w-auto ${pad} ${className}`}
      style={{ background: BRAND.cta }}
      // Announce the action, not the raw digits, to screen readers.
      aria-label={`${text}. Speak with a licensed insurance agent.`}
    >
      <span className="flex items-center gap-2.5">
        {/* Inline SVG — no icon library, no extra request on the LCP path. */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z" />
        </svg>
        {text}
      </span>
      {subLabel && (
        <span className="mt-1 text-[14px] font-medium opacity-95">{subLabel}</span>
      )}
    </a>
  );
}
