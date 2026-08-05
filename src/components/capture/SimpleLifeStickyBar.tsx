'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, X, Mail } from 'lucide-react'
import { fireGa4LeadCapture } from '@/lib/capture-identity'

const SUBSCRIBE_ENDPOINT =
  'https://vpysqshhafthuxvokwqj.supabase.co/functions/v1/subscribe'

// Source-detail contract per Ruling 4: `<surface>:<slug>`. Simple Life is its
// own canonical surface.
const SIMPLE_LIFE_SURFACE = 'simple-life'
const DISMISS_KEY = 'ss_simplelife_bar_dismissed_v1'
const SUCCESS_KEY = 'ss_simplelife_bar_subscribed_v1'
const SESSION_ID_KEY = 'ss_session_id'
const SCROLL_TRIGGER = 0.3 // Show after 30% scroll

type Status = 'idle' | 'submitting' | 'success' | 'error'

interface SimpleLifeStickyBarProps {
  /** Slug of the hosting page — recorded in analytics for source attribution. */
  pageSlug?: string
}

function readDismissed(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return (
      window.sessionStorage.getItem(DISMISS_KEY) === '1' ||
      window.localStorage.getItem(SUCCESS_KEY) === '1'
    )
  } catch {
    return false
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.sessionStorage.getItem(SESSION_ID_KEY)
    if (!id) {
      const cryptoRef = (window.crypto as unknown as { randomUUID?: () => string } | undefined)
      id = cryptoRef?.randomUUID
        ? cryptoRef.randomUUID()
        : `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
      window.sessionStorage.setItem(SESSION_ID_KEY, id)
    }
    return id
  } catch {
    return `sess_${Date.now().toString(36)}`
  }
}

async function fireAnalytics(
  event: 'simple_life_impression' | 'simple_life_submit' | 'simple_life_confirm',
  pageSlug: string | undefined,
) {
  if (typeof window === 'undefined') return
  try {
    await fetch('/api/analytics/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: event,
        event_category: 'simple_life_opt_in',
        event_label: pageSlug ?? window.location.pathname,
        session_id: getSessionId(),
        page_url: window.location.href,
        properties: {
          site_id: 'seniorsimple',
          list: 'simple-life-newsletter',
          pageSlug: pageSlug ?? window.location.pathname,
        },
      }),
      keepalive: true,
    })
  } catch {
    // Analytics failures never block UX
  }
}

/**
 * Persistent bottom-of-page opt-in for the SeniorSimple ("Simple Life")
 * newsletter. Independent of the Medicare magnet flow: writes to the same
 * subscribe endpoint but with source='simple-life-sticky' + a distinct list
 * tag so the newsletter engine can segment.
 *
 * Behavior:
 *  - Hidden until the user scrolls past 30% of the page (avoids covering
 *    above-the-fold content).
 *  - Dismiss (X) → hidden for the rest of the session.
 *  - Successful subscribe → hidden permanently on this device (localStorage).
 */
export default function SimpleLifeStickyBar({ pageSlug }: SimpleLifeStickyBarProps) {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const impressionFiredRef = useRef(false)

  useEffect(() => {
    if (readDismissed()) return

    const onScroll = () => {
      const doc = document.documentElement
      const scrolled = (window.scrollY + window.innerHeight) / doc.scrollHeight
      if (scrolled >= SCROLL_TRIGGER) {
        setVisible(true)
        if (!impressionFiredRef.current) {
          impressionFiredRef.current = true
          void fireAnalytics('simple_life_impression', pageSlug)
        }
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pageSlug])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // sessionStorage may be blocked — bar stays hidden for this pageview at minimum
    }
  }, [])

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
      void fireAnalytics('simple_life_submit', pageSlug)

      try {
        // source_detail per capture contract Ruling 4: `<surface>:<slug>`.
        // quiz_bucket omitted — the DB CHECK constraint's persona vocabulary
        // (advantage/medigap/dual/…) doesn't cover newsletter opt-ins.
        // hem_sha256 omitted — BEFORE INSERT trigger computes it server-side.
        // Fallback pulls the last path segment (e.g. `/articles/foo` → `foo`)
        // so we never emit `/articles/...` which fails the compliance regex.
        const rawSlug =
          pageSlug ??
          (typeof window !== 'undefined'
            ? window.location.pathname.split('/').filter(Boolean).pop() ?? 'unknown'
            : 'unknown')
        const source_detail = `${SIMPLE_LIFE_SURFACE}:${rawSlug}`

        const res = await fetch(SUBSCRIBE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmed,
            site_id: 'seniorsimple',
            source: 'simple-life-sticky',
            source_detail,
            quiz_context: {
              surface: SIMPLE_LIFE_SURFACE,
              list: 'simple-life-newsletter',
            },
            tags: ['simple-life-newsletter'],
            website: honeypot,
          }),
        })

        if (res.status === 429) {
          setStatus('error')
          setMessage('One moment — please try again shortly.')
          return
        }

        // Any 2xx or dedup 4xx → same success state (matches magnet flow).
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
        void fireAnalytics('simple_life_confirm', pageSlug)
        fireGa4LeadCapture({
          method: 'sticky_bar',
          slug: pageSlug ?? (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
          list: 'simple-life-newsletter',
        })
        try {
          window.localStorage.setItem(SUCCESS_KEY, '1')
        } catch {
          // ignore
        }
      } catch {
        setStatus('error')
        setMessage('Network error. Please try again.')
      }
    },
    [status, email, honeypot, pageSlug],
  )

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="SeniorSimple newsletter"
      className="fixed inset-x-0 bottom-0 z-40 print:hidden"
    >
      <div className="mx-auto max-w-6xl px-3 pb-3 pt-2">
        <div
          className="relative overflow-hidden rounded-t-xl shadow-2xl ring-1 ring-black/10 sm:rounded-xl"
          style={{ background: 'linear-gradient(135deg, #36596A 0%, #2a4a5a 100%)' }}
        >
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss newsletter bar"
            className="absolute right-2 top-2 rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-3 px-6 py-4 sm:py-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Check className="h-4 w-4 text-white" aria-hidden />
              </span>
              <p className="text-sm sm:text-base text-white">
                <span className="font-semibold">You&apos;re in.</span> Check your
                inbox — we&apos;ll be in touch weekly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-3 sm:pr-14"
              noValidate
            >
              <div className="min-w-0 sm:flex-1">
                <p className="text-sm font-semibold text-white sm:text-base">
                  Subscribe to The Simple Life
                </p>
                <p className="hidden text-xs text-white/75 sm:block">
                  Plain-English retirement insights — weekly, unsubscribe anytime.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <label className="sr-only" htmlFor="simplelife-email">
                  Email address
                </label>
                <input
                  id="simplelife-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  disabled={status === 'submitting'}
                  className="w-full min-w-0 rounded-md border-0 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#E4CDA1] focus:outline-none sm:w-64"
                />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#E4CDA1] px-4 py-2 text-sm font-medium text-[#36596A] hover:bg-[#d9bf8a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed sm:w-auto"
                >
                  {status === 'submitting' ? (
                    'Sending…'
                  ) : (
                    <>
                      <Mail className="h-4 w-4" aria-hidden />
                      Subscribe
                    </>
                  )}
                </button>
              </div>

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
          )}

          {status === 'error' && message && (
            <p
              className="px-6 pb-3 text-xs text-white/95 sm:pb-2"
              role="alert"
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
