import type { Metadata } from 'next';

// Paid-traffic quiz funnel / split-test arm — keep out of the search index (WO-1507).
// `follow` stays on so link equity still flows to the pages it links to.
export const metadata: Metadata = {
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
};

export default function QuizFunnelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
