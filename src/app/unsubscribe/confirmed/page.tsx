'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ConfirmedContent() {
  const searchParams = useSearchParams()
  const status = searchParams?.get('status') ?? null

  const messages: Record<string, { title: string; body: string }> = {
    already: {
      title: 'Already Unsubscribed',
      body: 'You were already unsubscribed from our newsletter.',
    },
    not_found: {
      title: 'Subscription Not Found',
      body: "We couldn't find your subscription. You may have already been removed.",
    },
  }

  const { title, body } = messages[status || ''] || {
    title: "You've Been Unsubscribed",
    body: "We'll miss you. You won't receive any more newsletter emails from us.",
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0] px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#36596A]/10 flex items-center justify-center">
          {status === 'not_found' ? (
            <svg className="w-8 h-8 text-[#36596A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-[#36596A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold text-[#36596A] mb-3">{title}</h1>
        <p className="text-gray-600 mb-8">{body}</p>
        <a
          href="/"
          className="inline-block py-3 px-6 rounded-lg bg-[#36596A] text-white font-semibold hover:bg-[#2a4654] transition-colors"
        >
          Visit Our Homepage
        </a>
        <p className="mt-4 text-sm text-gray-500">
          Changed your mind?{' '}
          <a href="/" className="text-[#36596A] hover:underline">
            Resubscribe on our homepage
          </a>
        </p>
      </div>
    </div>
  )
}

export default function UnsubscribeConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <ConfirmedContent />
    </Suspense>
  )
}
