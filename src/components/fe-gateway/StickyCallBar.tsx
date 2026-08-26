'use client';

/**
 * WO-843 §2 design note — mobile-first sticky Call Now bar.
 * Shared by all three gateways so the persistent CTA is identical.
 *
 * Appears after the hero scrolls past, so it never competes with the hero's
 * own primary action ("one primary action per view").
 */

import { useEffect, useState } from 'react';

import { useGateway } from './GatewayProvider';
import { BRAND, COMPLIANCE } from '@/lib/fe-gateway/config';

export default function StickyCallBar() {
  const { number, track, disqualified } = useGateway();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A disqualified visitor gets no persistent call CTA.
  if (disqualified) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 transition-transform duration-200 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ background: '#fff', borderColor: '#E3E3DA', boxShadow: '0 -4px 20px rgba(0,0,0,.08)' }}
      // Hidden from AT while off-screen so it isn't announced twice.
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="hidden flex-1 sm:block">
          <p className="text-[15px] font-semibold" style={{ color: BRAND.ink }}>
            Speak with a licensed agent
          </p>
          <p className="text-[13px]" style={{ color: '#5B6A72' }}>
            {COMPLIANCE.callsRecorded}
          </p>
        </div>
        <a
          href={`tel:${number.e164}`}
          tabIndex={visible ? 0 : -1}
          onClick={() =>
            track('call_cta_click', {
              placement: 'sticky_bar',
              number: number.e164,
              number_tracked: number.tracked,
            })
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-4 text-[19px] font-bold text-white shadow-md active:scale-[0.98] sm:flex-none"
          style={{ background: BRAND.cta }}
          aria-label={`Call ${number.display}. Speak with a licensed insurance agent.`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z" />
          </svg>
          Call {number.display}
        </a>
      </div>
    </div>
  );
}
