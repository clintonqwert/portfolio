import "server-only";

export interface NavLink {
  href: string;
  label: string;
  /** Mono index shown in the rail. These are ordered views, not decoration. */
  index: string;
}

/**
 * Rail navigation. The dashboard is the overview; every other entry is a view
 * that opens in its own route rather than a section further down a scroll.
 */
export async function getNavLinks(): Promise<NavLink[]> {
  return [
    { href: "/", label: "Overview", index: "00" },
    { href: "/work/driftpilot", label: "DriftPilot", index: "01" },
    { href: "/work/riflessi", label: "Riflessi", index: "02" },
    { href: "/work/tadvantage", label: "Tadvantage", index: "03" },
    // myGarage is not listed here on purpose: it is a feature of Tadvantage,
    // not a peer of it, so it is reached through Tadvantage's own "Related"
    // link (and points back the same way) rather than sitting beside it in
    // the primary rail. The route and case study page still exist at
    // /work/mygarage — it is attached, not deleted.
    { href: "/work/luxury-tax", label: "Luxury tax", index: "04" },
    // Same route as before ("Project OS"); relabelled because the label is
    // what a recruiter scans, and "AI Engineering" says what the page is
    // about where "Project OS" only names it.
    { href: "/standard", label: "AI Engineering", index: "05" },
    { href: "/autotrader", label: "AutoTrader", index: "06" },
    { href: "/gaps", label: "Open gaps", index: "07" },
    { href: "/history", label: "History", index: "08" },
  ];
}
