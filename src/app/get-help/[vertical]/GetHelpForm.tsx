'use client'

// §7-E companion client component. Handles the callback-request form UI and
// submit. Writes hit /api/get-help which computes hem_sha256 server-side and
// mirrors to newsletter_subscribers + CRM leads (identity bridge).

import { useState } from 'react'

interface GetHelpFormProps {
  vertical: string
  ctaLabel: string
  quizBucket: string | null
  sourceSlug: string | null
}

export default function GetHelpForm({ vertical, ctaLabel, quizBucket, sourceSlug }: GetHelpFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [zip, setZip] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('A valid 10-digit phone number is required.')
      return
    }
    if (!zip || !/^\d{5}$/.test(zip)) {
      setError('A 5-digit ZIP code is required.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/get-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vertical,
          firstName: firstName || null,
          lastName: lastName || null,
          phone,
          zip,
          email: email || null,
          quizBucket: quizBucket || null,
          sourceSlug: sourceSlug || null,
        }),
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`Submit failed (${res.status}): ${body.slice(0, 200)}`)
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-5">
        <h2 className="text-lg font-bold text-green-800 mb-1">You're on the callback list.</h2>
        <p className="text-sm text-green-900">
          A licensed advisor will call the number you provided shortly. In the meantime, check
          your email — we'll send educational resources for {vertical.replace('-', ' ')} coverage.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="First name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-[#36596A]"
        />
        <input
          type="text"
          placeholder="Last name (optional)"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-[#36596A]"
        />
      </div>
      <input
        type="tel"
        required
        placeholder="Phone (required)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-[#36596A]"
      />
      <input
        type="text"
        required
        placeholder="ZIP code (required)"
        maxLength={5}
        value={zip}
        onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-[#36596A]"
      />
      <input
        type="email"
        placeholder="Email (optional — we'll also send resources)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#36596A] focus:border-[#36596A]"
      />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#36596A] text-white font-semibold py-3 rounded-lg hover:bg-[#264657] transition-colors disabled:opacity-60"
      >
        {submitting ? 'Sending…' : ctaLabel}
      </button>
      <p className="text-xs text-gray-500">
        By submitting, you agree we (or a licensed partner agent) may call the number provided
        about your request. No obligation.
      </p>
    </form>
  )
}
