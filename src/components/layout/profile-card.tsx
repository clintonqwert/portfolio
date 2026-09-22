import Image from "next/image";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LOCATION, NAME, PORTRAIT, ROLE_TITLE } from "@/lib/content/profile";

/**
 * Profile block at the top of the rail.
 *
 * The avatar and the theme toggle share the first row; the name and role sit
 * below at the rail's full width. Putting all four on one row — as a full-width
 * header can — leaves about 30px for the text in a 236px rail, which truncated
 * the name to "C..".
 */
export function ProfileCard() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Image
          src={PORTRAIT.src}
          alt={PORTRAIT.alt}
          width={72}
          height={72}
          priority
          className="size-[72px] shrink-0 bg-sunk object-cover object-top shadow-[inset_0_0_0_1px_var(--color-rail-line)]"
        />
        <ThemeToggle
          iconOnly
          className="shrink-0 bg-rail-line/40 text-rail-muted hover:bg-rail-line/70 hover:text-rail-ink"
        />
      </div>

      {/* The wordmark, with its period. Clinton's earlier design signs the
          page "CLINTON RAMONIDA." — expanded, tracked, and stopped. It is the
          one piece of this that is unmistakably his rather than generic. */}
      <p className="display mt-[10px] text-[0.92rem] uppercase leading-[1.15] tracking-[0.02em] text-rail-ink">
        {NAME}
        <span aria-hidden="true">.</span>
      </p>
      <p className="mt-[2px] font-mono text-[0.62rem] uppercase leading-snug tracking-[0.09em] text-accent-bright">
        {ROLE_TITLE}
      </p>
      <p className="mt-[2px] font-mono text-[0.64rem] text-rail-muted">{LOCATION}</p>
    </div>
  );
}
