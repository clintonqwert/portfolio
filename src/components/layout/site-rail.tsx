import Link from "next/link";

import { RailNav } from "@/components/layout/rail-nav";
import { ProfileCard } from "@/components/layout/profile-card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import type { NavLink } from "@/lib/content/navigation";
import { AVAILABILITY, CONTACT, CONTACT_HREF, NAME, RESUME } from "@/lib/content/profile";

/**
 * The navigation rail. Fixed full-height chrome at ≥1024px, a horizontal bar
 * below that.
 *
 * Server component: these are anchors, so nothing here needs the browser and
 * the rail ships no JavaScript. Section highlighting would require a client
 * observer and is not worth the bytes on a page this short.
 */
export function SiteRail({ links }: { links: NavLink[] }) {
  return (
    <>
      {/* ── desktop rail ───────────────────────────────────────────────── */}
      <div className="rail fixed inset-y-0 left-0 z-[var(--z-rail)] hidden w-[236px] flex-col justify-between bg-rail px-[16px] py-[16px] lg:flex">
        <div>
          <ProfileCard />

          <nav aria-label="Sections" className="mt-[16px] border-t border-rail-line pt-[12px]">
            <RailNav links={links} variant="rail" />
          </nav>
        </div>

        <div className="border-t border-rail-line pt-[12px]">
          {/* Availability, stated rather than buried — a reviewer should not
              have to hunt for whether this person is open to work. */}
          <p className="mb-[12px] flex items-center gap-[8px] font-mono text-[0.64rem] text-rail-muted">
            <span aria-hidden="true" className="size-[6px] shrink-0 rounded-full bg-pass" />
            {AVAILABILITY}
          </p>

          <a
            href={RESUME.href}
            download
            className="flex items-center justify-between gap-2 rounded-sm bg-rail-line/60 px-[12px] py-[8px] font-mono text-[0.68rem] uppercase tracking-[0.08em] text-rail-ink no-underline transition-colors duration-200 hover:bg-accent-bright hover:text-rail"
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
            py-[8px] is a floor, not a rhythm choice: it is what keeps each link
            above the 24px WCAG 2.2 target-size minimum at this type size. A
            spacing-scale sweep once took it to py-[4px] — 23.3px — and only
            Lighthouse caught it, because a token check cannot see geometry.
          */}
          <ul className="mt-[8px] font-mono text-[0.64rem]">
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
                  className="block truncate py-[8px] text-rail-muted no-underline transition-colors hover:text-accent-bright"
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
        <div className="flex items-center justify-between gap-[12px] px-[12px] py-[8px]">
          <Link href="/" className="no-underline">
            <span className="font-display text-[0.86rem] font-bold text-rail-ink">
              {NAME}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle className="bg-rail-line/50 text-rail-muted" />
            <a
              href={RESUME.href}
              download
              className="rounded-sm bg-rail-line/60 px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.08em] text-rail-ink no-underline"
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
