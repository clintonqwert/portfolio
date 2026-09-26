import Link from "next/link";

import { RailNav } from "@/components/layout/rail-nav";
import { ProfileCard } from "@/components/layout/profile-card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import type { NavEntry } from "@/lib/content/navigation";
import { Availability, ContactLinks } from "@/components/layout/profile-details";
import { NAME, RESUME } from "@/lib/content/profile";

/**
 * The navigation rail. Fixed full-height chrome at ≥1024px, a horizontal bar
 * below that.
 *
 * Server component: these are anchors, so nothing here needs the browser. The
 * one client part is RailNav, which reads the pathname to mark the page you
 * are on.
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
          <Availability className="mb-3" />

          <a
            href={RESUME.href}
            download
            className="chip display flex items-center justify-between gap-2 px-3 py-2 text-2xs uppercase tracking-[0.08em] no-underline transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:opacity-80"
          >
            Résumé
            <span aria-hidden="true">↓</span>
          </a>

          <div className="mt-2">
            <ContactLinks layout="stack" />
          </div>
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
