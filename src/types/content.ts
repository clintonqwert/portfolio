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
 * A deck tile's screenshot: the top of a page, shown at rest, and the whole
 * page, fetched only when a reader shows intent to pan it. The window is a
 * crop of the page's top, so the two line up and the swap cannot be seen.
 */
export interface DeckPreview {
  window: ImageSlot;
  page: ImageSlot;
}

/**
 * A short screen recording of a live site, shown as a figure. For what a
 * still cannot show: motion driven by the reader's own scroll.
 */
export interface VideoSlot {
  /** H.264 MP4 — the one format every browser, iOS included, plays. */
  src: string;
  /** The recording's own first frame, so pressing play does not jump. */
  poster: string;
  /** What the recording shows, for assistive tech; the caption says why. */
  label: string;
  /** Intrinsic pixels, so the frame reserves the recording's shape. */
  width: number;
  height: number;
  /** The live page it was recorded from. */
  source?: { label: string; href: string };
}

/**
 * A figure placed inside a passage, with a line saying what it shows: a
 * screenshot, or a recording where motion is the point. Not "Figure": that
 * name is already the stat component on the deck tiles.
 */
export type PassageFigure =
  | { image: ImageSlot; video?: never; caption: string }
  | { video: VideoSlot; image?: never; caption: string };

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
   * Gives this study the widest of the deck's study cells, with a
   * two-column interior, first among the studies. One study carries it. Equal
   * cells would claim the three are equivalent.
   */
  feature?: boolean;
  /**
   * The wide cell's right column, for a feature study with no assertion
   * table to put there: what was mine, each a short restatement of
   * something the passages below already publish. Never a new claim.
   */
  highlights?: string[];
  /** Short name used in navigation and cards. */
  name: string;
  /**
   * A shorter one still, for a deck cell at its narrowest (1024–1279) — the
   * rail's name for the page. Only where the name would otherwise be cut.
   */
  shortName?: string;
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
  assertions?: {
    caption: string;
    rows: Assertion[];
    /**
     * Where a reader can see the budgets pass for themselves — a public CI
     * run. The thresholds are goals the gate enforces; this is the result.
     */
    evidence?: { label: string; href: string };
  };
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

/** Where a roadmap or direction claim can be checked: a PR, a repository file or a live page. */
export interface Source {
  label: string;
  href: string;
}

/**
 * Shipped: merged to main. Now: an open pull request. Next: on a repository's
 * roadmap with a priority, not started. Later: waiting on a named condition.
 */
export type Horizon = "shipped" | "now" | "next" | "later";

/** One engineering item on /roadmap. */
export interface RoadmapItem {
  /** Anchor on /roadmap, and what an OpenGap's closedBy names. */
  id: string;
  title: string;
  project: "DriftPilot" | "Riflessi" | "Both" | "Drive";
  horizon: Horizon;
  /** ISO date (YYYY-MM-DD). Shipped items only. */
  shippedOn?: string;
  detail: string;
  /** At least one: an item nobody can check does not go on the page. */
  sources: readonly [Source, ...Source[]];
}

/** A horizon's heading, what it means, and its items in authored order. */
export interface RoadmapGroup {
  horizon: Horizon;
  title: string;
  meaning: string;
  items: RoadmapItem[];
}

/** One stage of where the studio is heading. */
export interface DirectionStage {
  name: string;
  project: string;
  summary: string;
  /** Solid marker when built, open when planned. */
  done: boolean;
  statusLabel: string;
  source: Source;
}

/**
 * A known weakness and what it costs. Either a roadmap item closes it, or
 * there is a mitigation until one does. Never both, never neither.
 */
export type OpenGap = { gap: string; consequence: string } & (
  | { closedBy: string; mitigation?: never }
  | { mitigation: string; closedBy?: never }
);

/** The home tile's summary of what is moving: in progress, else next. */
export interface UpNext {
  heading: string;
  status: string;
  filled: boolean;
  items: RoadmapItem[];
}
