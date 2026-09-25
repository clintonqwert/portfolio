import "server-only";

export interface NavLink {
  kind: "link";
  href: string;
  label: string;
  /** Mono index shown in the rail. These are ordered views, not decoration. */
  index: string;
  /** Nested under the heading directly above it, rather than a top-level view. */
  indent?: boolean;
}

/**
 * A section label above a cluster of related links — AutoTrader.ca above
 * Tadvantage/myGarage/Luxury tax, DriftPilot Studio above DriftPilot/Riflessi.
 * Not itself a numbered view: it carries no index unless it is also a real
 * page (`href` set), in which case it is both the label and the umbrella
 * page's own link.
 */
export interface NavHeading {
  kind: "heading";
  label: string;
  href?: string;
  index?: string;
}

export type NavEntry = NavLink | NavHeading;

/**
 * Rail navigation. The dashboard is the overview; every other entry is a view
 * that opens in its own route rather than a section further down a scroll.
 *
 * Two of the entries are groups rather than flat peers, because that is the
 * actual shape of the work: DriftPilot and Riflessi are both built by
 * DriftPilot the studio, and Tadvantage/myGarage/Luxury tax are all work done
 * at AutoTrader.ca — myGarage and Luxury tax are chapters of Tadvantage
 * specifically, not of the company, but one level of nesting says that
 * clearly enough without a second indent tier.
 */
export async function getNavLinks(): Promise<NavEntry[]> {
  return [
    { kind: "link", href: "/", label: "Overview", index: "00" },

    // No href: DriftPilot the studio has no landing page of its own on this
    // site distinct from the DriftPilot case study, so the heading is a label
    // rather than a duplicate link.
    { kind: "heading", label: "DriftPilot Studio" },
    { kind: "link", href: "/work/driftpilot", label: "DriftPilot", index: "01", indent: true },
    { kind: "link", href: "/work/riflessi", label: "Riflessi", index: "02", indent: true },

    // href set: /autotrader is a real page (the AutoSync caching work), so
    // the heading doubles as that page's own link.
    { kind: "heading", label: "AutoTrader.ca", href: "/autotrader", index: "03" },
    { kind: "link", href: "/work/tadvantage", label: "Tadvantage", index: "04", indent: true },
    // Capitalised here only: RailNav renders a label's first character large
    // and forces the rest to uppercase for a drop-cap effect, so a label
    // starting lowercase rendered as "mYGARAGE". The case study itself keeps
    // "myGarage" everywhere else, matching how the feature is actually named
    // in its own prose and in the track record.
    { kind: "link", href: "/work/mygarage", label: "MyGarage", index: "05", indent: true },
    { kind: "link", href: "/work/luxury-tax", label: "Luxury tax", index: "06", indent: true },

    // Same route as before ("Project OS"); relabelled because the label is
    // what a recruiter scans, and "AI Engineering" says what the page is
    // about where "Project OS" only names it.
    { kind: "link", href: "/standard", label: "AI Engineering", index: "07" },
    { kind: "link", href: "/gaps", label: "Open gaps", index: "08" },
    { kind: "link", href: "/history", label: "History", index: "09" },
  ];
}
