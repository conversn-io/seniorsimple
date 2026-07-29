import { trackGA4Event } from '@/lib/temp-tracking';

/**
 * Family Peace Plan funnel — typed event helpers that wrap the existing
 * `trackGA4Event` layer so every touchpoint fires with the same `funnel` prop
 * and no route reinvents its own event names.
 */
const FUNNEL = 'family_peace_plan';

type Band = "Ahead of Most Families" | "A Few Gaps to Close" | "Real Guessing Gap";
type PriceBucket = 47 | 67;

function fire(eventName: string, params: Record<string, unknown> = {}): void {
  trackGA4Event(eventName, { funnel: FUNNEL, ...params });
}

export const fppAnalytics = {
  advertorialView: () => fire('advertorial_view'),
  advertorialCtaClick: () => fire('advertorial_cta_click'),
  quizStart: () => fire('quiz_start'),
  quizQuestionAnswered: (qIndex: number, value: number) =>
    fire('quiz_question_answered', { q_index: qIndex, value }),
  quizCaptureView: () => fire('quiz_capture_view'),
  quizOptinSubmit: (band: Band, score: number) =>
    fire('quiz_optin_submit', { band, score }),
  quizResultView: (band: Band, score: number) =>
    fire('quiz_result_view', { band, score }),
  offerView: (priceBucket: PriceBucket, band?: Band) =>
    fire('offer_view', { price_bucket: priceBucket, band }),
  offerCtaClick: (priceBucket: PriceBucket) =>
    fire('offer_cta_click', { price_bucket: priceBucket }),
};

export type { Band, PriceBucket };
