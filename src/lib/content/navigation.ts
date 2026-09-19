import "server-only";

export interface NavLink {
  href: string;
  label: string;
}

/** In-page anchors on the home route, plus the two case studies. */
export async function getNavLinks(): Promise<NavLink[]> {
  return [
    { href: "/work/driftpilot", label: "DriftPilot" },
    { href: "/work/riflessi", label: "Riflessi" },
    { href: "/#autotrader", label: "AutoTrader" },
    { href: "/#gaps", label: "Gaps" },
    { href: "/#contact", label: "Contact" },
  ];
}
