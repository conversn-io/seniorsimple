'use client'

import { useCallback, useState } from 'react'
import { Check, Download, Mail } from 'lucide-react'
import {
  MAGNETS,
  type CaptureVariant,
  type MagnetId,
  type TopicTag,
} from '@/lib/medicare-capture-config'
import { trackCaptureEvent } from '@/lib/medicare-capture-analytics'

const SUBSCRIBE_ENDPOINT =
  'https://vpysqshhafthuxvokwqj.supabase.co/functions/v1/subscribe'

export interface MagnetCaptureFormProps {
  /** Slug of the page hosting this form — used for source_detail + analytics. */
  pageSlug: string
  /** Variant that owns this form — informs analytics and source_detail. */
  variant: CaptureVariant
  magnetId: MagnetId
  topicTag: TopicTag
  resultPayload?: unknown
  abArm?: string
  /** Ties into the subscribe `source` field (default: 'capture'). */
  source?: string
  /** Visual mode: light background (LPs) or gradient hero (inline units). */
  theme?: 'light' | 'gradient'
  /** Optional title/subtitle rendered above the form. */
  title?: string
  subtitle?: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

async function submitToSubscribe(args: {
  email: string
  firstName: string
  pageSlug: string
  variant: CaptureVariant
  magnetId: MagnetId
  topicTag: TopicTag
  honeypot: string
  source: string
}) {
  return fetch(SUBSCRIBE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: args.email,
      first_name: args.firstName || null,
      site_id: 'seniorsimple',
      source: args.source,
      source_detail: `${args.pageSlug}|${args.variant}`,
      tags: [
        'medicare',
        args.topicTag,
        `unit:${args.variant}`,
        `magnet:${args.magnetId}`,
      ],
      website: args.honeypot,
    }),
  })
}

async function triggerMagnetDelivery(args: {
  email: string
  firstName: string
  magnetId: MagnetId
  pageSlug: string
  variant: CaptureVariant
  topicTag: TopicTag
  resultPayload?: unknown
}) {
  try {
    await fetch('/api/deliver-magnet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      keepalive: true,
    })
  } catch {
    // Delivery failures never block the success flow.
  }
}

export default function MagnetCaptureForm({
  pageSlug,
  variant,
  magnetId,
  topicTag,
  resultPayload,
  abArm,
  source = 'capture',
  theme = 'gradient',
  title,
  subtitle,
}: MagnetCaptureFormProps) {
  const magnet = MAGNETS[magnetId]
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

      trackCaptureEvent({
        eventName: 'capture_submit',
        pageSlug,
        variant,
        magnetId,
        topicTag,
        abArm,
      })

      try {
        const res = await submitToSubscribe({
          email: trimmed,
          firstName: firstName.trim(),
          pageSlug,
          variant,
          magnetId,
          topicTag,
          honeypot,
          source,
        })

        if (res.status === 429) {
          setStatus('error')
          setMessage('One moment — please try again shortly.')
          return
        }

        if (!res.ok && res.status !== 200 && res.status !== 201) {
          const data = await res.json().catch(() => ({}))
          setStatus('error')
          setMessage(
            typeof data?.error === 'string'
              ? data.error
              : 'Something went wrong. Please try again.',
          )
          return
        }

        setStatus('success')

        trackCaptureEvent({
          eventName: 'capture_confirm',
          pageSlug,
          variant,
          magnetId,
          topicTag,
          abArm,
        })
        void triggerMagnetDelivery({
          email: trimmed,
          firstName: firstName.trim(),
          magnetId,
          pageSlug,
          variant,
          topicTag,
          resultPayload,
        })
      } catch {
        setStatus('error')
        setMessage('Network error. Please try again.')
      }
    },
    [
      status,
      email,
      firstName,
      honeypot,
      pageSlug,
      variant,
      magnetId,
      topicTag,
      abArm,
      resultPayload,
      source,
    ],
  )

  const isLight = theme === 'light'
  const inputClass = isLight
    ? 'w-full rounded-lg border-2 border-[#36596A]/20 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:border-[#36596A] focus:ring-2 focus:ring-[#36596A]/20 focus:outline-none'
    : 'w-full rounded-lg border-0 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#E4CDA1] focus:outline-none'
  const labelClass = isLight
    ? 'block text-sm font-medium text-[#36596A] mb-1'
    : 'block text-sm font-medium text-white/90 mb-1'
  const helperClass = isLight
    ? 'text-xs text-[#36596A]/70 text-center mt-1'
    : 'text-xs text-white/70 text-center mt-1'
  const buttonClass = isLight
    ? 'mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#36596A] px-6 py-4 text-base font-medium text-white hover:bg-[#2a4a5a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed'
    : 'mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-4 text-base font-medium text-[#36596A] hover:bg-[#F5F5F0] transition-colors disabled:opacity-70 disabled:cursor-not-allowed'

  if (status === 'success') {
    const headingClass = isLight
      ? 'text-2xl font-serif font-semibold text-[#36596A] mb-3'
      : 'text-2xl font-serif font-semibold text-white mb-3'
    const bodyClass = isLight
      ? 'text-lg text-[#36596A]/85 mb-6'
      : 'text-lg text-white/90 mb-6'
    const successBtnClass = isLight
      ? 'inline-flex items-center gap-2 rounded-lg bg-[#36596A] px-6 py-3 text-base font-medium text-white hover:bg-[#2a4a5a] transition-colors'
      : 'inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-[#36596A] hover:bg-[#F5F5F0] transition-colors'
    const iconBg = isLight ? 'bg-[#E4CDA1]/40' : 'bg-white/20'
    const iconColor = isLight ? 'text-[#36596A]' : 'text-white'

    return (
      <div className="text-center">
        <div
          className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}
        >
          <Check className={`h-6 w-6 ${iconColor}`} aria-hidden />
        </div>
        <h3 className={headingClass}>{magnet.successHeadline}</h3>
        <p className={bodyClass}>{magnet.successBody}</p>
        <a
          href={magnet.downloadPath}
          download={magnet.fileName}
          className={successBtnClass}
        >
          <Download className="h-5 w-5" aria-hidden />
          Download {magnet.title}
        </a>
      </div>
    )
  }

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-6 text-center">
          {title && (
            <h3
              className={`text-2xl font-serif font-semibold mb-2 ${
                isLight ? 'text-[#36596A]' : 'text-white'
              }`}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={isLight ? 'text-[#36596A]/85' : 'text-white/90'}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-md mx-auto"
        noValidate
      >
        <label className="block text-left">
          <span className={labelClass}>First name (optional)</span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            className={inputClass}
            disabled={status === 'submitting'}
          />
        </label>

        <label className="block text-left">
          <span className={labelClass}>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            aria-label="Email address"
            className={inputClass}
            placeholder="you@example.com"
            disabled={status === 'submitting'}
          />
        </label>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className={buttonClass}
        >
          {status === 'submitting' ? (
            'Sending…'
          ) : (
            <>
              <Mail className="h-5 w-5" aria-hidden />
              {magnet.ctaLabel}
            </>
          )}
        </button>

        <p className={helperClass}>No obligation, ever. Unsubscribe anytime.</p>

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

        {status === 'error' && message && (
          <p
            className={
              isLight
                ? 'text-sm text-red-700 text-center'
                : 'text-sm text-white/95 text-center'
            }
            role="alert"
          >
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
