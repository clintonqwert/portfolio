import Link from "next/link";

import { RailNav } from "@/components/layout/rail-nav";
import { ProfileCard } from "@/components/layout/profile-card";
import { ThemeToggle } from "@/components/layout/theme-toggle";

import type { NavLink } from "@/lib/content/navigation";
import { CONTACT, CONTACT_HREF, NAME, RESUME } from "@/lib/content/profile";

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
      <div className="rail fixed inset-y-0 left-0 z-[var(--z-rail)] hidden w-[236px] flex-col justify-between bg-rail px-6 py-7 lg:flex">
        <div>
          <ProfileCard />

          <nav aria-label="Sections" className="mt-8 border-t border-rail-line pt-6">
            <RailNav links={links} variant="rail" />
          </nav>
        </div>

        <div className="border-t border-rail-line pt-5">
          <a
            href={RESUME.href}
            download
            className="flex items-center justify-between gap-2 rounded-sm bg-rail-line/60 px-3 py-2.5 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-rail-ink no-underline transition-colors duration-200 hover:bg-accent-bright hover:text-rail"
          >
            Résumé
            <span aria-hidden="true">↓</span>
          </a>
          <a
            href={CONTACT_HREF.email}
            className="mt-3 block break-all font-mono text-[0.68rem] text-rail-muted no-underline hover:text-accent-bright"
          >
            {CONTACT.email}
          </a>
        </div>
      </div>

      {/* ── mobile bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-[var(--z-rail)] border-b border-rail-line bg-rail lg:hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
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
