import Link from 'next/link';

const FunnelFooter = () => {
  return (
    <footer className="py-12 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Standard Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-[#36596A] mb-4">Get in Touch</h3>
            <div className="space-y-2 text-gray-600">
              <Link href="/contact" className="block hover:text-[#36596A] transition-colors">
                Contact Us
              </Link>
              <p>Phone: <a href="tel:+18585046544" className="hover:text-[#36596A]">+1 (858) 504-6544</a></p>
              <p>Email: support@seniorsimple.org</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#36596A] mb-4">Resources</h3>
            <div className="space-y-2 text-gray-600">
              <Link href="/retirement" className="block hover:text-[#36596A] transition-colors">
                Retirement Rescue™
              </Link>
              <Link href="/housing" className="block hover:text-[#36596A] transition-colors">
                Housing & Real Estate
              </Link>
              <Link href="/health" className="block hover:text-[#36596A] transition-colors">
                Healthcare & Medicare
              </Link>
              <Link href="/estate" className="block hover:text-[#36596A] transition-colors">
                Estate Planning
              </Link>
              <Link href="/tax" className="block hover:text-[#36596A] transition-colors">
                Tax Planning
              </Link>
              <Link href="/insurance" className="block hover:text-[#36596A] transition-colors">
                Insurance
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#36596A] mb-4">Featured Content</h3>
            <div className="space-y-2 text-gray-600">
              <Link href="/content" className="block hover:text-[#36596A] transition-colors" prefetch={false}>
                Content Library
              </Link>
              <Link href="/content/tax-free-retirement-income-complete-guide" className="block hover:text-[#36596A] transition-colors">
                Tax-Free Retirement Income Guide
              </Link>
              <Link href="/content/annuities-explained-secure-your-retirement-income-with-confidence" className="block hover:text-[#36596A] transition-colors">
                Annuities Explained: Secure Your Retirement
              </Link>
              <Link href="/content/reverse-mortgage-vs-home-equity-loan-for-seniors-a-comprehensive-guide" className="block hover:text-[#36596A] transition-colors">
                Reverse Mortgage vs Home Equity Loan
              </Link>
              <Link href="/content/social-security-spousal-benefits-guide" className="block hover:text-[#36596A] transition-colors">
                Social Security Spousal Benefits
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#36596A] mb-4">Legal</h3>
            <div className="space-y-2 text-gray-600">
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

        {/* Funnel-Specific Disclaimer Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Important Disclaimers</h3>
            <div className="text-sm text-yellow-800 space-y-3">
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
              <p>
                <strong>Third-Party Services:</strong> We may connect you with third-party service providers. We are not 
                responsible for the services or advice provided by third parties.
              </p>
            </div>
          </div>

          {/* Legal Links */}
          <div className="mb-6">
            <h4 className="font-semibold text-[#36596A] mb-3">Legal Documents</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
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

          {/* Copyright */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              © 2024 SeniorSimple. All rights reserved. | Licensed Insurance Agency
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FunnelFooter;






