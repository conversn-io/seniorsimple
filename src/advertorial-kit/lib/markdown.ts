/**
 * Minimal, safe markdown → HTML for advertorial body copy.
 *
 * We intentionally do NOT pull in remark/marked/react-markdown. Advertorial
 * copy comes from our own CMS via service-role writes, but the content is
 * still user-authored — so this renderer is:
 *
 *   • Whitelist-only: only the tags we emit below can appear in the output.
 *   • Escape-first: every source character is HTML-escaped before any markup
 *     is inserted. Impossible to smuggle raw HTML through the input.
 *   • Small: paragraphs, bold, italic, unordered/ordered lists, blockquotes,
 *     inline links — the shape advertorials actually need.
 *
 * Links: inline `[text](url)` links are rendered as `<a target="_blank"
 * rel="noopener noreferrer nofollow sponsored">`. Monetized CTA links do NOT
 * flow through this — they render as an explicit CTA button on the item
 * pointing at `/out/[slug]/[slot_key]`.
 *
 * If a body_md value ever needs richer markdown (tables, code, images), swap
 * this out for a real parser + sanitizer; do NOT extend it in-place.
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]!)
}

// URL that's safe to emit in an href. Blocks javascript:, data:, vbscript:, etc.
// Also rejects URLs that already contain angle brackets or quotes (raw or
// pre-escaped) — those show up in break-out attempts and never in real links.
function safeHref(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (/[<>"']/.test(trimmed)) return null
  if (/&(lt|gt|quot|#39);/i.test(trimmed)) return null
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/'))         return trimmed
  if (trimmed.startsWith('mailto:'))   return trimmed
  if (trimmed.startsWith('tel:'))      return trimmed
  return null
}

// Apply inline markup (bold, italic, links) to already-escaped text.
// Operates on already-escaped text so nothing here can inject HTML — the only
// characters `<>` in the string are our own generated tags.
function renderInline(escaped: string): string {
  let out = escaped

  // Links: [text](url). URL is validated by safeHref; text stays as-is
  // (already escaped). Non-http/mailto/tel urls get dropped.
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text: string, rawUrl: string) => {
    const href = safeHref(rawUrl)
    if (!href) return text
    // rawUrl was already passed through escapeHtml before renderInline runs, so
    // it is already safe for an HTML attribute context — do NOT escape twice or
    // valid `&` characters become `&amp;amp;`.
    return `<a href="${href}" target="_blank" rel="noopener noreferrer nofollow sponsored">${text}</a>`
  })

  // Bold: **x** — no nesting across newlines (already impossible: we run per-block)
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic: *x* — same constraint. Skip when the match is really the tail of
  // a **bold** run already consumed above (we ran bold first).
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')

  return out
}

interface Block {
  kind: 'p' | 'ul' | 'ol' | 'blockquote' | 'heading'
  level?: 2 | 3       // for heading
  lines: string[]
}

// Group source lines into blocks. Only the block shapes we support.
function splitBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let cur: Block | null = null

  const flush = () => {
    if (cur) { blocks.push(cur); cur = null }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (line.trim() === '') {
      flush()
      continue
    }

    // Heading (## / ###) — one line each, don't buffer with prose.
    const h = /^(#{2,3})\s+(.*)$/.exec(line)
    if (h) {
      flush()
      const level = h[1].length === 2 ? 2 : 3
      blocks.push({ kind: 'heading', level, lines: [h[2]] })
      continue
    }

    // Unordered list item
    const ul = /^\s*[-*]\s+(.*)$/.exec(line)
    if (ul) {
      if (!cur || cur.kind !== 'ul') { flush(); cur = { kind: 'ul', lines: [] } }
      cur.lines.push(ul[1])
      continue
    }

    // Ordered list item
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line)
    if (ol) {
      if (!cur || cur.kind !== 'ol') { flush(); cur = { kind: 'ol', lines: [] } }
      cur.lines.push(ol[1])
      continue
    }

    // Blockquote
    const bq = /^>\s?(.*)$/.exec(line)
    if (bq) {
      if (!cur || cur.kind !== 'blockquote') { flush(); cur = { kind: 'blockquote', lines: [] } }
      cur.lines.push(bq[1])
      continue
    }

    // Plain paragraph line — extend the current paragraph or start one.
    if (!cur || cur.kind !== 'p') { flush(); cur = { kind: 'p', lines: [] } }
    cur.lines.push(line)
  }

  flush()
  return blocks
}

export function renderMarkdown(source: string | null | undefined): string {
  if (!source) return ''
  const blocks = splitBlocks(source)
  const parts: string[] = []

  for (const block of blocks) {
    if (block.kind === 'heading') {
      const text = renderInline(escapeHtml(block.lines[0]))
      parts.push(`<h${block.level}>${text}</h${block.level}>`)
    } else if (block.kind === 'p') {
      const joined = renderInline(escapeHtml(block.lines.join(' ')))
      parts.push(`<p>${joined}</p>`)
    } else if (block.kind === 'ul' || block.kind === 'ol') {
      const items = block.lines
        .map((li) => `<li>${renderInline(escapeHtml(li))}</li>`)
        .join('')
      parts.push(`<${block.kind}>${items}</${block.kind}>`)
    } else if (block.kind === 'blockquote') {
      const joined = renderInline(escapeHtml(block.lines.join(' ')))
      parts.push(`<blockquote>${joined}</blockquote>`)
    }
  }

  return parts.join('\n')
}
