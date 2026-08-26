'use client';

/**
 * GATEWAY C — WO-843 §2C.4, the VSL block.
 *
 * The WO calls for reusing the branded FE explainer creatives (G01 / G02 /
 * G04-Grandpa). Those assets are NOT in this repo and no CDN URL for them was
 * supplied with the work order, so the source is config-driven:
 *
 *   NEXT_PUBLIC_FE_VSL_URL   — mp4 (or hls) source
 *   NEXT_PUBLIC_FE_VSL_POSTER — poster frame
 *
 * With no URL set, this renders an educational text block instead of an empty
 * player. That is deliberate: a broken or blank video frame between the
 * pre-qual reveal and the call CTA would cost more conversions than having no
 * video at all, and the page must be shippable before the asset lands.
 *
 * Voice rule (§1): peer/educational. The page never personifies a licensed
 * agent — it can invite you to speak with one.
 */

import { useState } from 'react';

import { useGateway } from '@/components/fe-gateway/GatewayProvider';
import { BRAND } from '@/lib/fe-gateway/config';

const VSL_URL = process.env.NEXT_PUBLIC_FE_VSL_URL;
const VSL_POSTER = process.env.NEXT_PUBLIC_FE_VSL_POSTER;

const TALKING_POINTS = [
  {
    q: 'What final expense coverage is',
    a: 'A small life insurance policy — typically a modest benefit — intended to cover a funeral, burial and any bills left behind, rather than to replace an income.',
  },
  {
    q: 'Why the health questions matter more than your age',
    a: 'These products are simplified-issue: no medical exam, but a short set of health questions on the application.º Your answers, not your birth year, determine which carriers will consider you and at what benefit amount.',
  },
  {
    q: 'What a graded benefit period actually means',
    a: 'Many of these policies pay the premiums you have paid plus interest — rather than the full benefit — if death occurs in the first two policy years. Some products do not have this condition. Knowing which is which is the single most useful thing to ask on the call.',
  },
  {
    q: 'What the call is and is not',
    a: 'A licensed agent walks through what you qualify for in your state. Nothing is applied for on the call and there is no obligation.',
  },
];

export default function VslBlock() {
  const { track } = useGateway();
  const [playing, setPlaying] = useState(false);

  /* -------- No asset configured: educational text instead -------- */

  if (!VSL_URL) {
    return (
      <section className="rounded-2xl border p-7" style={{ borderColor: '#E3E3DA', background: '#fff' }}>
        <h2 className="text-[23px] font-bold leading-tight" style={{ color: BRAND.ink }}>
          Before you call, four things worth knowing
        </h2>
        <dl className="mt-5 space-y-5">
          {TALKING_POINTS.map((p) => (
            <div key={p.q}>
              <dt className="text-[18px] font-semibold" style={{ color: BRAND.primary }}>
                {p.q}
              </dt>
              <dd className="mt-1 text-[17px] leading-relaxed" style={{ color: BRAND.body }}>
                {p.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  /* -------- Asset configured: play it -------- */

  return (
    <section className="rounded-2xl border p-5 sm:p-7" style={{ borderColor: '#E3E3DA', background: '#fff' }}>
      <h2 className="text-[23px] font-bold leading-tight" style={{ color: BRAND.ink }}>
        Before you call — how final expense coverage works
      </h2>
      <div className="mt-4 overflow-hidden rounded-xl" style={{ background: '#000' }}>
        <video
          src={VSL_URL}
          poster={VSL_POSTER}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full"
          onPlay={() => {
            if (playing) return;
            setPlaying(true);
            track('quiz_complete', { vsl: 'started' });
          }}
        >
          Your browser does not support embedded video.
        </video>
      </div>
      <p className="mt-3 text-[15px]" style={{ color: '#6B7A82' }}>
        An educational overview from SeniorSimple. Not an offer of coverage, and not
        insurance advice.
      </p>
    </section>
  );
}
