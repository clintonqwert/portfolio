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

/** An image with the facts a frame needs to show it honestly. */
export interface ImageSlot {
  src: string;
  /** A placeholder's only: where the real asset belongs once it exists. */
  target?: string;
  alt: string;
  /** Intrinsic pixels, so a frame reserves the image's exact shape before it loads. */
  width: number;
  height: number;
  isPlaceholder: boolean;
  /**
   * Where the capture was taken, as a reader would type it, and the page to
   * open. A screenshot you can click through to is proof; one you cannot is a
   * picture of a claim.
   */
  source?: { label: string; href: string };
}

/**
 * A screenshot placed inside a passage, with a line saying what it shows.
 * Not "Figure": that name is already the stat component on the deck tiles.
 */
export interface PassageFigure {
  image: ImageSlot;
  caption: string;
}

/** A term and what it means — the rows of a `Passage.list`. */
export interface PassageTerm {
  term: string;
  detail: string;
}

/** A body paragraph, optionally introduced by a subheading. */
export interface Passage {
  heading?: string;
  /** Paragraphs. Inline emphasis is expressed with the marks below. */
  paragraphs: string[];
  /**
   * An optional term list rendered after the paragraphs. Some claims are
   * structurally a list — five roles and their permissions, three omissions and
   * their reasons — and prose hides that shape from a reader who is skimming.
   */
  list?: PassageTerm[];
  /**
   * A short linear flow, rendered as labelled boxes joined by arrows. Reserved
   * for the handful of places where the architecture actually IS a sequence —
   * a pull request moving through a CI gate, a record moving through a service.
   * That is evidence of a real mechanism, which is what earns it a diagram;
   * a decorative box-and-arrow graphic with nothing behind it would not.
   */
  diagram?: string[];
  /**
   * A screenshot of the thing the passage describes, shown under its prose.
   * Placed in the chapter it illustrates rather than in a gallery at the end,
   * so the evidence sits next to the claim it is evidence for.
   */
  figure?: PassageFigure;
}

/**
 * A case study. `slug` is the route segment; `rail` is the mono sidebar that
 * runs alongside the prose on wide viewports.
 */
export interface CaseStudy {
  slug: string;
  /**
   * Gives this study the double-width cell on the dashboard, with a
   * two-column interior. One study carries it — the one with the most
   * verifiable detail. Equal cells would claim the three are equivalent.
   */
  feature?: boolean;
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
  /**
   * Set false to keep a study off the dashboard.
   *
   * The deck is exactly one viewport tall with three case-study cells assigned
   * by position; a fourth would collide with the third. A study that is a
   * chapter of another one reaches readers through the rail and through its
   * parent study instead, which costs it nothing.
   */
  onDeck?: boolean;
  /**
   * A footer caveat for the dashboard tile. Separate from `stats` because a
   * study can have both: Tadvantage has six and a half years worth quoting and
   * no adoption figures, and the tile used to be able to show only one of those.
   */
  note?: string;
  /** Optional assertion table, with its caption. */
  assertions?: { caption: string; rows: Assertion[] };
  /**
   * Other pages worth reading next. Internal links a reader who is already
   * interested earns for free — Tadvantage points at myGarage, myGarage points
   * back. Kept as an explicit list rather than inline hyperlinks in prose,
   * because passages render as plain paragraphs and staying that way keeps the
   * content layer simple to author and to check.
   */
  related?: { label: string; href: string }[];
}

/** One stop on the reading path: a page the rail links to, in rail order. */
export interface PageLink {
  href: string;
  label: string;
  /** The rail's index for the page, e.g. "02". */
  index: string;
  /** The group heading above it in the rail, when it sits in one. */
  group?: { label: string; href?: string };
  /** A line saying what the page argues — the headline, for a case study. */
  summary?: string;
}
