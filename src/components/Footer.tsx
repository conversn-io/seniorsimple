import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-[#36596A] mb-4">Get in Touch</h3>
            <div className="space-y-2 text-gray-600">
              <Link href="/contact" className="block hover:text-[#36596A] transition-colors">
                Contact Us
              </Link>
              <p>Phone: (888) 440-9669</p>
              <p>Email: info@seniorsimple.com</p>
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
              <Link href="/content" className="block hover:text-[#36596A] transition-colors">
                Content Library
              </Link>
              <Link href="/content/tax-free-retirement-income-complete-guide" className="block hover:text-[#36596A] transition-colors">
                Tax-Free Retirement Guide
              </Link>
              <Link href="/content/annuities-explained-secure-your-retirement-income-with-confidence" className="block hover:text-[#36596A] transition-colors">
                Annuities Explained
              </Link>
              <Link href="/content/reverse-mortgage-vs-home-equity-loan-for-seniors-a-comprehensive-guide" className="block hover:text-[#36596A] transition-colors">
                Reverse Mortgage Guide
              </Link>
              <Link href="/content/social-security-spousal-benefits-guide" className="block hover:text-[#36596A] transition-colors">
                Social Security Benefits
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#36596A] mb-4">Legal</h3>
            <div className="space-y-2 text-gray-600">
              <p>Privacy Policy</p>
              <p>Terms of Service</p>
              <p>Disclaimers</p>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            © 2024 SeniorSimple. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;