/**
 * The contract between content and presentation.
 *
 * Components never import content modules directly — they receive these shapes
 * as props. Changing anything here is a deliberate act: it is the seam that lets
 * the content source be replaced without touching a page or a component.
 */

/** A measured figure. Every one of these is checkable against a repository. */
export interface Stat {
  /** The number itself, pre-formatted for display (e.g. "19.07 MB → 2.05 MB"). */
  value: string;
  /** What it measures, in two or three words. */
  label: string;
  /** Optional qualifier shown beneath the label. */
  detail?: string;
}

/** A row in a threshold table — an assertion and its current state. */
export interface Assertion {
  name: string;
  threshold: string;
  /** Current measured state, or "passing" when the assertion simply holds. */
  state: string;
  /** Renders the state in the "measured" style rather than the "passing" style. */
  measured?: boolean;
}

/** A named, unfixed weakness with its consequence and the intended fix. */
export interface Gap {
  gap: string;
  consequence: string;
  fix: string;
}

/** One position in the track record. */
export interface Role {
  period: string;
  title: string;
  org: string;
  summary: string;
}

/** A grouped list of tools or practices. */
export interface StackGroup {
  name: string;
  items: string;
}

/** A short principle shown in the practice grid. */
export interface Principle {
  title: string;
  body: string;
}

/** A body paragraph, optionally introduced by a subheading. */
export interface Passage {
  heading?: string;
  /** Paragraphs. Inline emphasis is expressed with the marks below. */
  paragraphs: string[];
}

/**
 * A case study. `slug` is the route segment; `rail` is the mono sidebar that
 * runs alongside the prose on wide viewports.
 */
export interface CaseStudy {
  slug: string;
  /** Short name used in navigation and cards. */
  name: string;
  /** Sentence-case headline — the argument the case study makes. */
  headline: string;
  /** One-line summary used on the home page and in metadata. */
  summary: string;
  period: string;
  /** Live URL without protocol, or null when nothing is publicly reachable. */
  liveUrl: string | null;
  /** Public source repository without protocol, or null. */
  repoUrl: string | null;
  role: string;
  stack: string[];
  stats: Stat[];
  passages: Passage[];
  /** Optional assertion table, with its caption. */
  assertions?: { caption: string; rows: Assertion[] };
}
