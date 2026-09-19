import "server-only";

export interface NavLink {
  href: string;
  label: string;
  /** Mono index shown in the rail. Not decorative: these are ordered sections. */
  index: string;
}

/**
 * Rail navigation. The order is the reading order of the page, so the numbers
 * carry real information rather than being scaffolding.
 */
export async function getNavLinks(): Promise<NavLink[]> {
  return [
    { href: "/#work", label: "Work", index: "01" },
    { href: "/#autotrader", label: "AutoTrader", index: "02" },
    { href: "/#standard", label: "Standard", index: "03" },
    { href: "/#practice", label: "Practice", index: "04" },
    { href: "/#gaps", label: "Open gaps", index: "05" },
    { href: "/#history", label: "History", index: "06" },
    { href: "/#contact", label: "Contact", index: "07" },
  ];
}
