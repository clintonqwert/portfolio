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
          width={52}
          height={52}
          priority
          className="size-[52px] shrink-0 rounded-full bg-rail-line object-cover object-top shadow-[inset_0_0_0_1px_var(--color-rail-line)]"
        />
        <ThemeToggle
          iconOnly
          className="shrink-0 bg-rail-line/40 text-rail-muted hover:bg-rail-line/70 hover:text-rail-ink"
        />
      </div>

      <p className="mt-3 font-display text-[0.95rem] font-bold leading-[1.2] tracking-[-0.018em] text-rail-ink">
        {NAME}
      </p>
      <p className="mt-1 font-mono text-[0.62rem] uppercase leading-snug tracking-[0.09em] text-accent-bright">
        {ROLE_TITLE}
      </p>
      <p className="mt-1 font-mono text-[0.64rem] text-rail-muted">{LOCATION}</p>
    </div>
  );
}
