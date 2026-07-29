/**
 * Dev-only render of the 4 interactive advertorial primitives dispatched
 * by ComponentSwitch. Not linked anywhere — accessed directly at
 * /kit-preview to visually verify CSS after the advertorial-kit brand-token
 * pass. Renders BOTH scope variants side by side:
 *
 *   • "Kit scope" — wrapped only by CtaProvider (matches what the kit path
 *     currently renders in production).
 *   • "Legacy scope" — same components, wrapped in <div className={styles.root}>
 *     so the advertorial CSS variables (--cta, --blue, --rule, --sel) are
 *     in scope. Matches what LpPage.tsx wraps around the same components.
 *
 * A visible difference between the two proves the "invisible white-on-white
 * button" bug is a CSS-variable scope miss, not missing style rules.
 */

import PreviewClient from './PreviewClient';

export const dynamic = 'force-dynamic';

export default function KitPreviewPage() {
  return <PreviewClient />;
}
