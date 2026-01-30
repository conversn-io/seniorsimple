import Link from 'next/link';

interface MinimalFunnelFooterProps {
  variant?: 'insurance' | 'mortgage';
}

/**
 * MinimalFunnelFooter - Limited footer for lead generation funnels
 * 
 * Contains only required content for lead gen and disclosure purposes:
 * - Contact information (required for lead gen)
 * - Legal/disclosure links (required for compliance)
 * - Basic disclaimers (required for insurance/financial products)
 * 
 * Used on conversion-focused funnel pages to minimize distraction.
 * 
 * @param variant - 'insurance' (default) or 'mortgage' for appropriate disclaimers
 */
const MinimalFunnelFooter = ({ variant = 'insurance' }: MinimalFunnelFooterProps) => {
  return (
    <footer className="py-8 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        {/* Essential Contact & Legal */}
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-[#36596A] mb-3">Contact</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <Link href="/contact" className="block hover:text-[#36596A] transition-colors">
                Contact Us
              </Link>
              <p className="text-xs text-gray-500">Email: support@seniorsimple.org</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#36596A] mb-3">Legal</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <Link href="/privacy-policy" className="block hover:text-[#36596A] transition-colors" prefetch={false}>
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="block hover:text-[#36596A] transition-colors" prefetch={false}>
                Terms of Service
              </Link>
              <Link href="/disclaimers" className="block hover:text-[#36596A] transition-colors" prefetch={false}>
                Disclaimers
              </Link>
            </div>
          </div>
        </div>

        {/* Required Disclaimers */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-3">Important Disclaimers</h3>
            <div className="text-xs text-yellow-800 space-y-2">
              {variant === 'mortgage' ? (
                <>
                  <p>
                    <strong>Not an Offer to Lend:</strong> SeniorSimple is not a lender, does not make credit decisions, 
                    and does not fund loans. We connect consumers with licensed mortgage professionals who may contact you.
                  </p>
                  <p>
                    <strong>Loan Approval:</strong> Loan approval and terms are subject to credit approval and qualification 
                    criteria determined by the lender. Not all applicants will qualify.
                  </p>
                  <p>
                    <strong>HECM Information:</strong> A Home Equity Conversion Mortgage (HECM) is a federally insured reverse 
                    mortgage. Borrowers must meet FHA requirements including age, equity, and property type.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Insurance Products:</strong> Insurance products are offered through licensed insurance professionals. 
                    Not all products are available in all states. Product availability and terms may vary by state.
                  </p>
                  <p>
                    <strong>Financial Advice:</strong> The information provided is for educational purposes only and does not 
                    constitute financial, tax, or legal advice. Consult with qualified professionals before making financial decisions.
                  </p>
                  <p>
                    <strong>Licensing:</strong> Our licensed professionals are authorized to sell insurance products in the states 
                    where they are licensed. Licensing information is available upon request.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} SeniorSimple. All rights reserved.{variant === 'mortgage' ? '' : ' | Licensed Insurance Agency'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MinimalFunnelFooter;
