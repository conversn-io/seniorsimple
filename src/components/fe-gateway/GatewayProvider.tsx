'use client';

/**
 * WO-843 — shared client runtime for all three gateways.
 *
 * Boots once per page load and owns the three things every gateway needs:
 *   1. attribution capture (§3A)
 *   2. the resolved Retreaver DNI number (§3C)
 *   3. a `track` helper bound to this gateway (§3B)
 *
 * Everything below it — CallButton, StickyCallBar, the quizzes — reads from
 * this context, so no page ever touches params or phone numbers directly.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { GATEWAYS, type GatewayId } from '@/lib/fe-gateway/config';
import {
  captureAttribution,
  type AttributionBundle,
} from '@/lib/fe-gateway/params';
import {
  resolveTrackingNumber,
  FALLBACK_RESOLVED,
  type ResolvedNumber,
} from '@/lib/fe-gateway/retreaver';
import { trackFeEvent, type FeEventName, type FeEventPayload } from '@/lib/fe-gateway/events';

interface GatewayContextValue {
  gateway: GatewayId;
  bundle: AttributionBundle | null;
  number: ResolvedNumber;
  /** True until attribution + DNI have settled. */
  loading: boolean;
  /**
   * Set when a quiz answer puts the visitor outside what the licensed line
   * can write. Suppresses every persistent call CTA — a DQ that still shows a
   * Call button contradicts its own copy and sends an unwritable caller to a
   * paid line.
   */
  disqualified: boolean;
  setDisqualified: (v: boolean) => void;
  track: (
    event: FeEventName,
    detail?: Record<string, unknown>,
    contact?: FeEventPayload['contact'],
  ) => string | null;
}

const GatewayContext = createContext<GatewayContextValue | null>(null);

export function useGateway(): GatewayContextValue {
  const ctx = useContext(GatewayContext);
  if (!ctx) throw new Error('useGateway must be used inside <GatewayProvider>');
  return ctx;
}

interface Props {
  gateway: GatewayId;
  /** Extra Retreaver tags — e.g. Gateway C's segment token. */
  extraTags?: Record<string, string>;
  children: ReactNode;
}

export default function GatewayProvider({ gateway, extraTags, children }: Props) {
  const [bundle, setBundle] = useState<AttributionBundle | null>(null);
  const [number, setNumber] = useState<ResolvedNumber>(FALLBACK_RESOLVED);
  const [loading, setLoading] = useState(true);
  const [disqualified, setDisqualified] = useState(false);

  const meta = GATEWAYS[gateway];

  // Stringify so an inline object literal from the caller doesn't retrigger
  // the effect on every render.
  const tagKey = JSON.stringify(extraTags ?? {});

  const pageViewFired = useRef(false);

  useEffect(() => {
    let cancelled = false;

    // 1. Capture attribution synchronously — must happen before anything
    //    can navigate away.
    const captured = captureAttribution();
    if (!cancelled) setBundle(captured);

    // 2. page_view, exactly once per mount.
    if (!pageViewFired.current) {
      pageViewFired.current = true;
      trackFeEvent({
        event: 'page_view',
        gateway,
        bundle: captured,
        detail: { path: meta.path, gateway_label: meta.label },
      });
    }

    // 3. Resolve the DNI number in the background. The fallback is already
    //    rendered, so the CTA is live from the first paint.
    void resolveTrackingNumber(captured, {
      ss_gateway: gateway,
      ss_page: meta.path.replace(/^\//, ''),
      ...(extraTags ?? {}),
    }).then((resolved) => {
      if (cancelled) return;
      setNumber(resolved);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateway, tagKey]);

  const value = useMemo<GatewayContextValue>(
    () => ({
      gateway,
      bundle,
      number,
      loading,
      disqualified,
      setDisqualified,
      track: (event, detail, contact) => {
        if (!bundle) return null;
        return trackFeEvent({ event, gateway, bundle, detail, contact });
      },
    }),
    [gateway, bundle, number, loading, disqualified],
  );

  return <GatewayContext.Provider value={value}>{children}</GatewayContext.Provider>;
}
