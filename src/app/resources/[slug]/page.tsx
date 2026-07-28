import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getAllMagnetsAcrossKits, findMagnetByLpSlug } from '@/lib/capture-kits'
import ResourceLandingPage from '@/components/resources/ResourceLandingPage'

interface ResourcePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllMagnetsAcrossKits().map(({ magnet }) => ({ slug: magnet.lpSlug }))
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params
  const hit = findMagnetByLpSlug(slug)
  if (!hit) return {}
  const { magnet } = hit
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
  const hit = findMagnetByLpSlug(slug)
  if (!hit) notFound()
  return <ResourceLandingPage vertical={hit.kit.vertical} magnet={hit.magnet} />
}
