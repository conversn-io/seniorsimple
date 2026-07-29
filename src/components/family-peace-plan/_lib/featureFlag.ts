import { notFound } from 'next/navigation';

/**
 * Gates the Family Peace Plan funnel routes. Set NEXT_PUBLIC_ENABLE_FAMILY_PEACE_PLAN=true
 * in .env.local (dev) or the Vercel dashboard (prod/preview) to expose the routes.
 * Without it, the routes 404 — safe to ship while product name, testimonials, and
 * checkout URL are still being finalized.
 */
export function gateFamilyPeacePlan(): void {
  if (process.env.NEXT_PUBLIC_ENABLE_FAMILY_PEACE_PLAN !== 'true') {
    notFound();
  }
}

export const IS_DRAFT_MODE = process.env.NEXT_PUBLIC_FAMILY_PEACE_PLAN_DRAFT === 'true';
