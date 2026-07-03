'use client';

import { useEffect, useState } from 'react';
import { useStandaloneLayout } from '../../hooks/useFunnelFooter';

export type EbookFunnelKey =
  | 'annuity-dos-donts'
  | 'simple-annuity-strategies'
  | 'retirement-made-simple';

type Bullet = { lead: string; text: string };
type StackItem = { name: string; desc: string; value: string };

type Funnel = {
  h1a: string;
  h1em?: string;
  h1b?: string;
  subA: string;
  subHi: string;
  subB: string;
  bullets: Bullet[];
  heroCta: string;
  /** Flat cover PNG rendered inside the 3D paperback front face. Not used when isKit is true (kit renders a hardcoded pair). */
  coverFlat?: string;
  coverAlt: string;
  isKit?: boolean;
  stack: StackItem[];
  stackTotal: string;
  finalTitle: string;
  finalSub: string;
  finalCta: string;
  finalMicro: string;
  ebookTitle: string;
};

const FUNNELS: Record<EbookFunnelKey, Funnel> = {
  'annuity-dos-donts': {
    h1a: "The Annuity Do's & Don'ts Every Baby Boomer Should Read First",
    subA: 'The avoidable mistakes that can quietly cost you ',
    subHi: 'up to 33% of your total retirement income',
    subB: ' — and the simple checklist to sidestep every one.',
    bullets: [
      { lead: '', text: "The 7 annuity “don'ts” that drain income without you noticing" },
      { lead: '', text: 'How to spot a bad rider, a high fee, or the wrong timing before you sign' },
      { lead: '', text: 'The questions to ask any agent — so you stay in control' },
    ],
    heroCta: 'Send Me the Free Book',
    coverFlat: '/images/ebook/cover-dosdonts-flat.png',
    coverAlt: "Annuity Do's & Don'ts for Baby Boomers — free guide cover",
    stack: [
      { name: "Annuity Do's & Don'ts (68-pg guide)", desc: 'so you never sign the wrong contract', value: '$49 value' },
      { name: 'Retirement Income Gap Worksheet', desc: 'see your real monthly shortfall in 10 minutes', value: '$99 value' },
      { name: "“10 Questions to Ask Any Agent” card", desc: 'stay in control of every conversation', value: '$29 value' },
      { name: '15-minute Income Strategy Call', desc: 'with a licensed professional — no obligation, ever', value: '$200 value' },
    ],
    stackTotal: '$377',
    finalTitle: "Get the Free Annuity Do's & Don'ts Guide",
    finalSub: 'The pitfalls to avoid and the checklist to use — in your hands in the next two minutes.',
    finalCta: 'Get the Free Guide',
    finalMicro: 'Instant download — check your inbox.',
    ebookTitle: "Annuity Do's and Don'ts for Baby Boomers",
  },
  'simple-annuity-strategies': {
    h1a: '',
    h1em: 'Simple',
    h1b: ' Annuity Strategies: How to Get More From the Same Retirement Dollars',
    subA: 'The newer annuity strategies that may help you keep ',
    subHi: 'up to 33% more total income',
    subB: ' — without taking on more market risk.',
    bullets: [
      { lead: '', text: 'How modern income riders can pay you more, longer' },
      { lead: '', text: 'The sequencing move that can stretch the same savings further' },
      { lead: '', text: "Why the “default” annuity often leaves money on the table" },
    ],
    heroCta: 'Reveal the Strategies',
    coverFlat: '/images/ebook/cover-strategies-flat.png',
    coverAlt: 'Simple Annuity Strategies — free guide cover',
    stack: [
      { name: 'Simple Annuity Strategies guide', desc: 'get more from the same dollars', value: '$49 value' },
      { name: 'Income Maximizer Worksheet', desc: 'model your optimized monthly income', value: '$99 value' },
      { name: 'Strategy Comparison Chart', desc: 'see default vs. optimized side by side', value: '$39 value' },
      { name: '15-minute Income Strategy Call', desc: 'with a licensed professional — no obligation, ever', value: '$200 value' },
    ],
    stackTotal: '$387',
    finalTitle: 'Get the Free Simple Strategies Guide',
    finalSub: "The modern moves most agents don't lead with — yours to read in the next two minutes.",
    finalCta: 'Reveal the Strategies',
    finalMicro: 'Instant download — check your inbox.',
    ebookTitle: 'Simple Annuity Strategies',
  },
  'retirement-made-simple': {
    h1a: 'Retirement Made ',
    h1em: 'Simple',
    h1b: '',
    subA: 'Structure your retirement with annuities to receive ',
    subHi: 'up to 33% more income',
    subB: '.',
    bullets: [
      { lead: "Guide 1 — The Don'ts: ", text: 'avoid the annuity mistakes that quietly cost you' },
      { lead: "Guide 2 — The Do's: ", text: 'the strategies to get more from the same dollars' },
      { lead: 'The Toolkit: ', text: 'worksheets + a one-page audit to put it all to work' },
    ],
    heroCta: 'Get the Free Guides',
    isKit: true,
    coverAlt: 'Retirement Made Simple — both free guides, fanned together',
    stack: [
      { name: "Annuity Do's & Don'ts guide", desc: 'stop the leaks before they start', value: '$49 value' },
      { name: 'Simple Annuity Strategies guide', desc: 'get more from the same dollars', value: '$49 value' },
      { name: 'Retirement Income Gap Worksheet', desc: 'see your real monthly shortfall', value: '$99 value' },
      { name: 'Income Maximizer Worksheet', desc: 'model your optimized income', value: '$99 value' },
      { name: "“10 Questions” card + 1-page audit", desc: 'stay in control of every conversation', value: '$39 value' },
      { name: '15-minute Income Strategy Call', desc: 'with a licensed professional — no obligation, ever', value: '$200 value' },
    ],
    stackTotal: '$535',
    finalTitle: 'Get Retirement Made Simple — Free',
    finalSub: 'Both guides + all worksheets, in one free kit — yours in the next two minutes.',
    finalCta: 'Get the Free Guides',
    finalMicro: 'Both guides + all worksheets — check your inbox.',
    ebookTitle: 'Retirement Made Simple',
  },
};

const SUBMIT_ENDPOINT = '/api/ebook/submit';

const THIRTY_THREE_FOOTNOTE =
  '*Illustrative and educational. “Up to 33%” refers to the combined impact that taxes, fees, and timing decisions can have on retirement income over time, based on the strategies discussed in this guide. Individual results vary and are not guaranteed.';

const TESTIMONIALS = [
  { quote: 'Placeholder — replace with a real, disclosed reader quote before launch.', name: 'Reader name', disclosure: 'Client · disclosure pending', avatar: '/images/ebook/avatar-1.jpg' },
  { quote: 'Placeholder — replace with a real, disclosed reader quote before launch.', name: 'Reader name', disclosure: 'Client · disclosure pending', avatar: '/images/ebook/avatar-2.jpg' },
  { quote: 'Placeholder — replace with a real, disclosed reader quote before launch.', name: 'Reader name', disclosure: 'Client · disclosure pending', avatar: '/images/ebook/avatar-3.jpg' },
];

const TRUST = [
  { label: 'Fiduciary-Aligned' },
  { label: 'Senior-Centered Education' },
  { label: 'No Obligation, Ever' },
];

async function submitLead(funnelKey: EbookFunnelKey, firstName: string, email: string) {
  const utm =
    typeof window !== 'undefined' && (window as unknown as { __utmSessionId?: string | null }).__utmSessionId
      ? (window as unknown as { __utmSessionId?: string | null }).__utmSessionId
      : null;
  const body = {
    funnel: funnelKey,
    first_name: firstName || '',
    email: email || '',
    page_url: typeof location !== 'undefined' ? location.href : '',
    utm_session_id: utm,
  };
  try {
    const res = await fetch(SUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (e) {
    console.error('[ebook-submit] client fetch error', e);
    return { ok: false };
  }
}

const ArrowRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const Check = ({ size = 14, color = '#E4CDA1' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TOP_EDGES_H = 'repeating-linear-gradient(to right,#f4efe4 0 1px,#d9d2c0 1px 2.5px)';
const SIDE_EDGES_V = 'repeating-linear-gradient(to bottom,#f4efe4 0 1px,#d4ccb8 1px 2.5px)';
const SPINE_GRADIENT = 'linear-gradient(90deg,#22323b 0%,#2f4e5d 55%,#3a5f70 100%)';

/** Single 3D paperback with a `coverFlat` image on the front face. */
function SingleBook({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="ss-bookstage" style={{ padding: '14px 36px 6px', filter: 'drop-shadow(-26px 34px 26px rgba(20,35,43,.42))' }}>
      <div style={{ position: 'relative', width: 300, height: 392, margin: '0 auto', transformStyle: 'preserve-3d', transform: 'perspective(2200px) rotateY(-26deg) rotateX(5deg)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 300, height: 34, transform: 'translateY(-17px) rotateX(90deg)', background: TOP_EDGES_H }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 34, height: 392, transform: 'translateX(283px) rotateY(90deg)', background: SIDE_EDGES_V }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 34, height: 392, transform: 'translateX(-17px) rotateY(-90deg)', background: SPINE_GRADIENT, borderRight: '2px solid rgba(228,205,161,.5)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 300, height: 392, transform: 'translateZ(17px)', borderRadius: '2px 5px 5px 2px', overflow: 'hidden', boxShadow: 'inset 6px 0 14px rgba(0,0,0,.16), inset 0 0 0 1px rgba(0,0,0,.05)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} decoding="async" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: '100%', background: 'linear-gradient(90deg,rgba(0,0,0,.22),rgba(0,0,0,0))' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 34%)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
}

/** Two fanned paperbacks for the bundle: Strategies in front, Don'ts behind. */
function KitBooks() {
  return (
    <div className="ss-bookstage" style={{ padding: '18px 20px 6px' }}>
      <div style={{ position: 'relative', width: 452, height: 420, margin: '0 auto', filter: 'drop-shadow(-20px 30px 26px rgba(20,35,43,.4))' }}>
        {/* BACK: Annuity Do's & Don'ts */}
        <div style={{ position: 'absolute', left: 150, top: 30, zIndex: 1, width: 236, height: 309, transformStyle: 'preserve-3d', transform: 'perspective(2400px) rotateY(-31deg) rotateX(5deg)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 236, height: 30, transform: 'translateY(-15px) rotateX(90deg)', background: TOP_EDGES_H }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 30, height: 309, transform: 'translateX(221px) rotateY(90deg)', background: SIDE_EDGES_V }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 30, height: 309, transform: 'translateX(-15px) rotateY(-90deg)', background: SPINE_GRADIENT, borderRight: '2px solid rgba(228,205,161,.5)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 236, height: 309, transform: 'translateZ(15px)', borderRadius: '2px 5px 5px 2px', overflow: 'hidden', boxShadow: 'inset 6px 0 14px rgba(0,0,0,.18)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ebook/cover-dosdonts-flat.png" alt="Annuity Do's & Don'ts guide cover" decoding="async" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: '100%', background: 'linear-gradient(90deg,rgba(0,0,0,.24),rgba(0,0,0,0))' }} />
          </div>
        </div>
        {/* FRONT: Simple Annuity Strategies */}
        <div style={{ position: 'absolute', left: 4, top: 0, zIndex: 2, width: 272, height: 356, transformStyle: 'preserve-3d', transform: 'perspective(2400px) rotateY(-22deg) rotateX(4deg)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 272, height: 34, transform: 'translateY(-17px) rotateX(90deg)', background: TOP_EDGES_H }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 34, height: 356, transform: 'translateX(255px) rotateY(90deg)', background: SIDE_EDGES_V }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 34, height: 356, transform: 'translateX(-17px) rotateY(-90deg)', background: SPINE_GRADIENT, borderRight: '2px solid rgba(228,205,161,.5)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: 272, height: 356, transform: 'translateZ(17px)', borderRadius: '2px 5px 5px 2px', overflow: 'hidden', boxShadow: 'inset 6px 0 14px rgba(0,0,0,.16), inset 0 0 0 1px rgba(0,0,0,.05)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ebook/cover-strategies-flat.png" alt="Simple Annuity Strategies guide cover" decoding="async" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: '100%', background: 'linear-gradient(90deg,rgba(0,0,0,.22),rgba(0,0,0,0))' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,rgba(255,255,255,.16) 0%,rgba(255,255,255,0) 34%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const Star = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="#36596A">
    <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
  </svg>
);

export default function EbookFunnel({ funnel }: { funnel: EbookFunnelKey }) {
  useStandaloneLayout();

  const f = FUNNELS[funnel];
  const [modalOpen, setModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [errEmail, setErrEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) closeForm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const openForm = () => setModalOpen(true);
  const closeForm = () => setModalOpen(false);

  const onSubmit = async () => {
    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setErrEmail('That email looks off — mind checking it?');
      return;
    }
    setErrEmail('');
    setSubmitting(true);
    await submitLead(funnel, firstName.trim(), trimmed);
    const params = new URLSearchParams({ dl: funnel });
    if (firstName.trim()) params.set('name', firstName.trim());
    window.location.href = `/ebook/thank-you?${params.toString()}`;
  };

  return (
    <>
      <style jsx global>{`
        @keyframes ssPulse {
          0%,
          100% {
            box-shadow: 0 4px 14px rgba(228, 205, 161, 0), 0 8px 22px rgba(54, 89, 106, 0.28);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(228, 205, 161, 0.28), 0 8px 22px rgba(54, 89, 106, 0.28);
          }
        }
        @keyframes ssOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ssDialog {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to { opacity: 1; transform: none; }
        }
        .ss-pulse { animation: ssPulse 2.6s ease-in-out infinite; }
        .ss-hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center; }
        .ss-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(248px, 1fr)); gap: 20px; }
        .ss-foot-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 40px; }
        .ss-mobilebar { display: none; }
        @media (max-width: 900px) {
          .ss-hero-grid { grid-template-columns: 1fr; gap: 36px; }
          .ss-foot-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
          .ss-navlinks { display: none !important; }
          .ss-mobilebar { display: flex !important; }
          .ss-pad { padding-bottom: 96px; }
        }
        @media (max-width: 640px) {
          .ss-foot-grid { grid-template-columns: 1fr 1fr; }
          .ss-hero { padding: 32px 20px 40px !important; }
          .ss-hero-grid { gap: 26px !important; }
          .ss-hero-media { order: -1; }
          .ss-bookstage { transform: scale(0.82); transform-origin: center top; }
          .ss-h1 { font-size: 32px !important; line-height: 1.14 !important; }
          .ss-subhead { font-size: 18px !important; max-width: 100% !important; }
          .ss-bullet { font-size: 16px !important; }
          .ss-hero-cta { width: 100% !important; justify-content: center !important; font-size: 17px !important; padding: 16px 18px !important; }
          .ss-sec { padding: 52px 20px !important; }
          .ss-h2 { font-size: 25px !important; }
          .ss-h2-final { font-size: 27px !important; }
          .ss-stack-wrap { max-width: 100% !important; }
        }
        @media (max-width: 380px) {
          .ss-foot-grid { grid-template-columns: 1fr; }
          .ss-h1 { font-size: 29px !important; }
        }
      `}</style>

      <div className="ss-pad" style={{ maxWidth: '100%', overflowX: 'hidden', color: '#171717', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        {/* NAV */}
        <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" aria-label="SeniorSimple" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logos/senior-simple-logo-rectangle-header.png" alt="SeniorSimple" width={200} height={40} style={{ height: 40, width: 'auto', maxWidth: 200, display: 'block' }} />
            </a>
            <nav className="ss-navlinks" style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
              <span style={{ fontSize: 15, color: '#737373', cursor: 'pointer' }}>Guides</span>
              <span style={{ fontSize: 15, color: '#737373', cursor: 'pointer' }}>How It Works</span>
              <span style={{ fontSize: 15, color: '#737373', cursor: 'pointer' }}>About</span>
            </nav>
            <button onClick={openForm} style={{ border: 'none', cursor: 'pointer', background: '#36596A', color: '#fff', fontSize: 15, fontWeight: 600, padding: '11px 22px', borderRadius: 8, borderBottom: '3px solid #E4CDA1', fontFamily: 'inherit' }}>
              Get Started
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="ss-hero" style={{ background: '#36596A', backgroundImage: 'radial-gradient(120% 90% at 85% 10%,#3f6678 0%,#36596A 55%,#2f4e5d 100%)', color: '#fff', padding: '64px 24px 76px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }} className="ss-hero-grid">
            <div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#E4CDA1', color: '#33404a', fontSize: 13, fontWeight: 700, letterSpacing: '.02em', padding: '8px 17px', borderRadius: 999 }}>
                  <span style={{ display: 'inline-flex', gap: 1 }}>
                    <Star /><Star /><Star /><Star /><Star />
                  </span>
                  Trusted by over 23,000 seniors
                </span>
              </div>
              <h1 className="ss-h1" style={{ fontFamily: 'Georgia, "Times New Roman", ui-serif, serif', fontWeight: 600, fontSize: 48, lineHeight: 1.06, margin: '22px 0 0', letterSpacing: '-.01em', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
                {f.h1a}
                {f.h1em ? (
                  <span style={{ color: '#E4CDA1', textDecoration: 'underline', textDecorationColor: 'rgba(228,205,161,.55)', textDecorationThickness: '4px', textUnderlineOffset: '8px' }}>
                    {f.h1em}
                  </span>
                ) : null}
                {f.h1b || ''}
              </h1>
              <p className="ss-subhead" style={{ fontSize: 21, lineHeight: 1.45, color: '#e3ebef', margin: '20px 0 0', maxWidth: '34ch', textWrap: 'pretty' as React.CSSProperties['textWrap'] }}>
                {f.subA}
                <span style={{ color: '#E4CDA1', fontWeight: 700 }}>{f.subHi}</span>
                {f.subB}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0 0', display: 'flex', flexDirection: 'column', gap: 13 }}>
                {f.bullets.map((b, i) => (
                  <li key={i} className="ss-bullet" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 17, lineHeight: 1.45, color: '#eef3f5' }}>
                    <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, background: 'rgba(228,205,161,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                      <Check />
                    </span>
                    <span>
                      {b.lead ? <strong style={{ color: '#fff', fontWeight: 700 }}>{b.lead}</strong> : null}
                      {b.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 30 }}>
                <button
                  onClick={openForm}
                  className="ss-pulse ss-hero-cta"
                  style={{ border: 'none', cursor: 'pointer', background: '#E4CDA1', color: '#36414a', fontSize: 18, fontWeight: 700, padding: '17px 32px', borderRadius: 9, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 9 }}
                >
                  {f.heroCta}
                  <ArrowRight size={19} />
                </button>
              </div>
            </div>

            <div className="ss-hero-media" style={{ display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'center', justifyContent: 'center' }}>
              {f.isKit ? (
                <KitBooks />
              ) : f.coverFlat ? (
                <SingleBook src={f.coverFlat} alt={f.coverAlt} />
              ) : null}
            </div>
          </div>
        </section>

        {/* VALUE STACK */}
        <section className="ss-sec" style={{ background: '#F5F5F0', padding: '84px 24px' }}>
          <div className="ss-stack-wrap" style={{ maxWidth: 680, margin: '0 auto' }}>
            <h2 className="ss-h2" style={{ textAlign: 'center', fontSize: 29, fontWeight: 700, color: '#36596A', margin: '0 0 8px', textWrap: 'balance' as React.CSSProperties['textWrap'] }}>
              Everything you get — free today
            </h2>
            <p style={{ textAlign: 'center', fontSize: 16, color: '#737373', margin: '0 0 32px' }}>No credit card. No obligation. Just the guidance.</p>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, boxShadow: '0 4px 18px rgba(54,89,106,.06)', overflow: 'hidden' }}>
              {f.stack.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '17px 22px', borderBottom: '1px solid #F0F0EB' }}>
                  <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: '50%', background: 'rgba(228,205,161,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={15} color="#a8895a" />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16.5, fontWeight: 600, color: '#1f2937' }}>{it.name}</div>
                    <div style={{ fontSize: 14, color: '#737373', fontStyle: 'italic' }}>{it.desc}</div>
                  </div>
                  <div style={{ flexShrink: 0, fontSize: 15, fontWeight: 600, color: '#36596A' }}>{it.value}</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 22px', background: '#36596A', color: '#fff' }}>
                <div>
                  <div style={{ fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: '#aebfc8' }}>Total value</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 600, textDecoration: 'line-through', textDecorationColor: '#E4CDA1', textDecorationThickness: '2px' }}>{f.stackTotal}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', color: '#E4CDA1' }}>Today</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 30, fontWeight: 700 }}>Free</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button onClick={openForm} style={{ border: 'none', cursor: 'pointer', background: '#36596A', color: '#fff', fontSize: 17, fontWeight: 700, padding: '16px 34px', borderRadius: 9, borderBottom: '3px solid #E4CDA1', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                {f.heroCta}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* PROOF + TRUST */}
        <section className="ss-sec" style={{ background: '#fff', padding: '84px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 className="ss-h2" style={{ textAlign: 'center', fontSize: 29, fontWeight: 700, color: '#36596A', margin: '0 0 8px' }}>What readers tell us</h2>
            <p style={{ textAlign: 'center', fontSize: 14, color: '#9ca3af', margin: '0 0 38px' }}>Testimonial slots — real, disclosed quotes supplied before launch.</p>
            <div className="ss-cards">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} style={{ background: '#F5F5F0', border: '1px solid #E5E7EB', borderRadius: 14, padding: '24px 22px' }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
                    {Array.from({ length: 5 }).map((_, k) => (
                      <svg key={k} width="16" height="16" viewBox="0 0 24 24" fill="#E4CDA1" stroke="#E4CDA1" strokeWidth={1}>
                        <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
                      </svg>
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: '#4b5563', fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.avatar} alt="" loading="lazy" decoding="async" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', background: '#e5e7eb' }} />
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1f2937' }}>{t.name}</div>
                      <div style={{ fontSize: 12.5, color: '#9ca3af' }}>{t.disclosure}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 46, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
              {TRUST.map((tr, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#F5F5F0', border: '1px solid #E5E7EB', borderRadius: 999, padding: '11px 20px' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(228,205,161,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#36596A' }}>✓</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#36596A' }}>{tr.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="ss-sec" style={{ background: '#36596A', backgroundImage: 'radial-gradient(120% 90% at 15% 10%,#3f6678 0%,#36596A 55%,#2f4e5d 100%)', color: '#fff', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <h2 className="ss-h2-final" style={{ fontFamily: 'Georgia, serif', fontWeight: 600, fontSize: 36, lineHeight: 1.12, margin: 0, textWrap: 'balance' as React.CSSProperties['textWrap'] }}>{f.finalTitle}</h2>
            <p style={{ fontSize: 18, color: '#dbe5ea', margin: '16px 0 0', lineHeight: 1.5 }}>{f.finalSub}</p>
            <div style={{ marginTop: 30 }}>
              <button onClick={openForm} style={{ border: 'none', cursor: 'pointer', background: '#E4CDA1', color: '#36414a', fontSize: 18, fontWeight: 700, padding: '17px 34px', borderRadius: 9, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                {f.finalCta}
                <ArrowRight size={19} />
              </button>
              <p style={{ fontSize: 13.5, color: '#aebfc8', margin: '14px 0 0' }}>{f.finalMicro}</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#2b4754', color: '#aebfc8', padding: '56px 24px 30px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="ss-foot-grid">
              <div>
                <a href="/" aria-label="SeniorSimple" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', marginBottom: 14 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logos/senior-simple-logo-rectangle-header.png" alt="SeniorSimple" width={180} height={36} style={{ height: 36, width: 'auto', maxWidth: 200, display: 'block', filter: 'brightness(0) invert(1)' }} />
                </a>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: '30ch' }}>Senior-centered retirement education. Calm, clear guidance for the decisions that matter most.</p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#E4CDA1', marginBottom: 14 }}>Guides</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9, fontSize: 14 }}>
                  <li>Annuity Do&apos;s &amp; Don&apos;ts</li>
                  <li>Simple Annuity Strategies</li>
                  <li>Retirement Made Simple</li>
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
              <p style={{ fontSize: 12.5, lineHeight: 1.65, margin: '0 0 14px', color: '#8ea3ad' }}>{THIRTY_THREE_FOOTNOTE}</p>
              <p style={{ fontSize: 12.5, lineHeight: 1.65, margin: 0, color: '#8ea3ad' }}>
                This guide is educational and is not investment, tax, legal, or insurance advice. Annuity and insurance products are offered through licensed insurance professionals; products, features, and rates vary by individual and are not available in all states. Figures shown are illustrative, results vary, and nothing here is guaranteed. We may connect you with third-party licensed professionals and are not responsible for their services. Consult a licensed professional before making financial decisions.
              </p>
              <p style={{ fontSize: 12.5, margin: '20px 0 0', color: '#6f868f' }}>© {new Date().getFullYear()} SeniorSimple. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* STICKY MOBILE BAR */}
        <div className="ss-mobilebar" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50, background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E5E7EB', padding: '10px 16px', boxShadow: '0 -4px 18px rgba(0,0,0,.08)' }}>
          <button onClick={openForm} style={{ border: 'none', cursor: 'pointer', background: '#36596A', color: '#fff', fontSize: 16, fontWeight: 700, padding: 14, borderRadius: 9, borderBottom: '3px solid #E4CDA1', fontFamily: 'inherit', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {f.heroCta}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen ? (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(20,35,43,.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '6vh 18px 40px', animation: 'ssOverlay .2s ease both' }}
        >
          <div style={{ width: '100%', maxWidth: 440, background: '#fff', color: '#171717', borderRadius: 16, boxShadow: '0 24px 70px rgba(0,0,0,.34)', padding: '30px 26px 26px', position: 'relative', margin: 'auto 0', animation: 'ssDialog .26s cubic-bezier(.2,.8,.2,1) both' }}>
            <button
              onClick={closeForm}
              aria-label="Close"
              style={{ position: 'absolute', top: 13, right: 13, width: 34, height: 34, border: 'none', background: '#F5F5F0', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#737373' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#36596A' }}>Get your free guide</h3>
              <p style={{ margin: '5px 0 0', fontSize: 14.5, color: '#737373' }}>Tell us where to send it — takes 20 seconds.</p>
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>First name</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    placeholder="Margaret"
                    style={{ width: '100%', height: 50, border: '1.5px solid #E5E7EB', borderRadius: 9, padding: '0 14px', fontSize: 17, fontFamily: 'inherit', color: '#171717', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email address</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !submitting) onSubmit();
                    }}
                    style={{ width: '100%', height: 50, border: '1.5px solid #E5E7EB', borderRadius: 9, padding: '0 14px', fontSize: 17, fontFamily: 'inherit', color: '#171717', outline: 'none' }}
                  />
                  {errEmail ? <p style={{ margin: '6px 0 0', fontSize: 13, color: '#b4541f' }}>{errEmail}</p> : null}
                </div>
                <button
                  onClick={onSubmit}
                  disabled={submitting}
                  style={{ border: 'none', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1, background: '#36596A', color: '#fff', fontSize: 17, fontWeight: 700, padding: 15, borderRadius: 9, borderBottom: '3px solid #E4CDA1', fontFamily: 'inherit', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {submitting ? 'Sending…' : 'Send Me the Free Book'}
                  <ArrowRight size={18} />
                </button>
              </div>
              <p style={{ margin: '13px 0 0', fontSize: 12.5, color: '#9ca3af', lineHeight: 1.5, textAlign: 'center' }}>Your information is 100% secure and never sold to spammers.</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
