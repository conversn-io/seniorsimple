/**
 * Barrel export for the v2 advertorial component library. Names match 1:1
 * with ADVERTORIAL_COMPONENT_LIBRARY_v2.html so a reviewer can cross-check
 * the code against the visual reference by exact identifier.
 *
 * `CtaProvider` wraps the LP body so every CTA component below reads the
 * outbound offer URL from context. Interactive quiz components (D-series)
 * write user selections into that same context as sub6+ params.
 */

// Context — one source of truth for the outbound offer URL.
export {
  CtaProvider,
  useCtaHref,
  useSetCtaSelection,
  type CtaSubs,
} from './CtaContext';

// A · Page chrome
export { default as Masthead } from './Masthead';
export { default as LeadIn } from './LeadIn';
export { default as DisclosureFooter } from './DisclosureFooter';

// B · Text & formatting
export { default as Section } from './Section';
export { default as BlueAnchor } from './BlueAnchor';
export { default as QualifyChecklist } from './QualifyChecklist';
export { default as Quote } from './Quote';

// C · CTA button system
export { default as SectionCTA } from './SectionCTA';
export { default as PrimaryCTA } from './PrimaryCTA';
export { default as StickyCTA } from './StickyCTA';

// D · Interactive qualifiers
export { default as ImageQuiz, type ImageQuizOption } from './ImageQuiz';
export { default as MultiSelectQuiz, type QuizOption } from './MultiSelectQuiz';
export { default as StateSelector, type StateOption } from './StateSelector';

// E · Highlight & trust
export { default as EditorsPick } from './EditorsPick';
export { default as Rating } from './Rating';
export { default as TrustBar } from './TrustBar';
export { default as ClickableImage } from './ClickableImage';

// F · Close
export { default as WrapUpList } from './WrapUpList';
export { default as ShareBar } from './ShareBar';
