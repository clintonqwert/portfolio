"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import type { NavEntry, NavHeading, NavLink } from "@/lib/content/navigation";

/**
 * Rail navigation that knows which page you are on.
 *
 * A nav that cannot tell you where you are is a list of links, not
 * navigation. This used to find the current *section* by observing `#hash`
 * targets, from when the site was one long page; every entry has been its own
 * route since, so the observer found nothing and no link was ever marked —
 * including on the case study you had just opened from the overview. The route
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
  return variant === "bar" ? <BarNav links={links} /> : <RailList links={links} />;
}

/** A heading and the indented links under it. */
interface NavGroup {
  kind: "group";
  heading: NavHeading;
  links: NavLink[];
}

/**
 * The rail's entries with each heading holding the indented links beneath it,
 * so a group is a list inside the list: drawn as one, and read out as one.
 * The rule is getReadingOrder's — an unindented link closes the group above
 * it — so the nesting can never disagree with the reading path.
 */
function grouped(entries: NavEntry[]): (NavLink | NavGroup)[] {
  const out: (NavLink | NavGroup)[] = [];
  for (const entry of entries) {
    const last = out.at(-1);
    if (entry.kind === "heading") out.push({ kind: "group", heading: entry, links: [] });
    else if (entry.indent && last?.kind === "group") last.links.push(entry);
    else out.push(entry);
  }
  return out;
}

const EASE = "duration-[var(--duration-fast)] ease-[var(--ease-out-quart)]";

function RailList({ links }: { links: NavEntry[] }) {
  const pathname = usePathname();
  const isCurrent = (href: string) => href === pathname;

  return (
    <ul>
      {grouped(links).map((item) => {
        if (item.kind === "link") {
          return <RailLink key={item.href} link={item} current={isCurrent(item.href)} />;
        }

        const { heading } = item;
        // A section label above a cluster of related links, styled like
        // every other small-caps label on the site rather than as a nav
        // item — it is context, not a fourth level of the drop cap.
        //
        // py-2 rather than the smaller pt-4/pb-1 this shipped with first:
        // that pairing measured 19px tall, under the WCAG 2.2 24px target
        // floor, because label text is 10px against the real links' 12px.
        // The my-2 on the <li> is what separates the group from its
        // neighbours — margin, not padding, so it doesn't inflate the link's
        // own hit area — and the margins collapse, so the practice pages
        // after the last group get the same 8px the groups do between them.
        const row = "relative flex items-baseline py-2 pl-2.5 label";
        const current = heading.href ? isCurrent(heading.href) : false;
        return (
          <li key={heading.label} className="my-2">
            {heading.href ? (
              // A heading that is also a page (AutoTrader.ca) carries a
              // number and answers the pointer like any link; one that is
              // not (DriftPilot Studio) has neither, which is how a reader
              // tells them apart without either looking like a button.
              <Link
                href={heading.href}
                aria-current={current ? "page" : undefined}
                className={`group ${row} no-underline transition-colors ${EASE} ${
                  current ? "font-medium text-rail-ink" : "text-rail-muted hover:text-rail-ink"
                }`}
              >
                <Marker current={current} className="left-0 top-2 bottom-2" />
                {heading.label}
                {heading.index ? <Index value={heading.index} current={current} /> : null}
              </Link>
            ) : (
              <span className={`${row} text-rail-muted`}>{heading.label}</span>
            )}

            {/* The rule down the group's left edge ties its pages to the
                heading, and the current one is marked on it. */}
            <ul className="ml-2.5 border-l border-rail-line">
              {item.links.map((link) => (
                <RailLink key={link.href} link={link} current={isCurrent(link.href)} nested />
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

function RailLink({
  link,
  current,
  nested = false,
}: {
  link: NavLink;
  current: boolean;
  nested?: boolean;
}) {
  // The drop cap is decorative splitting of one word, so the label is
  // given to assistive tech whole and the spans are hidden from it.
  const [first = "", ...rest] = [...link.label];
  return (
    <li>
      <Link
        href={link.href}
        aria-current={current ? "page" : undefined}
        aria-label={link.label}
        // py-1.5 is a floor, not a rhythm choice: at this type size
        // anything less puts the row under the 24px WCAG 2.2 target
        // minimum. It shipped at 3px once and measured 22.8px.
        // A nested link (myGarage under AutoTrader.ca, Riflessi under
        // DriftPilot Studio) is set in by its group's margin and rule rather
        // than by a smaller type size, so the 24px target floor still holds.
        className={`group relative flex items-baseline py-1.5 no-underline transition-colors ${EASE} ${
          nested ? "pl-3.5" : "pl-2.5"
        } ${current ? "text-rail-ink" : "text-rail-muted hover:text-rail-ink"}`}
      >
        {/* Nested, the marker sits on the group's 1px rule: 3px wide from
            2px left of the link's edge, so it is centred on the line. */}
        <Marker
          current={current}
          className={nested ? "-left-[2px] top-1.5 bottom-1.5" : "left-0 top-1.5 bottom-1.5"}
        />
        {/* One size in both states. The current page's first letter used to
            grow from lg to xl, and the rail stays mounted across navigations,
            so every row under it jumped 2px on each click. The marker, the
            weight and the number's chip already say where you are. */}
        <span
          aria-hidden="true"
          className={`font-display text-lg font-bold leading-none text-rail-ink transition-transform ${EASE} group-hover:translate-x-0.5`}
        >
          {first}
        </span>
        <span
          aria-hidden="true"
          className={`font-display text-xs uppercase leading-none tracking-[0.06em] transition-transform ${EASE} group-hover:translate-x-0.5 ${
            current ? "font-semibold text-rail-ink" : "font-medium"
          }`}
        >
          {rest.join("")}
        </span>
        <Index value={link.index} current={current} />
      </Link>
    </li>
  );
}

/**
 * The rule beside the page you are on. Marked three ways — this rule, the
 * weight and the number's chip — so position never rests on colour alone.
 * Square, like everything else here. It reaches 60% on hover too, not just on
 * the current page: a link should answer before it's clicked, the same way a
 * work card's hairline firms up under the cursor.
 */
function Marker({ current, className }: { current: boolean; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute w-[3px] bg-rail-ink transition-opacity ${EASE} ${className} ${
        current ? "opacity-100" : "opacity-0 group-hover:opacity-60"
      }`}
    />
  );
}

/**
 * The page's number, right-aligned like a contents page. It is the number the
 * page's hero and chapter bar carry, so the "02" a reader sees there can be
 * found here; on the current page it is the hero's own ink chip. The padding
 * is there in both states so the digits stay in one column.
 *
 * -my-0.5 takes the chip's padding back out of the row's height. Aligned on
 * the baseline, the padding hung below the drop cap's descent and made every
 * link row 1px taller: 9px over the rail, more than it had to spare at 768px.
 * tracking-normal because a heading row's .label tracks its text 0.1em.
 */
function Index({ value, current }: { value: string; current: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`-my-0.5 ml-auto px-1.5 py-0.5 meta leading-none tracking-normal transition-colors ${EASE} ${
        current ? "chip" : "text-rail-muted group-hover:text-rail-ink"
      }`}
    >
      {value}
    </span>
  );
}

/**
 * The same pages as a strip of pills, for the bar below lg.
 *
 * The strip is wider than a phone, and it used to load scrolled to its start
 * whatever the page: on /history the current pill sat 730px into a 375px
 * strip, so the one thing a nav has to say was off-screen. It now centres the
 * current pill on arrival and on every navigation.
 */
function BarNav({ links }: { links: NavEntry[] }) {
  const pathname = usePathname();
  const strip = useRef<HTMLDivElement>(null);
  const arrived = useRef(false);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const current = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (current) {
      // Measured against the strip (relative, so it is the pill's
      // offsetParent) rather than with scrollIntoView, which would also
      // scroll the page under the sticky bar. On arrival it jumps; after
      // that it slides, unless the reader has asked for less motion.
      const glide =
        arrived.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({
        left: current.offsetLeft - (el.clientWidth - current.offsetWidth) / 2,
        behavior: glide ? "smooth" : "auto",
      });
    }
    arrived.current = true;
  }, [pathname]);

  // A heading with no href (e.g. "DriftPilot Studio") is a label with
  // nothing to open, so it is dropped from the flat strip rather than
  // rendered as a dead pill.
  const items = links.filter(
    (l): l is NavEntry & { href: string } => Boolean(l.href),
  );
  return (
    <div ref={strip} className="strip relative overflow-x-auto">
      <ul className="flex w-max gap-1 px-4 py-2">
        {items.map((link) => {
          const isActive = link.href === pathname;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`block whitespace-nowrap px-2.5 py-1.5 font-display text-xs font-medium uppercase tracking-[0.04em] no-underline transition-colors ${EASE} ${
                  isActive ? "chip" : "text-rail-muted"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
