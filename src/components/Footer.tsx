import Link from 'next/link';
import { SITE, HUBS, NETWORK, NETWORK_SITES } from '@/lib/publisher/site-config';

/**
 * SMN publisher chassis — extended footer (WO-1507, spec §4).
 *   Zone A — topic hubs (sitewide internal link equity to every hub + directory)
 *   Zone B — Simple Media Network sister sites (life-stage cross-sell)
 *   Zone C — external monetization (partner/carrier links, rel="sponsored") → WO-F, not yet populated
 *   Zone D — trust & legal (disclosure, legal pages, contact)
 */

const POPULAR_GUIDES = [
  { name: 'Tax-Free Retirement Income Guide', href: '/content/tax-free-retirement-income-complete-guide' },
  { name: 'Annuities Explained', href: '/content/annuities-explained-secure-your-retirement-income-with-confidence' },
  { name: 'Reverse Mortgage vs. Home Equity Loan', href: '/content/reverse-mortgage-vs-home-equity-loan-for-seniors-a-comprehensive-guide' },
  { name: 'Social Security Spousal Benefits', href: '/content/social-security-spousal-benefits-guide' },
];

const TOOLS = [
  { name: SITE.primaryCta.label, href: SITE.primaryCta.href },
  { name: 'Retirement Calculators', href: '/calculators' },
  { name: 'Free Tools', href: '/tools' },
  { name: 'Resource Library', href: '/resources' },
];

const LEGAL = [
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Terms of Service', href: '/terms-of-service' },
  { name: 'Disclaimers', href: '/disclaimers' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
];

const linkCls = 'block text-gray-600 hover:text-[#36596A] transition-colors';
const headCls = 'text-sm font-semibold uppercase tracking-wide text-[#36596A] mb-4';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-50 border-t border-gray-200 text-sm">
      {/* Zone A — topic hubs */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <nav aria-label="Topics">
          <h2 className={headCls}>Topics</h2>
          <ul className="space-y-2">
            {HUBS.map((h) => (
              <li key={h.key}><Link href={h.href} className={linkCls}>{h.name}</Link></li>
            ))}
            <li><Link href={SITE.directory.href} className={`${linkCls} font-medium`}>{SITE.directory.name} →</Link></li>
          </ul>
        </nav>
        <nav aria-label="Popular guides">
          <h2 className={headCls}>Popular Guides</h2>
          <ul className="space-y-2">
            {POPULAR_GUIDES.map((g) => (
              <li key={g.href}><Link href={g.href} className={linkCls}>{g.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Tools">
          <h2 className={headCls}>Tools</h2>
          <ul className="space-y-2">
            {TOOLS.map((t) => (
              <li key={t.href}><Link href={t.href} className={linkCls}>{t.name}</Link></li>
            ))}
          </ul>
        </nav>
        {/* Zone B — network */}
        <nav aria-label={NETWORK.name}>
          <h2 className={headCls}>Part of {NETWORK.name}</h2>
          <ul className="space-y-2">
            {NETWORK_SITES.map((s) => (
              <li key={s.href}>
                <a href={s.href} className={linkCls}>
                  {s.name} <span className="text-gray-400">· {s.blurb}</span>
                </a>
              </li>
            ))}
            <li><a href={NETWORK.href} className={linkCls}>About {NETWORK.name}</a></li>
          </ul>
        </nav>
      </div>

      {/* Zone D — trust & legal */}
      <div className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-4 text-gray-500">
          <p className="max-w-4xl leading-relaxed">
            {SITE.name} publishes free educational content for people 55 and older. Our articles, tools, and quizzes are
            for educational purposes only and do not constitute individualized financial, tax, legal, or medical advice.
            Some links may connect you with licensed professionals or partners who may compensate us; see our{' '}
            <Link href="/disclaimers" className="underline hover:text-[#36596A]">Disclaimers</Link>.
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL.map((l) => (
                <li key={l.href}><Link href={l.href} className="hover:text-[#36596A]">{l.name}</Link></li>
              ))}
            </ul>
            <p>
              {SITE.phoneDisplay} · {SITE.email}
            </p>
          </div>
          <p>© {year} {SITE.name}, a {NETWORK.name} property. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
