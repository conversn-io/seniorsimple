'use client'

import { useState } from 'react'

interface NewsletterCaptureCTAProps {
  slug: string
  category?: string | null
}

// Central Publishare subscribe endpoint (public, verify_jwt=false, CORS open).
// Handles dedup, honeypot, IP rate limit, GHL sync.
const SUBSCRIBE_ENDPOINT =
  'https://vpysqshhafthuxvokwqj.supabase.co/functions/v1/subscribe'

export default function NewsletterCaptureCTA({ slug, category }: NewsletterCaptureCTAProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [honeypot, setHoneypot] = useState('') // Bot trap — real users leave empty
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

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
          first_name: firstName.trim() || null,
          source: 'article',
          source_detail: `article:${slug}`,
          tags: [
            'article_cta',
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
          ? "Welcome back! You're resubscribed."
          : data?.is_new === false
          ? "You're already on the list — thanks!"
          : "You're in. Check your inbox for the 2026 Medicare Planning Guide.",
      )
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <section
        className="py-16 px-6"
        style={{ background: 'linear-gradient(135deg, #36596A 0%, #82A6B1 100%)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-semibold text-white mb-4">Thanks!</h2>
          <p className="text-xl text-white opacity-90">{message}</p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="py-16 px-6"
      style={{ background: 'linear-gradient(135deg, #36596A 0%, #82A6B1 100%)' }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-serif font-semibold text-white mb-4">
          Free 2026 Medicare Planning Guide
        </h2>
        <p className="text-xl text-white mb-8 opacity-90">
          Get the plain-English guide to Medicare, Medigap, and prescription costs —
          plus weekly expert tips for retirees. No spam, unsubscribe anytime.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-w-md mx-auto"
          noValidate
        >
          <input
            type="text"
            placeholder="First name (optional)"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            className="w-full px-4 py-3 rounded-lg border-0 text-gray-900"
            disabled={status === 'submitting'}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-label="Email address"
              className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900"
              disabled={status === 'submitting'}
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-white text-[#36596A] px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Sending…' : 'Send Me the Guide'}
            </button>
          </div>

          {/* Honeypot — hidden from real users, filled by naive bots */}
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

        {status === 'error' && (
          <p className="text-sm text-white mt-4 opacity-90" role="alert">
            {message}
          </p>
        )}

        <p className="text-sm text-white mt-4 opacity-80">
          Join 50,000+ seniors making informed retirement decisions.
        </p>
      </div>
    </section>
  )
}
