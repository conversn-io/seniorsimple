import type { Metadata } from 'next'
import WebinarOptinPage from './WebinarOptinPage'

const CANONICAL = 'https://www.seniorsimple.org/life-insurance-webinar'
const TITLE = 'Life Insurance Webinar — Understand Your Options'
const DESCRIPTION =
  'A free five-part video series that explains life insurance later in life — final expense, whole, and term — in plain language, at your pace.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: 'website',
  },
}

export default function LifeInsuranceWebinarRoute() {
  return <WebinarOptinPage />
}
