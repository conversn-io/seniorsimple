import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="py-16 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-semibold text-[#36596A] mb-6 senior-friendly-text">Get in Touch</h3>
            <div className="space-y-4 text-gray-600">
              <Link 
                href="/contact" 
                className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text"
              >
                Contact Us
              </Link>
              <p className="senior-friendly-text">Phone: (888) 440-9669</p>
              <p className="senior-friendly-text">Email: info@seniorsimple.com</p>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#36596A] mb-6 senior-friendly-text">Resources</h3>
            <div className="space-y-4 text-gray-600">
              <Link 
                href="/retirement" 
                className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text"
              >
                Retirement
              </Link>
              <Link 
                href="/estate" 
                className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text"
              >
                Estate Planning
              </Link>
              <Link 
                href="/health" 
                className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text"
              >
                Health & Medicare
              </Link>
              <Link 
                href="/housing" 
                className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text"
              >
                Housing
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#36596A] mb-6 senior-friendly-text">Learn More</h3>
            <div className="space-y-4 text-gray-600">
              <Link 
                href="/articles" 
                className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text"
              >
                Articles
              </Link>
              <Link 
                href="/faq" 
                className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text"
              >
                FAQ
              </Link>
              <Link 
                href="/ebook" 
                className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text"
              >
                Free Book
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#36596A] mb-6 senior-friendly-text">Legal</h3>
            <div className="space-y-4 text-gray-600">
              <a href="#" className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text">
                Privacy Policy
              </a>
              <a href="#" className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text">
                Terms of Service
              </a>
              <a href="#" className="block hover:text-[#36596A] transition-colors focus-visible-enhanced p-1 -m-1 rounded touch-target senior-friendly-text">
                Disclaimers
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-base text-gray-500 senior-friendly-text">
            © 2024 SeniorSimple. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
