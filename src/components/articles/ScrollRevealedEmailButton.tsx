'use client'

import { useEffect, useState } from 'react'
import { Mail, X } from 'lucide-react'
import { useScrollPosition } from '@/hooks/useScrollPosition'

interface ScrollRevealedEmailButtonProps {
  slug: string
  category?: string | null
  variant?: 'default' | 'compact' | 'expanded'
}

const SUBSCRIBE_ENDPOINT =
  'https://vpysqshhafthuxvokwqj.supabase.co/functions/v1/subscribe'

export default function ScrollRevealedEmailButton({
  slug,
  category,
  variant = 'default',
}: ScrollRevealedEmailButtonProps) {
  const { hasReachedThreshold } = useScrollPosition({ threshold: 0.3 })
  const [isDismissed, setIsDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const key = `sticky_email_dismissed_${slug}`
    if (localStorage.getItem(key) === 'true') setIsDismissed(true)
  }, [slug])

  useEffect(() => {
    if (hasReachedThreshold && !isDismissed && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'sticky_email_revealed', {
        scroll_depth: 0.3,
        slug,
      })
    }
  }, [hasReachedThreshold, isDismissed, slug])

  function handleDismiss() {
    setIsDismissed(true)
    localStorage.setItem(`sticky_email_dismissed_${slug}`, 'true')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return

    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error')
      setMessage('Please enter a valid email.')
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
          source_detail: `sticky-cta:${slug}`,
          tags: [
            'article_cta',
            'sticky_scroll',
            'medicare_planning_guide',
            ...(category ? [`category:${category.toLowerCase().replace(/\s+/g, '_')}`] : []),
          ],
          website: honeypot,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setMessage(data?.error || 'Something went wrong.')
        return
      }
      setStatus('success')
      setMessage(
        data?.reactivated
          ? "You're back in."
          : data?.is_new === false
          ? "Already subscribed."
          : "Check your inbox.",
      )
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'sticky_email_submitted', { slug })
      }
    } catch {
      setStatus('error')
      setMessage('Network error.')
    }
  }

  if (isDismissed || !hasReachedThreshold) return null

  const variantClasses = {
    default: 'py-3',
    compact: 'py-2',
    expanded: 'py-4',
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-100 border-t border-gray-300 shadow-lg transition-transform duration-300 ${
        hasReachedThreshold ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className={`max-w-6xl mx-auto px-4 ${variantClasses[variant]}`}>
        {status === 'success' ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-gray-900">Thanks — {message}</p>
            <button
              onClick={handleDismiss}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : expanded ? (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2"
            noValidate
          >
            <p className="hidden sm:block text-sm font-semibold text-gray-900 whitespace-nowrap">
              Free Medicare Guide:
            </p>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-label="Email address"
              autoFocus
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm min-h-[44px]"
              disabled={status === 'submitting'}
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-[#36596A] hover:bg-[#2a4a5a] text-white px-4 py-2 rounded-lg font-semibold text-sm inline-flex items-center gap-2 min-h-[44px] disabled:opacity-70"
            >
              {status === 'submitting' ? '…' : 'Send'}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Collapse"
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
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
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                Free 2026 Medicare Planning Guide
              </p>
              <p className="text-xs text-gray-700 font-medium truncate">
                One email. No spam. Unsubscribe anytime.
              </p>
            </div>
            <button
              onClick={() => setExpanded(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#36596A] hover:bg-[#2a4a5a] text-white font-bold rounded-lg px-6 py-3 text-base min-h-[48px] shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#36596A] focus:ring-offset-2"
              aria-label="Subscribe to Medicare Planning Guide"
            >
              <Mail className="w-5 h-5" aria-hidden="true" />
              <span>Get the Guide</span>
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <p className="text-xs text-red-700 mt-1" role="alert">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
