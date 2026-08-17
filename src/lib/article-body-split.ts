/**
 * Split a rendered article body in half at a top-level `<h2>` so a React node
 * (the WO-666 in-body magnet CTA) can be mounted mid-article between two
 * `dangerouslySetInnerHTML` halves.
 *
 * Why not just inject a marker string and `split()` on it? Because CMS bodies
 * are wrapped (`<style>…</style><div data-pa>…</div>`) and the wrapper depth at
 * the midpoint varies per article. Cutting the string naively leaves the first
 * half with unclosed tags and the second half with orphaned closers — the
 * browser silently re-balances that, dropping the wrapper's styling from the
 * second half. So we track the open-tag stack at the split point, close it at
 * the end of the first half, and re-open it (attributes intact) at the start of
 * the second.
 *
 * Runs on the server — the halves ship in the initial HTML, so the CTA between
 * them is server-rendered, not painted in after hydration.
 */

/** Elements that never carry a closing tag, so they never enter the stack. */
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
])

/**
 * Contexts we refuse to cut inside — splitting a table or a raw-text element
 * would produce nonsense no amount of tag-rebalancing fixes.
 */
const UNSPLITTABLE_ANCESTORS = new Set([
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
  'style', 'script', 'pre', 'code', 'ul', 'ol', 'li',
])

const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g

/** Below this, an article is too short to be worth interrupting. */
const MIN_BODY_LENGTH = 2500

export interface SplitArticleBody {
  /** Everything before the CTA, with the open-tag stack closed off. */
  before: string
  /**
   * Everything after the CTA, with the stack re-opened. `null` when no safe
   * split point exists — callers should render `before` whole and place the
   * CTA after the body instead.
   */
  after: string | null
}

interface OpenTag {
  name: string
  /** The literal source tag, so re-opening preserves classes/ids/data-attrs. */
  raw: string
}

export function splitArticleBodyForCta(html: string): SplitArticleBody {
  if (!html || html.length < MIN_BODY_LENGTH) return { before: html, after: null }

  const target = html.length / 2
  const stack: OpenTag[] = []

  let best: { index: number; stack: OpenTag[] } | null = null
  let bestDistance = Infinity

  TAG_RE.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = TAG_RE.exec(html)) !== null) {
    const [raw, closing, rawName] = match
    const name = rawName.toLowerCase()

    if (closing) {
      // Unwind to the matching opener. Malformed markup (a stray closer, or a
      // <p> the CMS never closed) just pops nothing rather than corrupting the
      // stack for the rest of the document.
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === name) {
          stack.length = i
          break
        }
      }
      continue
    }

    if (VOID_ELEMENTS.has(name) || raw.endsWith('/>')) continue

    // A candidate cut sits immediately BEFORE this <h2>, so the heading opens
    // the second half — the CTA lands at a section boundary, not mid-thought.
    if (name === 'h2') {
      const index = match.index
      const distance = Math.abs(index - target)
      const withinMiddle = index > html.length * 0.25 && index < html.length * 0.75
      const splittable = !stack.some((t) => UNSPLITTABLE_ANCESTORS.has(t.name))

      if (withinMiddle && splittable && distance < bestDistance) {
        bestDistance = distance
        best = { index, stack: [...stack] }
      }
    }

    stack.push({ name, raw })
  }

  if (!best) return { before: html, after: null }

  const closers = best.stack
    .map((t) => `</${t.name}>`)
    .reverse()
    .join('')
  const reopeners = best.stack.map((t) => t.raw).join('')

  return {
    before: html.slice(0, best.index) + closers,
    after: reopeners + html.slice(best.index),
  }
}
