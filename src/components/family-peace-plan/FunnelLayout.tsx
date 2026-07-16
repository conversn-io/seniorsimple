'use client';

import { useMinimalFunnelLayout } from '@/hooks/useMinimalFunnelLayout';
import { IS_DRAFT_MODE } from './_lib/featureFlag';
import type { ReactNode } from 'react';
import './_lib/tokens.css';

interface FunnelLayoutProps {
  /** Text in the thin teal top bar. */
  topBar: string;
  /** 'default' = 720px content column, 'narrow' = 640px (quiz). */
  width?: 'default' | 'narrow';
  children: ReactNode;
}

/**
 * Shared frame for the Family Peace Plan funnel routes.
 * - Hides site chrome (calls `useMinimalFunnelLayout` — SeniorSimple's funnel-mode hook).
 * - Applies the scoped `.fpp` design tokens.
 * - Renders the teal top bar + centered page column.
 * The compliance footer is rendered separately per-route so each page can carry
 * its own disclaimer text verbatim (per the handoff).
 */
export function FunnelLayout({ topBar, width = 'default', children }: FunnelLayoutProps) {
  useMinimalFunnelLayout({ variant: 'insurance' });

  const pageClass = width === 'narrow' ? 'fpp-page fpp-page--narrow' : 'fpp-page';

  return (
    <div className="fpp">
      {IS_DRAFT_MODE && (
        <div className="fpp-draft-badge">Draft · Not published · Awaiting sign-off</div>
      )}
      <div className="fpp-bar">{topBar}</div>
      <div className={pageClass}>{children}</div>
    </div>
  );
}
