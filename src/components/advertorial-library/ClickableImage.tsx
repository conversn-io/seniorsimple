/**
 * E4 · ClickableImage — on-theme section image wrapped in the offer link.
 *
 * "Every winner puts an image on every item." Batch-generated via the image
 * engine (image_type='advertorial_body'). No overlay text — the image is
 * editorial/candid, not a marketing thumbnail.
 */

import styles from './advertorial.module.css';
import { useCtaHref } from './CtaContext';

interface ClickableImageProps {
  src: string;
  alt: string;
  /** Override the outbound URL. Default: resolved offer URL from context. */
  href?: string;
  caption?: React.ReactNode;
}

export default function ClickableImage({
  src,
  alt,
  href,
  caption,
}: ClickableImageProps) {
  const ctaHref = useCtaHref();
  return (
    <>
      <a
        className={styles.clickable}
        href={href ?? ctaHref}
        rel="sponsored nofollow noopener"
        target="_blank"
      >
        <img className={styles.hero} src={src} alt={alt} loading="lazy" />
      </a>
      {caption ? <div className={styles.cap}>{caption}</div> : null}
    </>
  );
}
