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
                className={`block whitespace-nowrap rounded-sm px-2.5 py-1.5 font-display text-[0.78rem] font-medium no-underline transition-colors duration-200 ${
                  isActive
                    ? "bg-rail-line/70 text-rail-ink"
                    : "text-rail-muted"
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
    <ul className="space-y-[2px]">
      {links.map((link) => {
        const id = link.href.split("#")[1];
        const isActive = id === active;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? "location" : undefined}
              className={`group relative flex items-baseline gap-[8px] rounded-sm px-[4px] py-[4px] no-underline transition-colors duration-200 ${
                isActive
                  ? "bg-rail-line/50 text-rail-ink"
                  : "text-rail-muted hover:bg-rail-line/30 hover:text-rail-ink"
              }`}
            >
              {/* Position is marked twice — bar and weight — so the state does
                  not rest on colour alone. */}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent-bright transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              <span
                className={`font-mono text-[0.62rem] tabular-nums transition-colors ${
                  isActive ? "text-accent-bright" : "text-rail-muted"
                }`}
              >
                {link.index}
              </span>
              <span
                className={`font-display text-[0.86rem] ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
              >
                {link.label}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
