import type { ReactNode } from 'react';

interface ComplianceFooterProps {
  /** Verbatim compliance text from the corresponding prototype. */
  children: ReactNode;
  width?: 'default' | 'narrow';
}

/**
 * Compliance footer — one per route. Copy is passed as `children` so each page
 * can carry its own disclaimer word-for-word, as the handoff requires.
 */
export function ComplianceFooter({ children, width = 'default' }: ComplianceFooterProps) {
  const cls = width === 'narrow' ? 'fpp-foot fpp-foot--narrow' : 'fpp-foot';
  return <div className={cls}>{children}</div>;
}
