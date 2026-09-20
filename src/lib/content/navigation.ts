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
    { href: "/work/mygarage", label: "myGarage", index: "03" },
    { href: "/autotrader", label: "AutoTrader", index: "04" },
    { href: "/gaps", label: "Open gaps", index: "05" },
    { href: "/standard", label: "Project OS", index: "06" },
    { href: "/history", label: "History", index: "07" },
  ];
}
