import Link from "next/link";

import { RailNav } from "@/components/layout/rail-nav";
import { ProfileCard } from "@/components/layout/profile-card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import type { NavEntry } from "@/lib/content/navigation";
import { AVAILABILITY, CONTACT, CONTACT_HREF, NAME, RESUME } from "@/lib/content/profile";

/**
 * The navigation rail. Fixed full-height chrome at ≥1024px, a horizontal bar
 * below that.
 *
 * Server component: these are anchors, so nothing here needs the browser and
 * the rail ships no JavaScript. Section highlighting would require a client
 * observer and is not worth the bytes on a page this short.
 */
export function SiteRail({ links }: { links: NavEntry[] }) {
  return (
    <>
      {/* ── desktop rail ───────────────────────────────────────────────── */}
      <div /* overflow-y-auto is the guarantee, not the polish. The rail is
          position:fixed, so anything past the fold cannot be scrolled to —
          at a 700px viewport that silently hid two of the five contact
          links, and at 660px three of them. The portrait steps below cut
          how often a scrollbar appears; this is what makes it impossible
          to lose the links at any height. */
        className="rail fixed inset-y-0 left-0 z-[var(--z-rail)] hidden w-[236px] min-h-0 flex-col justify-between overflow-y-auto border-r border-rail-line bg-rail px-4 py-4 lg:flex">
        <div>
          <ProfileCard />

          <nav aria-label="Sections" className="mt-4 border-t border-rail-line pt-3">
            <RailNav links={links} variant="rail" />
          </nav>
        </div>

        <div className="border-t border-rail-line pt-3">
          {/* Availability, stated rather than buried — a reviewer should not
              have to hunt for whether this person is open to work. */}
          <p className="mb-3 flex items-center gap-2 meta text-rail-muted">
            <span aria-hidden="true" className="size-[6px] shrink-0 rounded-full bg-pass" />
            {AVAILABILITY}
          </p>

          <a
            href={RESUME.href}
            download
            className="chip display flex items-center justify-between gap-2 px-3 py-2 text-2xs uppercase tracking-[0.08em] no-underline transition-opacity duration-200 hover:opacity-80"
          >
            Résumé
            <span aria-hidden="true">↓</span>
          </a>

          {/*
            The site's argument is that every claim is checkable. These are how
            a reader checks — they were previously only in JSON-LD, which is to
            say invisible to the human being asked to verify.
          */}
          {/*
            py-2 is a floor, not a rhythm choice: it is what keeps each link
            above the 24px WCAG 2.2 target-size minimum at this type size. A
            spacing-scale sweep once took it to py-1 — 23.3px — and only
            Lighthouse caught it, because a token check cannot see geometry.
          */}
          <ul className="mt-2 font-mono text-3xs">
            {(
              [
                [CONTACT_HREF.email, CONTACT.email],
                [CONTACT_HREF.github, CONTACT.github],
                [CONTACT_HREF.linkedin, CONTACT.linkedin],
                [CONTACT_HREF.studio, CONTACT.studio],
              ] as const
            ).map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="block truncate py-2 text-rail-muted no-underline transition-colors hover:text-accent-bright"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── mobile bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-[var(--z-rail)] border-b border-rail-line bg-rail lg:hidden">
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <Link href="/" className="no-underline">
            <span className="font-display text-md font-bold text-rail-ink">
              {NAME}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="bg-rail-line/50 text-rail-muted" />
            <a
              href={RESUME.href}
              download
              className="chip display px-3 py-1.5 text-3xs uppercase tracking-[0.08em] no-underline"
            >
              Résumé ↓
            </a>
          </div>
        </div>
        <nav aria-label="Sections" className="overflow-x-auto border-t border-rail-line/60">
          <RailNav links={links} variant="bar" />
        </nav>
      </header>
    </>
  );
}
