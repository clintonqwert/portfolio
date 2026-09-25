"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavEntry } from "@/lib/content/navigation";

/**
 * Rail navigation that knows which page you are on.
 *
 * A nav that cannot tell you where you are is a list of links, not
 * navigation. This used to find the current *section* by observing `#hash`
 * targets, from when the site was one long page; every entry has been its own
 * route since, so the observer found nothing and no link was ever marked —
 * including on the case study you had just opened from the deck. The route
 * is the location now, so the route is what is compared.
 *
 * The links are real anchors and work before hydration; only the marker
 * needs the pathname.
 */
export function RailNav({
  links,
  variant,
}: {
  links: NavEntry[];
  variant: "rail" | "bar";
}) {
  const pathname = usePathname();
  const isCurrent = (href: string) => href === pathname;

  if (variant === "bar") {
    // A heading with no href (e.g. "DriftPilot Studio") is a label with
    // nothing to open, so it is dropped from the flat mobile strip rather
    // than rendered as a dead pill.
    const items = links.filter(
      (l): l is NavEntry & { href: string } => Boolean(l.href),
    );
    return (
      <ul className="flex w-max gap-1 px-4 py-2">
        {items.map((link) => {
          const isActive = isCurrent(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`block whitespace-nowrap px-2.5 py-1.5 font-display text-xs font-medium uppercase tracking-[0.04em] no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] ${
                  isActive ? "chip" : "text-rail-muted"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul>
      {links.map((entry) => {
        if (entry.kind === "heading") {
          // A section label above a cluster of related links, styled like
          // every other small-caps label on the site rather than as a nav
          // item — it is context, not a fourth level of the drop cap.
          //
          // py-2 rather than the smaller pt-4/pb-1 this shipped with first:
          // that pairing measured 19px tall, under the WCAG 2.2 24px target
          // floor, because label text is 10px against the real links' 12px.
          // The mt-3 on the <li> is what actually separates this group from
          // the one above — margin, not padding, so it doesn't inflate the
          // link's own hit area past what it needs to be.
          const headingClass = "block py-2 pl-2.5 label";
          const headingActive = entry.href ? isCurrent(entry.href) : false;
          return (
            <li key={entry.label} className="mt-3">
              {entry.href ? (
                <Link
                  href={entry.href}
                  aria-current={headingActive ? "page" : undefined}
                  className={`${headingClass} no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] ${
                    headingActive ? "font-medium text-rail-ink" : "text-rail-muted hover:text-rail-ink"
                  }`}
                >
                  {entry.label}
                </Link>
              ) : (
                <span className={`${headingClass} text-rail-muted`}>{entry.label}</span>
              )}
            </li>
          );
        }

        const link = entry;
        const isActive = isCurrent(link.href);
        // The drop cap is decorative splitting of one word, so the label is
        // given to assistive tech whole and the two spans are hidden from it.
        const [first = "", ...rest] = [...link.label];
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={link.label}
              // py-1.5 is a floor, not a rhythm choice: at this type size
              // anything less puts the row under the 24px WCAG 2.2 target
              // minimum. It shipped at 3px once and measured 22.8px.
              // Indented entries (myGarage under AutoTrader.ca, Riflessi
              // under DriftPilot Studio) get extra left padding instead of a
              // smaller type size, so the 24px target floor still holds.
              className={`group relative flex items-baseline py-1.5 no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] ${
                link.indent ? "pl-6" : "pl-2.5"
              } ${isActive ? "text-rail-ink" : "text-rail-muted hover:text-rail-ink"}`}
            >
              {/*
                Marked twice — the rule and the weight — so position never
                rests on colour alone. Square, like everything else here.
                Reaching full opacity on hover too, not just on the active
                page: a link should answer before it's clicked, the same way
                a tile's hairline firms up under the cursor.
              */}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-rail-ink transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                }`}
              />
              <span
                aria-hidden="true"
                className={`font-display leading-none transition-[color,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] group-hover:translate-x-0.5 ${
                  isActive
                    ? "text-xl font-bold text-rail-ink"
                    : "text-lg font-bold text-rail-ink"
                }`}
              >
                {first}
              </span>
              <span
                aria-hidden="true"
                className={`font-display text-xs uppercase leading-none tracking-[0.06em] transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] group-hover:translate-x-0.5 ${
                  isActive ? "font-semibold text-rail-ink" : "font-medium"
                }`}
              >
                {rest.join("")}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
