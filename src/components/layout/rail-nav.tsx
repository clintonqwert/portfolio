"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { NavLink } from "@/lib/content/navigation";

/**
 * Rail navigation with an active-section indicator.
 *
 * The only client component on the site. A single-page nav that cannot tell you
 * where you are is a list of links, not navigation — so this is worth the bytes.
 *
 * Progressive enhancement: the links are real anchors and work before hydration;
 * the indicator is the only thing that needs JavaScript. IntersectionObserver
 * rather than a scroll listener, so there is no per-frame main-thread work.
 */
export function RailNav({
  links,
  variant,
}: {
  links: NavLink[];
  variant: "rail" | "bar";
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const ids = links
      .map((l) => l.href.split("#")[1])
      .filter((id): id is string => Boolean(id));

    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    // Top third of the viewport: a section counts as current once its heading
    // has travelled up into the reading area, not when it first peeks in.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -66% 0px", threshold: 0 },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [links]);

  if (variant === "bar") {
    return (
      <ul className="flex w-max gap-1 px-4 py-2">
        {links.map((link) => {
          const id = link.href.split("#")[1];
          const isActive = id === active;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "location" : undefined}
                className={`block whitespace-nowrap px-2.5 py-1.5 font-display text-[0.78rem] font-medium uppercase tracking-[0.04em] no-underline transition-colors duration-200 ${
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
      {links.map((link) => {
        const id = link.href.split("#")[1];
        const isActive = id === active;
        // The drop cap is decorative splitting of one word, so the label is
        // given to assistive tech whole and the two spans are hidden from it.
        const [first = "", ...rest] = [...link.label];
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? "location" : undefined}
              aria-label={link.label}
              // py-[6px] is a floor, not a rhythm choice: at this type size
              // anything less puts the row under the 24px WCAG 2.2 target
              // minimum. It shipped at 3px once and measured 22.8px.
              className={`group relative flex items-baseline py-[6px] pl-[10px] no-underline transition-colors duration-200 ${
                isActive ? "text-rail-ink" : "text-rail-muted hover:text-rail-ink"
              }`}
            >
              {/* Marked twice — the rule and the weight — so position never
                  rests on colour alone. Square, like everything else here. */}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-rail-ink transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              <span
                aria-hidden="true"
                className={`font-display leading-none transition-colors ${
                  isActive
                    ? "text-[1.18rem] font-bold text-rail-ink"
                    : "text-[1.05rem] font-bold text-rail-ink"
                }`}
              >
                {first}
              </span>
              <span
                aria-hidden="true"
                className={`font-display text-[0.74rem] uppercase leading-none tracking-[0.06em] ${
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
