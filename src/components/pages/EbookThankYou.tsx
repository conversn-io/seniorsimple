'use client';

import { useSearchParams } from 'next/navigation';
import { useStandaloneLayout } from '../../hooks/useFunnelFooter';

type OfferKey = 'annuity-dos-donts' | 'simple-annuity-strategies' | 'retirement-rescue-kit';

type DownloadFile = { name: string; href: string };
type Offer = {
  title: string;
  headlineTemplate: string;
  files: DownloadFile[];
};

const OFFERS: Record<OfferKey, Offer> = {
  'annuity-dos-donts': {
    title: "Annuity Do's and Don'ts for Baby Boomers",
    headlineTemplate: 'Your guide is ready, {name}',
    files: [
      { name: "Annuity Do's & Don'ts for Baby Boomers", href: '/downloads/ebook/annuity-dos-donts.pdf' },
      { name: 'Retirement Income Gap Worksheet', href: '/downloads/ebook/income-gap-worksheet.pdf' },
    ],
  },
  'simple-annuity-strategies': {
    title: 'Simple Annuity Strategies',
    headlineTemplate: 'Your guide is ready, {name}',
    files: [
      { name: 'Simple Annuity Strategies', href: '/downloads/ebook/simple-annuity-strategies.pdf' },
      { name: 'Income Maximizer Worksheet + Strategy Comparison Chart', href: '/downloads/ebook/income-maximizer-worksheet.pdf' },
    ],
  },
  'retirement-rescue-kit': {
    title: 'Retirement Rescue Kit',
    headlineTemplate: 'Your complete Kit is ready, {name}',
    files: [
      { name: "Annuity Do's & Don'ts for Baby Boomers", href: '/downloads/ebook/annuity-dos-donts.pdf' },
      { name: 'Simple Annuity Strategies', href: '/downloads/ebook/simple-annuity-strategies.pdf' },
      { name: 'Retirement Income Gap Worksheet', href: '/downloads/ebook/income-gap-worksheet.pdf' },
      { name: 'Income Maximizer Worksheet', href: '/downloads/ebook/income-maximizer-worksheet.pdf' },
    ],
  },
};

const FOOTNOTE =
  '*Illustrative and educational. “Up to 33%” refers to the combined impact that taxes, fees, and timing decisions can have on retirement income over time, based on the strategies discussed in this guide. Individual results vary and are not guaranteed.';

const SsLogo = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E4CDA1" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V8" />
    <path d="M9 8h6" />
    <path d="M10 8a2 2 0 1 1 4 0" />
    <path d="M5 22h14" />
    <path d="M6 22l1.5-6h9L18 22" />
  </svg>
);

export default function EbookThankYou() {
  useStandaloneLayout();

  const params = useSearchParams();
  const rawDl = (params?.get('dl') || '') as OfferKey;
  const key: OfferKey = OFFERS[rawDl] ? rawDl : 'retirement-rescue-kit';
  const offer = OFFERS[key];
  const name = (params?.get('name') || '').trim() || 'friend';
  const headline = offer.headlineTemplate.replace('{name}', name);
  const isKit = key === 'retirement-rescue-kit';
  const sub =
    "We've emailed your download link — check your inbox. Everything is also below, ready whenever you are.";
  const smsLine =
    "Check your inbox — we just emailed your download link. Can't find it? It can take a minute, or tap any button above to download right now.";

  return (
    <>
      <style jsx global>{`
        @keyframes tyPop {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          60% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .ty-dl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 18px;
        }
        .ty-next-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 34px;
          align-items: center;
        }
        .ty-foot-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 40px;
        }
        @media (max-width: 820px) {
          .ty-next-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .ty-foot-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
          }
          .ty-navlinks {
            display: none !important;
          }
        }
        @media (max-width: 560px) {
          .ty-foot-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ maxWidth: '100%', overflowX: 'hidden', background: '#F5F5F0', color: '#171717', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        {/* NAV */}
        <header style={{ background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" aria-label="SeniorSimple" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logos/senior-simple-logo-rectangle-header.png"
                alt="SeniorSimple"
                width={200}
                height={40}
                style={{ height: 40, width: 'auto', maxWidth: 200, display: 'block' }}
              />
            </a>
            <nav className="ty-navlinks" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
              <span style={{ fontSize: 15, color: '#737373' }}>Guides</span>
              <span style={{ fontSize: 15, color: '#737373' }}>How It Works</span>
              <span style={{ fontSize: 15, color: '#737373' }}>About</span>
            </nav>
          </div>
        </header>

        {/* CONFIRMATION HERO */}
        <section style={{ background: '#36596A', backgroundImage: 'radial-gradient(120% 90% at 80% 0%,#3f6678 0%,#36596A 55%,#2f4e5d 100%)', color: '#fff', padding: '64px 24px 72px', textAlign: 'center' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ width: 74, height: 74, borderRadius: '50%', background: 'rgba(228,205,161,.18)', border: '2px solid #E4CDA1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'tyPop .5s cubic-bezier(.2,.8,.2,1) both' }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#E4CDA1" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{ display: 'inline-block', background: '#E4CDA1', color: '#3a3320', fontSize: 12.5, fontWeight: 700, letterSpacing: '.08em', padding: '7px 13px', borderRadius: 999, textTransform: 'uppercase' }}>You&apos;re All Set</span>
            <h1 style={{ fontFamily: 'Georgia, "Times New Roman", ui-serif, serif', fontWeight: 600, fontSize: 42, lineHeight: 1.1, margin: '18px 0 0', letterSpacing: '-.01em', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>{headline}</h1>
            <p style={{ fontSize: 19, lineHeight: 1.55, color: '#dbe5ea', margin: '16px auto 0', maxWidth: '46ch', textWrap: 'pretty' as React.CSSProperties['textWrap'] }}>{sub}</p>
          </div>
        </section>

        {/* DOWNLOAD CARD */}
        <section style={{ padding: '0 24px', marginTop: -44, position: 'relative', zIndex: 5 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 18, boxShadow: '0 24px 56px rgba(0,0,0,.12)', padding: '34px 30px' }}>
            <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#a8895a', margin: '0 0 4px' }}>{isKit ? 'Your Complete Kit' : 'Your Free Download'}</p>
            <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#36596A', margin: '0 0 22px', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>{isKit ? 'Download your guides & worksheets' : 'Download your guide'}</h2>
            <div className="ty-dl-grid">
              {offer.files.map((d, i) => (
                <a
                  key={i}
                  href={d.href}
                  download
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 15, background: '#F5F5F0', border: '1.5px solid #E5E7EB', borderRadius: 13, padding: 18, transition: 'border-color .18s, background .18s' }}
                >
                  <div style={{ flexShrink: 0, width: 48, height: 60, borderRadius: 5, background: 'linear-gradient(150deg,#3f6678,#2f4e5d)', borderLeft: '4px solid #29424f', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8, boxShadow: '0 6px 14px rgba(0,0,0,.16)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E4CDA1" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', lineHeight: 1.3 }}>{d.name}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: '#36596A', marginTop: 4 }}>
                      Download PDF
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 22, background: '#eef4f1', border: '1px solid #d9e6df', borderRadius: 11, padding: '14px 16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2f7d5b" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 6 12 13 2 6" />
              </svg>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: '#3c5a4c' }}>{smsLine}</p>
            </div>
          </div>
        </section>

        {/* NEXT STEP: WALKTHROUGH */}
        <section style={{ padding: '72px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div className="ty-next-grid" style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 18, boxShadow: '0 4px 18px rgba(54,89,106,.06)', padding: '38px 34px' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#a8895a', margin: 0 }}>Your Next Step</p>
                <h2 style={{ fontSize: 27, fontWeight: 700, color: '#36596A', margin: '9px 0 0', lineHeight: 1.25, textWrap: 'balance' as React.CSSProperties['textWrap'] }}>Want a 15-minute look at your own income gap?</h2>
                <p style={{ fontSize: 17, lineHeight: 1.55, color: '#374151', margin: '13px 0 0', textWrap: 'pretty' as React.CSSProperties['textWrap'] }}>Read the guide first, then talk it through with a SeniorSimple-vetted specialist — no obligation. Most readers use the call to pressure-test one decision before they make it.</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {['15 focused minutes — by phone, on your schedule', 'No sales pitch, no pressure — just answers to your questions', 'A $200 value — yours free as a reader'].map((line, i) => (
                    <li key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 15.5, color: '#374151' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a8895a" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {line}
                    </li>
                  ))}
                </ul>
                <a href="/booking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 26, background: '#36596A', color: '#fff', fontSize: 17, fontWeight: 700, padding: '15px 30px', borderRadius: 9, borderBottom: '3px solid #E4CDA1' }}>
                  Talk to a Specialist
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
              <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 14px 32px rgba(54,89,106,.16)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/ebook/hero-couple.jpg" alt="A retired couple reviewing their plan at home" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', minHeight: 240 }} />
              </div>
            </div>

            <div style={{ marginTop: 30, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
              {[
                { label: 'Fiduciary-Aligned', d: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
                { label: 'Senior-Centered Education', d: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></> },
                { label: 'No Obligation, Ever', d: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 999, padding: '11px 20px' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(228,205,161,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#36596A' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#36596A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      {t.d}
                    </svg>
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#36596A' }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#2b4754', color: '#aebfc8', padding: '56px 24px 30px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="ty-foot-grid">
              <div>
                <a href="/" aria-label="SeniorSimple" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', marginBottom: 14 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logos/senior-simple-logo-rectangle-header.png"
                    alt="SeniorSimple"
                    width={180}
                    height={36}
                    style={{ height: 36, width: 'auto', maxWidth: 200, display: 'block', filter: 'brightness(0) invert(1)' }}
                  />
                </a>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: '30ch' }}>Senior-centered retirement education. Calm, clear guidance for the decisions that matter most.</p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#E4CDA1', marginBottom: 14 }}>Guides</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14 }}>
                  <li>Annuity Do&apos;s &amp; Don&apos;ts</li>
                  <li>Simple Annuity Strategies</li>
                  <li>Retirement Rescue Kit</li>
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#E4CDA1', marginBottom: 14 }}>Company</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14 }}>
                  <li>About</li>
                  <li>How It Works</li>
                  <li>Contact</li>
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#E4CDA1', marginBottom: 14 }}>Legal</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14 }}>
                  <li>Privacy Policy</li>
                  <li>Terms</li>
                  <li>Disclosures</li>
                </ul>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', marginTop: 38, paddingTop: 24 }}>
              <p style={{ fontSize: 12.5, lineHeight: 1.65, margin: '0 0 14px', color: '#8ea3ad' }}>{FOOTNOTE}</p>
              <p style={{ fontSize: 12.5, lineHeight: 1.65, margin: 0, color: '#8ea3ad' }}>
                This guide is educational and is not investment, tax, legal, or insurance advice. Annuity and insurance products are offered through licensed insurance professionals; products, features, and rates vary by individual and are not available in all states. Figures shown are illustrative, results vary, and nothing here is guaranteed. We may connect you with third-party licensed professionals and are not responsible for their services. Consult a licensed professional before making financial decisions.
              </p>
              <p style={{ fontSize: 12.5, margin: '20px 0 0', color: '#6f868f' }}>© {new Date().getFullYear()} SeniorSimple. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
