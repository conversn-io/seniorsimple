import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PollResult {
  answer_value: string
  answer_label: string
  count: number
  percentage: number
  isWinner: boolean
}

export default async function PollResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ issue?: string; q?: string; err?: string }>
}) {
  const params = await searchParams
  const issueSlug = params.issue
  const questionKey = params.q
  const error = params.err

  if (!issueSlug || !questionKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#36596A] mb-3">Poll Not Found</h1>
          <p className="text-gray-600">This poll link is missing required parameters.</p>
        </div>
      </div>
    )
  }

  if (error === 'issue_not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#36596A] mb-3">Issue Not Found</h1>
          <p className="text-gray-600">We couldn&apos;t find the newsletter issue for this poll.</p>
        </div>
      </div>
    )
  }

  // Resolve issue_id
  const { data: issue } = await supabase
    .from('newsletter_issues')
    .select('id, subject')
    .eq('slug', issueSlug)
    .single()

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#36596A] mb-3">Poll Not Found</h1>
          <p className="text-gray-600">This poll is no longer available.</p>
        </div>
      </div>
    )
  }

  // Aggregate results
  const { data: rawResults } = await supabase
    .rpc('poll_aggregate', { p_issue_id: issue.id, p_question_key: questionKey })

  // Fallback: manual query if RPC not available
  let results: PollResult[] = []

  if (rawResults && rawResults.length > 0) {
    const total = rawResults.reduce((sum: number, r: { count: number }) => sum + Number(r.count), 0)
    const maxCount = Math.max(...rawResults.map((r: { count: number }) => Number(r.count)))
    results = rawResults.map((r: { answer_value: string; answer_label: string; count: number }) => ({
      answer_value: r.answer_value,
      answer_label: r.answer_label || r.answer_value,
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
      isWinner: Number(r.count) === maxCount,
    }))
  } else {
    // Direct query fallback
    const { data: directResults } = await supabase
      .from('newsletter_poll_responses')
      .select('answer_value, answer_label')
      .eq('issue_id', issue.id)
      .eq('question_key', questionKey)

    if (directResults && directResults.length > 0) {
      const counts: Record<string, { label: string; count: number }> = {}
      for (const r of directResults) {
        if (!counts[r.answer_value]) {
          counts[r.answer_value] = { label: r.answer_label || r.answer_value, count: 0 }
        }
        counts[r.answer_value].count++
      }
      const total = directResults.length
      const maxCount = Math.max(...Object.values(counts).map((c) => c.count))
      results = Object.entries(counts)
        .map(([value, { label, count }]) => ({
          answer_value: value,
          answer_label: label,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          isWinner: count === maxCount,
        }))
        .sort((a, b) => b.count - a.count)
    }
  }

  const totalVotes = results.reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] px-4 py-12">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#36596A]/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#36596A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#36596A]">Thanks for Voting!</h1>
          <p className="text-gray-500 text-sm mt-1">{totalVotes} total vote{totalVotes !== 1 ? 's' : ''}</p>
        </div>

        {results.length === 0 ? (
          <p className="text-center text-gray-500">No votes yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.answer_value}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`text-sm font-medium ${result.isWinner ? 'text-[#36596A] font-bold' : 'text-gray-700'}`}>
                    {result.answer_label}
                    {result.isWinner && results.length > 1 && (
                      <span className="ml-2 text-xs bg-[#E4CDA1] text-[#36596A] px-2 py-0.5 rounded-full">
                        Leading
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">
                    {result.percentage}% ({result.count})
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${result.isWinner ? 'bg-[#36596A]' : 'bg-[#36596A]/40'}`}
                    style={{ width: `${Math.max(result.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block py-3 px-6 rounded-lg bg-[#36596A] text-white font-semibold hover:bg-[#2a4654] transition-colors"
          >
            Visit SeniorSimple
          </a>
        </div>
      </div>
    </div>
  )
}
