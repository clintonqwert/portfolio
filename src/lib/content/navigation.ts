import "server-only";

import { getCaseStudies } from "@/lib/content/work";
import type { PageLink } from "@/types/content";

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

    // History moved up: it's who the work belongs to, so it reads right after
    // the work itself rather than after the process/meta pages. Open gaps
    // moved to last on purpose — it is the appendix, not the opener.
    { kind: "link", href: "/history", label: "History", index: "07" },
    // Same route as before ("Project OS"); relabelled because the label is
    // what a recruiter scans, and "AI Engineering" says what the page is
    // about where "Project OS" only names it.
    { kind: "link", href: "/standard", label: "AI Engineering", index: "08" },
    { kind: "link", href: "/gaps", label: "Open gaps", index: "09" },
  ];
}

/**
 * Every page off the deck, in the order the rail lists them.
 *
 * Derived from getNavLinks rather than written out again, so the reading path
 * a page's footer offers can never disagree with the rail beside it. Case
 * studies carry their own name and headline: the rail's "MyGarage" is
 * capitalised only for its drop cap (see above), and a footer is not a rail.
 */
export async function getReadingOrder(): Promise<PageLink[]> {
  const [entries, studies] = await Promise.all([getNavLinks(), getCaseStudies()]);
  const pages: PageLink[] = [];
  let group: PageLink["group"];

  for (const entry of entries) {
    if (entry.kind === "heading") {
      group = { label: entry.label, href: entry.href };
      if (entry.href && entry.index) {
        pages.push({ href: entry.href, label: entry.label, index: entry.index });
      }
      continue;
    }
    // An unindented link closes the group above it.
    if (!entry.indent) group = undefined;
    if (entry.href === "/") continue;

    const study = studies.find((s) => `/work/${s.slug}` === entry.href);
    pages.push({
      href: entry.href,
      label: study?.name ?? entry.label,
      index: entry.index,
      group: entry.indent ? group : undefined,
      summary: study?.headline,
    });
  }
  return pages;
}

/** The page at `href`, and its neighbours on the reading path. */
export async function getPagePosition(href: string): Promise<{
  page: PageLink | undefined;
  prev: PageLink | undefined;
  next: PageLink | undefined;
}> {
  const pages = await getReadingOrder();
  const i = pages.findIndex((p) => p.href === href);
  return {
    page: pages[i],
    prev: i > 0 ? pages[i - 1] : undefined,
    next: i >= 0 && i < pages.length - 1 ? pages[i + 1] : undefined,
  };
}
