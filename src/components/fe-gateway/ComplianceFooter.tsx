/**
 * WO-843 §4 — shared compliance footer.
 *
 * Rendered IDENTICALLY by all three gateways (acceptance criterion 6). The
 * depth bar is affordablelifeinsurance.org's footer, per the WO.
 *
 * Server component — pure text, no interactivity, so it costs nothing on the
 * LCP path.
 */

import Link from 'next/link';
import { COMPLIANCE, LEGAL_ENTITY, BRAND } from '@/lib/fe-gateway/config';

interface Props {
  /** Show the express-TCPA restatement (Gateway C, which captures a lead). */
  withExpressConsent?: boolean;
}

export default function ComplianceFooter({ withExpressConsent = false }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16 border-t px-5 py-10 text-[15px] leading-relaxed"
      style={{ background: BRAND.sand, borderColor: '#DEDED4', color: '#4A5A63' }}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        {/* The single most important line — first, unmissable. */}
        <p className="text-base font-semibold" style={{ color: BRAND.ink }}>
          {COMPLIANCE.advertisement}
        </p>

        <p>{COMPLIANCE.notACarrier}</p>

        <div>
          <h2 className="mb-1 font-semibold" style={{ color: BRAND.ink }}>
            Graded and limited benefit periods
          </h2>
          <p>{COMPLIANCE.gradedBenefit}</p>
        </div>

        <p>{COMPLIANCE.stateAvailability}</p>

        <p>
          {COMPLIANCE.licensedAgent} {COMPLIANCE.callsRecorded}
        </p>

        {withExpressConsent && (
          <p className="text-[13px]">{COMPLIANCE.tcpaExpress}</p>
        )}

        {/* Rate-basis footnotes, keyed to the symbols used in body copy. */}
        <div className="space-y-2 border-t pt-5 text-[13px]" style={{ borderColor: '#DEDED4' }}>
          <p>{COMPLIANCE.footnotes.healthQuestion}</p>
          <p>{COMPLIANCE.footnotes.rateBasis}</p>
          <p>{COMPLIANCE.footnotes.levelPremium}</p>
        </div>

        <div
          className="flex flex-col gap-3 border-t pt-5 text-[14px] sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: '#DEDED4' }}
        >
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy-policy" prefetch={false} className="underline">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" prefetch={false} className="underline">
              Terms of Service
            </Link>
            <Link href="/disclaimers" prefetch={false} className="underline">
              Disclaimers
            </Link>
            <Link href="/contact" prefetch={false} className="underline">
              Contact
            </Link>
          </nav>
          <p className="text-[13px]">
            © {year} {LEGAL_ENTITY}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
