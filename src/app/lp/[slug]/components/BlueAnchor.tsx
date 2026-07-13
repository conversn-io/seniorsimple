/**
 * B2 · BlueAnchor — inline news-blue underlined link.
 *
 * The single biggest native tell. Editorial pages use news blue underlined
 * for inline links. Style is applied by the `.wrap a` default in
 * advertorial.module.css — this component is just a semantic wrapper so
 * authors can write `<BlueAnchor>See the discounts</BlueAnchor>` without
 * having to remember the href.
 *
 * With no `href` prop, falls back to the outbound offer URL from CtaContext.
 */

import { useCtaHref } from './CtaContext';

interface BlueAnchorProps {
  /** Override the CTA URL (rare). Default: resolved offer URL from context. */
  href?: string;
  children: React.ReactNode;
}

export default function BlueAnchor({ href, children }: BlueAnchorProps) {
  const ctaHref = useCtaHref();
  return (
    <a
      href={href ?? ctaHref}
      rel="sponsored nofollow noopener"
      target="_blank"
    >
      {children}
    </a>
  );
}
