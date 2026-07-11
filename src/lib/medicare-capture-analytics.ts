import type { CaptureVariant, MagnetId, TopicTag } from './medicare-capture-config'

export type CaptureEventName =
  | 'capture_impression'
  | 'capture_submit'
  | 'capture_confirm'

const SESSION_KEY = 'ss_session_id'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      const cryptoRef = (window.crypto as unknown as { randomUUID?: () => string } | undefined)
      id = cryptoRef?.randomUUID
        ? cryptoRef.randomUUID()
        : `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
      window.sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return `sess_${Date.now().toString(36)}`
  }
}

export interface CaptureEventPayload {
  eventName: CaptureEventName
  pageSlug: string
  variant: CaptureVariant
  magnetId: MagnetId
  topicTag: TopicTag
  abArm?: string
}

export async function trackCaptureEvent(payload: CaptureEventPayload): Promise<void> {
  if (typeof window === 'undefined') return

  const session_id = getSessionId()
  const label = `${payload.pageSlug}|${payload.variant}`

  const body = {
    event_name: payload.eventName,
    event_category: 'medicare_capture',
    event_label: label,
    session_id,
    page_url: window.location.href,
    properties: {
      site_id: 'seniorsimple',
      magnetId: payload.magnetId,
      topicTag: payload.topicTag,
      variant: payload.variant,
      pageSlug: payload.pageSlug,
      ...(payload.abArm ? { ab_arm: payload.abArm } : {}),
    },
  }

  try {
    await fetch('/api/analytics/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    })
  } catch {
    // Analytics failures never block UX
  }
}
