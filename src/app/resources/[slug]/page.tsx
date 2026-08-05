import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getAllMagnets, getMagnetByLpSlug } from '@/lib/medicare-capture-config'
import ResourceLandingPage from '@/components/resources/ResourceLandingPage'

interface ResourcePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string | string[] }>
}

export async function generateStaticParams() {
  return getAllMagnets().map((magnet) => ({ slug: magnet.lpSlug }))
}

// Slugs are a-z / 0-9 / hyphen / underscore / forward-slash. Match the shape
// v_capture_contract_compliance expects; anything else falls through to the
// magnet's defaultArticleSlug fallback.
const SLUG_RE = /^[a-z0-9][a-z0-9/_-]{2,}$/

function sanitizeFromParam(from: string | string[] | undefined): string | null {
  if (Array.isArray(from)) from = from[0]
  if (typeof from !== 'string') return null
  return SLUG_RE.test(from) ? from : null
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params
  const magnet = getMagnetByLpSlug(slug)
  if (!magnet) return {}
  const canonical = `https://seniorsimple.org/resources/${magnet.lpSlug}`
  return {
    title: `${magnet.title} — SeniorSimple`,
    description: magnet.lpSubhead,
    openGraph: {
      title: `${magnet.title} — SeniorSimple`,
      description: magnet.lpSubhead,
      url: canonical,
      type: 'website',
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  }
}

export default async function ResourcePage({
  params,
  searchParams,
}: ResourcePageProps) {
  const { slug } = await params
  const { from } = await searchParams
  const magnet = getMagnetByLpSlug(slug)
  if (!magnet) notFound()
  const fromArticleSlug = sanitizeFromParam(from)
  return (
    <ResourceLandingPage magnet={magnet} fromArticleSlug={fromArticleSlug} />
  )
}
