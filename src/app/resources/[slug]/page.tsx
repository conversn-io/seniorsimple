import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getAllMagnets, getMagnetByLpSlug } from '@/lib/medicare-capture-config'
import ResourceLandingPage from '@/components/resources/ResourceLandingPage'

interface ResourcePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllMagnets().map((magnet) => ({ slug: magnet.lpSlug }))
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

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params
  const magnet = getMagnetByLpSlug(slug)
  if (!magnet) notFound()
  return <ResourceLandingPage magnet={magnet} />
}
