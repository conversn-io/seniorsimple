'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'

function UnsubscribeForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sid = searchParams.get('sid')
  const siteName = searchParams.get('site_name') || 'our newsletter'
  const [loading, setLoading] = useState(false)

  async function handleUnsubscribe() {
    if (!sid) return
    setLoading(true)
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriber_id: sid }),
      })
      if (res.ok) {
        router.push('/unsubscribe/confirmed')
      } else {
        router.push('/unsubscribe/confirmed?status=not_found')
      }
    } catch {
      router.push('/unsubscribe/confirmed?status=not_found')
    }
  }

  if (!sid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#36596A] mb-4">Invalid Link</h1>
          <p className="text-gray-600">This unsubscribe link is not valid. Please use the link from your email.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#36596A]/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#36596A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#36596A] mb-3">Unsubscribe from {siteName}?</h1>
        <p className="text-gray-600 mb-8">
          You&apos;ll no longer receive our newsletter emails. You can always resubscribe later.
        </p>
        <button
          onClick={handleUnsubscribe}
          disabled={loading}
          className="w-full py-3 px-6 rounded-lg bg-[#36596A] text-white font-semibold hover:bg-[#2a4654] transition-colors disabled:opacity-50"
        >
          {loading ? 'Unsubscribing...' : 'Yes, Unsubscribe Me'}
        </button>
        <a href="/" className="block mt-4 text-sm text-[#36596A] hover:underline">
          Never mind, take me back
        </a>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <UnsubscribeForm />
    </Suspense>
  )
}
