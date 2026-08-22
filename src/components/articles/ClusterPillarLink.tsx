import Link from 'next/link'

interface ClusterPillarLinkProps {
  slug: string
  title: string
  excerpt?: string
}

/**
 * WO-722 — the "up" edge of a pillar/satellite cluster.
 *
 * Satellite pages (carrier reviews, product-type explainers, comparison
 * pages) previously had no link back to the guide they belong to, which is
 * half of why whole clusters sat orphaned. This renders one contextual,
 * descriptive link to the pillar — crawlable in the initial HTML, no client
 * JS — directly beneath the article body.
 */
export default function ClusterPillarLink({
  slug,
  title,
  excerpt,
}: ClusterPillarLinkProps) {
  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-xl border border-[#E4CDA1] bg-[#FBF7EF] p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[#8A7A43] mb-2">
            Part of a larger guide
          </p>
          <h2 className="text-2xl font-serif font-semibold text-[#36596A] mb-2">
            <Link href={`/articles/${slug}`} className="hover:underline">
              {title}
            </Link>
          </h2>
          {excerpt && (
            <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
              {excerpt}
            </p>
          )}
          <Link
            href={`/articles/${slug}`}
            className="inline-flex items-center font-medium text-[#36596A] hover:underline"
          >
            Read the full guide →
          </Link>
        </div>
      </div>
    </section>
  )
}
