/**
 * WO-843 §2C.1 / §5 — Gateway C segment tokens.
 *
 * One page, four hooks. `?seg=diabetes` swaps the headline, the opening
 * qualifier question and the FAQ emphasis — nothing else. The architecture,
 * tracking, consent and footer stay identical, so segment is a dimension
 * WITHIN gateway C, not a fourth gateway.
 *
 * Compliance note: no segment may imply that a health condition guarantees
 * acceptance, or that a special program exists for it. The honest claim is
 * narrow and true — these products ask health questions rather than requiring
 * an exam, so conditions that disqualify people from fully underwritten life
 * insurance do not automatically disqualify them here.
 */

export type SegmentId = 'default' | 'diabetes' | 'tobacco' | 'heart' | 'no-coverage';

export interface Segment {
  id: SegmentId;
  /** H1. */
  headline: string;
  /** Sub-deck under the H1. */
  subhead: string;
  /** The segment-qualifier question that opens the form. */
  qualifier: {
    prompt: string;
    options: { value: string; label: string }[];
  };
}

const SEGMENTS: Record<SegmentId, Segment> = {
  default: {
    id: 'default',
    headline: 'Final expense coverage without a medical exam.',
    subhead:
      'A few health questions on the application instead. See whether there is a policy worth talking to a licensed agent about.',
    qualifier: {
      prompt: 'What is prompting you to look at coverage now?',
      options: [
        { value: 'no_coverage', label: 'I do not have any coverage' },
        { value: 'not_enough', label: 'What I have is not enough' },
        { value: 'policy_ended', label: 'My policy ended or got too expensive' },
        { value: 'planning', label: 'I am planning ahead for my family' },
      ],
    },
  },

  diabetes: {
    id: 'diabetes',
    headline: 'Living with diabetes does not automatically rule out final expense coverage.',
    subhead:
      'These policies ask a short set of health questions rather than requiring a medical exam. Whether you qualify — and at what benefit amount — depends on your answers, your state and the carrier.',
    qualifier: {
      prompt: 'How is your diabetes currently managed?',
      options: [
        { value: 'diet', label: 'Diet and exercise only' },
        { value: 'oral', label: 'Oral medication' },
        { value: 'insulin', label: 'Insulin' },
        { value: 'prefer_not', label: 'I would rather discuss it on the call' },
      ],
    },
  },

  tobacco: {
    id: 'tobacco',
    headline: 'Smokers can still be considered for final expense coverage.',
    subhead:
      'Tobacco use affects your rate and which carriers will look at your application. It is a question on the form, not an automatic decline.',
    qualifier: {
      prompt: 'How would you describe your tobacco use?',
      options: [
        { value: 'daily', label: 'I smoke daily' },
        { value: 'occasional', label: 'Occasionally' },
        { value: 'quit_recent', label: 'I quit within the last few years' },
        { value: 'quit_long', label: 'I quit a long time ago' },
      ],
    },
  },

  heart: {
    id: 'heart',
    headline: 'A heart condition does not close the door on final expense coverage.',
    subhead:
      'What matters is what happened and when. The application asks; it does not assume. A licensed agent can tell you which carriers consider your situation.',
    qualifier: {
      prompt: 'Which best describes your heart history?',
      options: [
        { value: 'bp_chol', label: 'High blood pressure or cholesterol only' },
        { value: 'past_event', label: 'A heart attack or procedure in the past' },
        { value: 'ongoing', label: 'An ongoing condition I am treated for' },
        { value: 'prefer_not', label: 'I would rather discuss it on the call' },
      ],
    },
  },

  'no-coverage': {
    id: 'no-coverage',
    headline: 'No life insurance at all? That is the most common place to start.',
    subhead:
      'Final expense coverage is built for exactly this — a modest benefit meant to cover a funeral, not replace an income. See what is available in your state.',
    qualifier: {
      prompt: 'Has cost been the main reason you do not have coverage?',
      options: [
        { value: 'cost', label: 'Yes, it always seemed too expensive' },
        { value: 'health', label: 'I assumed my health would disqualify me' },
        { value: 'never_looked', label: 'I have just never looked into it' },
        { value: 'declined', label: 'I was turned down before' },
      ],
    },
  },
};

/** Resolve a `?seg=` value. Unknown or absent → default. */
export function resolveSegment(raw: string | string[] | undefined): Segment {
  const key = Array.isArray(raw) ? raw[0] : raw;
  if (key && key in SEGMENTS) return SEGMENTS[key as SegmentId];
  return SEGMENTS.default;
}

export const ALL_SEGMENT_IDS = Object.keys(SEGMENTS) as SegmentId[];
