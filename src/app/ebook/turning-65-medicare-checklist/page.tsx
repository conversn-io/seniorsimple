import type { Metadata } from 'next';
import EbookFunnel from '../../../components/pages/EbookFunnel';

export const metadata: Metadata = {
  title: 'Turning 65? The Free Medicare Enrollment Checklist | SeniorSimple',
  description:
    'A free step-by-step checklist for turning 65: the enrollment window, Original vs. Advantage, and the mistakes to avoid — so you choose the right plan and skip a lifetime penalty.',
};

export default function Turning65ChecklistPage() {
  return <EbookFunnel funnel="turning-65-medicare-checklist" />;
}
