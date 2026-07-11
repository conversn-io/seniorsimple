import { NextRequest, NextResponse } from 'next/server'
import { MAGNETS, type MagnetId } from '@/lib/medicare-capture-config'

// SendGrid REST call — no package needed. Fill SENDGRID_API_KEY +
// SENDGRID_FROM_EMAIL in env to enable. Without them the endpoint no-ops so the
// capture flow never fails during launch prep (users still get the instant
// download; GHL sync is already handled by the subscribe trigger).
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send'

const DEFAULT_FROM_NAME = 'SeniorSimple'
const DEFAULT_FROM_EMAIL = 'newsletter@seniorsimple.org'
const SITE_URL = 'https://seniorsimple.org'

interface DeliverBody {
  email?: string
  firstName?: string
  magnetId?: MagnetId
  pageSlug?: string
  variant?: string
  topicTag?: string
  resultPayload?: unknown
}

function buildHtml(args: {
  firstName: string
  magnetId: MagnetId
  downloadUrl: string
  resultPayload?: unknown
}) {
  const magnet = MAGNETS[args.magnetId]
  const greeting = args.firstName ? `Hi ${escapeHtml(args.firstName)},` : 'Hi there,'

  const resultBlock =
    args.magnetId === 'tool-result' && args.resultPayload
      ? `<div style="margin:24px 0;padding:16px;background:#F5F5F0;border-radius:8px;font-size:14px;color:#36596A;">
           <strong>Your inputs / estimate</strong>
           <pre style="margin:8px 0 0;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;">${escapeHtml(
             JSON.stringify(args.resultPayload, null, 2),
           )}</pre>
         </div>`
      : ''

  // Placeholder slot for the future compliance-approved offer block — do NOT
  // insert an agent CTA here without compliance sign-off (CMS/TPMO).
  const offerSlot = `<!-- offer-slot: reserved, compliance-gated -->`

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F5F5F0;font-family:Georgia,serif;color:#36596A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 24px;">
      <tr>
        <td>
          <h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 16px;color:#36596A;">
            ${escapeHtml(magnet.title)}
          </h1>
          <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
          <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
            Thanks for requesting the ${escapeHtml(magnet.title)}. You can download it below.
          </p>
          <p style="text-align:center;margin:24px 0;">
            <a href="${args.downloadUrl}"
               style="display:inline-block;background:#36596A;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;font-size:16px;">
              Download ${escapeHtml(magnet.title)}
            </a>
          </p>
          ${resultBlock}
          <p style="font-size:14px;line-height:1.6;margin:32px 0 0;color:#36596A;opacity:.8;">
            You're receiving this because you requested a guide from SeniorSimple.
            No agent will contact you.
          </p>
          ${offerSlot}
          <hr style="border:0;border-top:1px solid #E4CDA1;margin:24px 0;">
          <p style="font-size:12px;line-height:1.5;color:#36596A;opacity:.7;">
            SeniorSimple · <a href="${SITE_URL}/unsubscribe" style="color:#36596A;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function buildText(args: {
  firstName: string
  magnetId: MagnetId
  downloadUrl: string
}) {
  const magnet = MAGNETS[args.magnetId]
  const greeting = args.firstName ? `Hi ${args.firstName},` : 'Hi there,'
  return [
    magnet.title,
    '',
    greeting,
    '',
    `Thanks for requesting the ${magnet.title}. Download it here:`,
    args.downloadUrl,
    '',
    `You're receiving this because you requested a guide from SeniorSimple. No agent will contact you.`,
    '',
    `Unsubscribe: ${SITE_URL}/unsubscribe`,
  ].join('\n')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  let body: DeliverBody
  try {
    body = (await request.json()) as DeliverBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  const magnetId = body.magnetId
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }
  if (!magnetId || !(magnetId in MAGNETS)) {
    return NextResponse.json({ ok: false, error: 'invalid_magnet' }, { status: 400 })
  }

  const magnet = MAGNETS[magnetId]
  const downloadUrl = `${SITE_URL}${magnet.downloadPath}`

  const apiKey = process.env.SENDGRID_API_KEY
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || DEFAULT_FROM_EMAIL
  const fromName = process.env.SENDGRID_FROM_NAME || DEFAULT_FROM_NAME

  // No-op when SendGrid isn't configured. The user already has the instant
  // download in the success state; GHL sync fires via the subscribe trigger.
  if (!apiKey) {
    return NextResponse.json({ ok: true, delivered: false, reason: 'sendgrid_not_configured' })
  }

  const html = buildHtml({
    firstName: body.firstName?.trim() ?? '',
    magnetId,
    downloadUrl,
    resultPayload: body.resultPayload,
  })
  const text = buildText({
    firstName: body.firstName?.trim() ?? '',
    magnetId,
    downloadUrl,
  })

  try {
    const res = await fetch(SENDGRID_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject: magnet.emailSubject,
          },
        ],
        from: { email: fromEmail, name: fromName },
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
        tracking_settings: {
          click_tracking: { enable: true, enable_text: false },
          open_tracking: { enable: true },
        },
        categories: ['medicare_capture', `magnet:${magnetId}`],
      }),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error('SendGrid deliver-magnet failed:', res.status, errBody)
      return NextResponse.json(
        { ok: false, delivered: false, status: res.status },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, delivered: true })
  } catch (err) {
    console.error('deliver-magnet exception:', err)
    return NextResponse.json({ ok: false, delivered: false }, { status: 500 })
  }
}
