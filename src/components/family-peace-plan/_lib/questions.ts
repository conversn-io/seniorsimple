import type { Band } from './analytics';

/**
 * Family Readiness Check — 6 questions × 3 options × 0/1/2 point values.
 * Max score = 12. Bands are picked by `score >= min` (evaluated top-down).
 * Copy is verbatim from the prototype `Family-Readiness-Quiz.html`.
 */

export interface QuizOption {
  label: string;
  value: 0 | 1 | 2;
}

export interface QuizQuestion {
  /** Question text. */
  text: string;
  /** "Why we ask" helper line shown under the question. */
  why: string;
  options: [QuizOption, QuizOption, QuizOption];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    text: 'If your family needed something important from you tomorrow, would they know exactly where to find it?',
    why: 'This is the heart of it — a will says who gets what, but not where anything is.',
    options: [
      { label: "Yes — they'd know exactly where", value: 2 },
      { label: 'Some things, not everything', value: 1 },
      { label: 'Honestly… no', value: 0 },
    ],
  },
  {
    text: 'Is there ONE place your family could look for your accounts, insurance, and key documents?',
    why: 'Scattered information is the #1 reason families spend days searching.',
    options: [
      { label: 'Yes, one place', value: 2 },
      { label: 'A few different places', value: 1 },
      { label: "It's mostly in my head", value: 0 },
    ],
  },
  {
    text: 'Have you written down who your family should call first — advisors, doctors, attorney?',
    why: 'In a stressful moment, knowing who to call first saves hours and arguments.',
    options: [
      { label: "Yes, it's written down", value: 2 },
      { label: 'A few of them', value: 1 },
      { label: 'Not yet', value: 0 },
    ],
  },
  {
    text: 'Could your loved ones reach your important digital accounts and passwords if they needed to?',
    why: 'More of life lives online every year — and logins are where families get stuck.',
    options: [
      { label: 'Yes', value: 2 },
      { label: 'Some of them', value: 1 },
      { label: 'No', value: 0 },
    ],
  },
  {
    text: 'Do the people you love know your key medical details, medications, and wishes?',
    why: 'These are the questions families ask first — and the ones they hate having to guess.',
    options: [
      { label: 'Yes', value: 2 },
      { label: 'Partly', value: 1 },
      { label: 'Not really', value: 0 },
    ],
  },
  {
    text: 'Have you had "the conversation" with your family about where everything is?',
    why: 'The plan matters — but so does making sure someone knows it exists.',
    options: [
      { label: "Yes, we've talked", value: 2 },
      { label: "We've started", value: 1 },
      { label: 'Not yet', value: 0 },
    ],
  },
];

export const QUIZ_MAX_SCORE = QUIZ_QUESTIONS.length * 2;

export interface BandDef {
  /** Inclusive lower bound. Evaluated in list order — highest first. */
  min: number;
  name: Band;
  /** Accent color for the meter and band label. */
  color: string;
  /** Result-screen body copy for this band. */
  body: string;
  /** Sub-copy for the offer card on the result screen. */
  offerSub: string;
}

export const BANDS: BandDef[] = [
  {
    min: 9,
    name: 'Ahead of Most Families',
    color: '#1D7A5A',
    body:
      "Wonderful — you've clearly thought about this more than most. You've got the big pieces handled. The opportunity now is to pull those pieces into one simple place so your family isn't relying on memory or a few scattered drawers. A Family Peace Plan turns “mostly ready” into “completely done.”",
    offerSub:
      "You're close. The Family Peace Plan gathers what you've already got handled into one large-print place — so it's not just organized in your head, it's ready for the people you love.",
  },
  {
    min: 5,
    name: 'A Few Gaps to Close',
    color: '#A98B4E',
    body:
      "You're in good company — this is where most thoughtful families land. You've handled some of it, but there are real gaps your loved ones would have to guess through. The good news: closing them isn't a huge project. It's one relaxed weekend with a cup of coffee and the right prompts.",
    offerSub:
      'A handful of gaps stand between your family and real peace of mind. The Family Peace Plan walks you through closing them, one simple section at a time.',
  },
  {
    min: 0,
    name: 'Real Guessing Gap',
    color: '#B15A3C',
    body:
      "Thank you for being honest — that's the hardest part, and it means you care. Right now, if your family needed answers, they'd be doing a lot of guessing. That's not a reflection on you; it's what happens to every family that keeps life in their head. The reassuring part: this is very fixable, and faster than you'd think.",
    offerSub:
      "Right now your family would have to guess about a lot. The Family Peace Plan gives you one simple, guided place to write it all down — so “I really should” finally becomes “it's done.”",
  },
];

export function bandForScore(score: number): BandDef {
  return BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1];
}

/** URL-safe slug for the band, used in analytics tags. */
export function bandSlug(name: Band): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
