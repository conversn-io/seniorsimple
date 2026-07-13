'use client';

/**
 * F2 · ShareBar — Facebook + Twitter share buttons.
 *
 * Uses the standard share intent URLs so there's no third-party SDK to
 * load. The share URL defaults to the LP's own href.
 */

import { useEffect, useState } from 'react';
import styles from '../advertorial.module.css';

interface ShareBarProps {
  /** Optional pre-populated tweet copy. */
  shareText?: string;
}

export default function ShareBar({ shareText }: ShareBarProps) {
  const [pageUrl, setPageUrl] = useState<string>('');

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const fb = pageUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
    : '#';
  const tw = pageUrl
    ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}${
        shareText ? `&text=${encodeURIComponent(shareText)}` : ''
      }`
    : '#';

  return (
    <div className={styles.share}>
      <a
        className={styles.shareFb}
        href={fb}
        target="_blank"
        rel="noopener noreferrer"
      >
        Share on Facebook
      </a>
      <a
        className={styles.shareTw}
        href={tw}
        target="_blank"
        rel="noopener noreferrer"
      >
        Tweet
      </a>
    </div>
  );
}
