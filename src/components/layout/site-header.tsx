import Link from "next/link";

import { Wrap } from "@/components/ui/wrap";
import type { NavLink } from "@/lib/content/navigation";
import { NAME } from "@/lib/content/profile";

/**
 * Site chrome. Server component — the nav is links only, so nothing here needs
 * the browser and nothing ships JavaScript.
 */
export function SiteHeader({ links }: { links: NavLink[] }) {
  return (
    <header className="border-b border-line bg-ground/90 backdrop-blur supports-[backdrop-filter]:bg-ground/75 sticky top-0 z-40">
      <Wrap className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link
          href="/"
          className="font-display text-[0.82rem] font-bold uppercase tracking-[0.08em] text-ink no-underline"
        >
          {NAME}
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[0.72rem] uppercase tracking-[0.1em]">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted underline-offset-4 hover:text-accent hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Wrap>
    </header>
  );
}
