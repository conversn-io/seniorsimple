'use client'

import { useEffect, useState } from 'react'
import { X, Mail } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'

interface InterstitialEmailBannerProps {
  slug: string
  category?: string | null
  headline?: string
  subheadline?: string
  dismissible?: boolean
}

const SUBSCRIBE_ENDPOINT =
  'https://vpysqshhafthuxvokwqj.supabase.co/functions/v1/subscribe'

export default function InterstitialEmailBanner({
  slug,
  category,
  headline = 'Get the Free 2026 Medicare Planning Guide',
  subheadline = 'Plain-English Medicare, Medigap, and Rx cost breakdowns — delivered in one email.',
  dismissible = true,
}: InterstitialEmailBannerProps) {
  const { hasReachedThreshold } = useScrollPosition({ threshold: 0.5 })
  const [isDismissed, setIsDismissed] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const key = `interstitial_email_dismissed_${slug}`
    if (localStorage.getItem(key) === 'true') setIsDismissed(true)
  }, [slug])

  useEffect(() => {
    if (hasReachedThreshold && !isDismissed && !hasShown) {
      setHasShown(true)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'interstitial_email_shown', {
          scroll_depth: 0.5,
          slug,
        })
      }
    }
  }, [hasReachedThreshold, isDismissed, hasShown, slug])

  function handleDismiss() {
    setIsDismissed(true)
    localStorage.setItem(`interstitial_email_dismissed_${slug}`, 'true')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return

    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('submitting')
    setMessage('')

    try {
      const res = await fetch(SUBSCRIBE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          site_id: 'seniorsimple',
          source: 'article',
          source_detail: `interstitial:${slug}`,
          tags: [
            'article_cta',
            'interstitial',
            'medicare_planning_guide',
            ...(category ? [`category:${category.toLowerCase().replace(/\s+/g, '_')}`] : []),
          ],
          website: honeypot,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setMessage(data?.error || 'Something went wrong. Please try again.')
        return
      }
      setStatus('success')
      setMessage(
        data?.reactivated
          ? "Welcome back — you're resubscribed."
          : data?.is_new === false
          ? "You're already on the list."
          : "You're in. Check your inbox.",
      )
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'interstitial_email_submitted', { slug })
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (isDismissed || !hasReachedThreshold) return null

  return (
    <div
      className={`bg-gray-100 border-y-2 border-gray-300 my-12 transition-all duration-500 ease-in-out ${
        hasShown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-8 relative">
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {status === 'success' ? (
          <div className="text-center py-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thanks!</h3>
            <p className="text-gray-700 text-lg">{message}</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">{headline}</h3>
              <p className="text-gray-900 text-lg font-medium mb-1">{subheadline}</p>
              <p className="text-gray-700 text-base">No spam. Unsubscribe anytime.</p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
              noValidate
            >
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                aria-label="Email address"
                className="flex-1 md:w-64 px-4 py-3 rounded-lg border border-gray-300 text-gray-900 min-h-[52px]"
                disabled={status === 'submitting'}
              />
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-[#36596A] hover:bg-[#2a4a5a] text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[52px] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
                {status === 'submitting' ? 'Sending…' : 'Send Me the Guide'}
              </button>

              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-10000px',
                  width: 1,
                  height: 1,
                  opacity: 0,
                }}
              />
            </form>
          </div>
        )}

        {status === 'error' && (
          <p className="text-sm text-red-700 mt-3" role="alert">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
