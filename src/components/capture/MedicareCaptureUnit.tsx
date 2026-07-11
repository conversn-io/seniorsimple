'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Mail, Check, X, Download } from 'lucide-react'
import {
  MAGNETS,
  type CaptureVariant,
  type MagnetId,
  type TopicTag,
} from '@/lib/medicare-capture-config'
import { trackCaptureEvent } from '@/lib/medicare-capture-analytics'

const SUBSCRIBE_ENDPOINT =
  'https://vpysqshhafthuxvokwqj.supabase.co/functions/v1/subscribe'

export interface MedicareCaptureUnitProps {
  pageSlug: string
  variant: CaptureVariant
  magnetId: MagnetId
  topicTag: TopicTag
  resultPayload?: unknown
  abArm?: string
  className?: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

interface FormBodyProps extends MedicareCaptureUnitProps {
  status: Status
  message: string
  email: string
  firstName: string
  honeypot: string
  onEmailChange: (v: string) => void
  onFirstNameChange: (v: string) => void
  onHoneypotChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => {
      const touch =
        window.matchMedia('(pointer: coarse)').matches ||
        window.matchMedia('(max-width: 767px)').matches
      setIsMobile(touch)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function useHasFiredImpression(
  ref: React.RefObject<HTMLElement | null>,
  onFire: () => void,
  enabled: boolean,
) {
  const firedRef = useRef(false)
  useEffect(() => {
    if (!enabled || firedRef.current) return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      firedRef.current = true
      onFire()
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !firedRef.current) {
            firedRef.current = true
            onFire()
            io.disconnect()
          }
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, onFire, enabled])
}

function useExitIntent(onExit: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    let fired = false
    const handler = (e: MouseEvent) => {
      if (fired) return
      if (e.clientY <= 0 && e.relatedTarget === null) {
        fired = true
        onExit()
      }
    }
    document.addEventListener('mouseout', handler)
    return () => document.removeEventListener('mouseout', handler)
  }, [onExit, enabled])
}

function useScrollTrigger(
  threshold: number,
  onCross: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return
    let fired = false
    const onScroll = () => {
      if (fired) return
      const doc = document.documentElement
      const scrolled = (window.scrollY + window.innerHeight) / doc.scrollHeight
      if (scrolled >= threshold) {
        fired = true
        onCross()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold, onCross, enabled])
}

function FormBody({
  status,
  message,
  email,
  firstName,
  honeypot,
  onEmailChange,
  onFirstNameChange,
  onHoneypotChange,
  onSubmit,
  variant,
  magnetId,
}: FormBodyProps) {
  const magnet = MAGNETS[magnetId]
  const isModal = variant === 'exit'

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
          <Check className="h-6 w-6 text-white" aria-hidden />
        </div>
        <h3
          className={`font-serif ${isModal ? 'text-2xl' : 'text-3xl'} font-semibold text-white mb-3`}
        >
          {magnet.successHeadline}
        </h3>
        <p className="text-lg text-white/90 mb-6">{magnet.successBody}</p>
        <a
          href={magnet.downloadPath}
          download={magnet.fileName}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-[#36596A] hover:bg-[#F5F5F0] transition-colors"
        >
          <Download className="h-5 w-5" aria-hidden />
          Download {magnet.title}
        </a>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto"
      noValidate
    >
      <label className="block text-left">
        <span className="block text-sm font-medium text-white/90 mb-1">
          First name (optional)
        </span>
        <input
          type="text"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          autoComplete="given-name"
          className="w-full rounded-lg border-0 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#E4CDA1] focus:outline-none"
          disabled={status === 'submitting'}
        />
      </label>

      <label className="block text-left">
        <span className="block text-sm font-medium text-white/90 mb-1">
          Email address
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          autoComplete="email"
          required
          aria-label="Email address"
          className="w-full rounded-lg border-0 px-4 py-3 text-base text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#E4CDA1] focus:outline-none"
          placeholder="you@example.com"
          disabled={status === 'submitting'}
        />
      </label>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-4 text-base font-medium text-[#36596A] hover:bg-[#F5F5F0] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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

      <p className="text-xs text-white/70 text-center mt-1">
        No obligation, ever. Unsubscribe anytime.
      </p>

      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => onHoneypotChange(e.target.value)}
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
        <p className="text-sm text-white/95 text-center" role="alert">
          {message}
        </p>
      )}
    </form>
  )
}

async function submitToSubscribe(args: {
  email: string
  firstName: string
  pageSlug: string
  variant: CaptureVariant
  magnetId: MagnetId
  topicTag: TopicTag
  honeypot: string
}) {
  const res = await fetch(SUBSCRIBE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: args.email,
      first_name: args.firstName || null,
      site_id: 'seniorsimple',
      source: 'capture',
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
  return res
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
    // Delivery failures don't break the success flow — user still gets the
    // download link, and subscribe already wrote the row + fired GHL sync.
  }
}

function InlinePanel(props: MedicareCaptureUnitProps & { onSubmit: (e: React.FormEvent) => void; status: Status; message: string; email: string; firstName: string; honeypot: string; onEmailChange: (v: string) => void; onFirstNameChange: (v: string) => void; onHoneypotChange: (v: string) => void; hostRef: React.RefObject<HTMLElement | null> }) {
  const magnet = MAGNETS[props.magnetId]
  return (
    <section
      ref={props.hostRef as React.RefObject<HTMLElement>}
      className={`my-12 py-12 px-6 rounded-2xl ${props.className ?? ''}`}
      style={{
        background: 'linear-gradient(135deg, #36596A 0%, #82A6B1 100%)',
      }}
      aria-labelledby={`capture-heading-${props.pageSlug}-${props.variant}`}
    >
      <div className="max-w-2xl mx-auto text-center">
        {props.status !== 'success' && (
          <>
            <h2
              id={`capture-heading-${props.pageSlug}-${props.variant}`}
              className="text-3xl font-serif font-semibold text-white mb-3"
            >
              {props.magnetId === 'tool-result'
                ? 'Email me my Medicare estimate'
                : `Free ${magnet.title}`}
            </h2>
            <p className="text-lg text-white/90 mb-6">
              {props.magnetId === 'tool-result'
                ? 'Get a copy of your estimate plus a plain-English Medicare planning guide. No agent, no sales calls.'
                : 'A plain-English guide from SeniorSimple. No agent, no sales calls — just the information you asked for.'}
            </p>
          </>
        )}
        <FormBody {...props} />
      </div>
    </section>
  )
}

function ExitModal(
  props: MedicareCaptureUnitProps & {
    open: boolean
    onClose: () => void
    onSubmit: (e: React.FormEvent) => void
    status: Status
    message: string
    email: string
    firstName: string
    honeypot: string
    onEmailChange: (v: string) => void
    onFirstNameChange: (v: string) => void
    onHoneypotChange: (v: string) => void
  },
) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!props.open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.onClose()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus?.()
    }
  }, [props.open, props])

  if (!props.open) return null

  const magnet = MAGNETS[props.magnetId]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`exit-heading-${props.pageSlug}`}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60"
      onClick={props.onClose}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl p-8 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #36596A 0%, #82A6B1 100%)',
        }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={props.onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-full p-2 text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        {props.status !== 'success' && (
          <div className="text-center mb-6">
            <h2
              id={`exit-heading-${props.pageSlug}`}
              className="text-2xl font-serif font-semibold text-white mb-2"
            >
              Before you go — free {magnet.title}
            </h2>
            <p className="text-base text-white/90">
              A plain-English guide from SeniorSimple. No agent, no sales calls.
            </p>
          </div>
        )}

        <FormBody
          {...props}
          variant="exit"
        />
      </div>
    </div>
  )
}

function MobileStickyBar(props: {
  onOpen: () => void
  onDismiss: () => void
  magnetId: MagnetId
}) {
  const magnet = MAGNETS[props.magnetId]
  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998] md:hidden">
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #36596A 0%, #82A6B1 100%)',
        }}
      >
        <span className="text-sm text-white flex-1">
          Free {magnet.title} — plain English.
        </span>
        <button
          type="button"
          onClick={props.onOpen}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#36596A]"
        >
          Get it
        </button>
        <button
          type="button"
          onClick={props.onDismiss}
          aria-label="Dismiss"
          className="rounded-full p-1 text-white/80 hover:text-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default function MedicareCaptureUnit(props: MedicareCaptureUnitProps) {
  const { pageSlug, variant, magnetId, topicTag, resultPayload } = props
  const isMobile = useIsMobile()

  const abArm = props.abArm

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [mobileBarOpen, setMobileBarOpen] = useState(false)
  const [mobileBarDismissed, setMobileBarDismissed] = useState(false)

  const hostRef = useRef<HTMLElement | null>(null)

  const fireImpression = useCallback(
    (v: CaptureVariant) => {
      trackCaptureEvent({
        eventName: 'capture_impression',
        pageSlug,
        variant: v,
        magnetId,
        topicTag,
        abArm,
      })
    },
    [pageSlug, magnetId, topicTag, abArm],
  )

  // Impression fires when inline unit scrolls into view.
  useHasFiredImpression(hostRef, () => fireImpression(variant), variant !== 'exit')

  // Desktop exit intent — only for variant='exit', desktop only.
  useExitIntent(
    () => {
      setModalOpen(true)
      fireImpression('exit')
    },
    variant === 'exit' && !isMobile,
  )

  // Mobile fallback for variant='exit': show a sticky bar after 60% scroll.
  useScrollTrigger(
    0.6,
    () => {
      if (mobileBarDismissed) return
      setMobileBarOpen(true)
      fireImpression('inline')
    },
    variant === 'exit' && isMobile && !mobileBarDismissed,
  )

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

      // The variant the user actually interacted with — modal or inline.
      const activeVariant: CaptureVariant = modalOpen ? 'exit' : variant

      trackCaptureEvent({
        eventName: 'capture_submit',
        pageSlug,
        variant: activeVariant,
        magnetId,
        topicTag,
        abArm,
      })

      try {
        const res = await submitToSubscribe({
          email: trimmed,
          firstName: firstName.trim(),
          pageSlug,
          variant: activeVariant,
          magnetId,
          topicTag,
          honeypot,
        })

        if (res.status === 429) {
          setStatus('error')
          setMessage('One moment — please try again shortly.')
          return
        }

        // Any 2xx / 4xx-except-429 (e.g. duplicate) surfaces the same success
        // state — the prompt calls this out explicitly.
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

        // Fire confirm + delivery in parallel.
        trackCaptureEvent({
          eventName: 'capture_confirm',
          pageSlug,
          variant: activeVariant,
          magnetId,
          topicTag,
          abArm,
        })
        void triggerMagnetDelivery({
          email: trimmed,
          firstName: firstName.trim(),
          magnetId,
          pageSlug,
          variant: activeVariant,
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
      modalOpen,
      variant,
      pageSlug,
      magnetId,
      topicTag,
      abArm,
      resultPayload,
    ],
  )

  const formBodyProps = {
    ...props,
    status,
    message,
    email,
    firstName,
    honeypot,
    onEmailChange: setEmail,
    onFirstNameChange: setFirstName,
    onHoneypotChange: setHoneypot,
    onSubmit: handleSubmit,
  }

  // Rendering strategy:
  //  - inline / tool-gate  → always render inline panel
  //  - exit on desktop     → hidden modal, triggered by exit-intent
  //  - exit on mobile      → sticky bar + expandable inline modal fallback
  if (variant === 'inline' || variant === 'tool-gate') {
    return <InlinePanel {...formBodyProps} hostRef={hostRef} />
  }

  // variant === 'exit'
  if (!isMobile) {
    return (
      <ExitModal
        {...formBodyProps}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    )
  }

  // Mobile: sticky bar → expands to inline modal panel when tapped
  return (
    <>
      {mobileBarOpen && !mobileBarDismissed && (
        <MobileStickyBar
          magnetId={magnetId}
          onOpen={() => {
            setModalOpen(true)
            fireImpression('inline')
          }}
          onDismiss={() => {
            setMobileBarDismissed(true)
            setMobileBarOpen(false)
          }}
        />
      )}
      <ExitModal
        {...formBodyProps}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
