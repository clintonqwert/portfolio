import Image from "next/image";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LOCATION, NAME, PORTRAIT, ROLE_TITLE } from "@/lib/content/profile";

/**
 * Profile block at the top of the rail.
 *
 * The portrait leads at the rail's own width rather than sitting beside the
 * name as a 72px avatar. In a monochrome interface the photograph is the only
 * colour on the page, which is the whole premise of the palette — showing it at
 * thumbnail size wastes the one element carrying any warmth, and left the rail
 * with 210px of dead space beneath the nav.
 *
 * It is square because the frame is square; a 4:5 crop would only be cropped
 * back. Sizing lives in .portrait, which steps with viewport height — the rail
 * has 78px of slack on a short screen and 360px on a tall one.
 *
 * The toggle moves onto the name row. It is chrome, and it should not be
 * competing with a face for the top-left corner.
 */
export function ProfileCard() {
  return (
    <div>
      <Image
        src={PORTRAIT.src}
        alt={PORTRAIT.alt}
        width={208}
        height={208}
        // Not `priority`: that preloads it, and below lg the rail is hidden,
        // so phones fetched a portrait they never show (Lighthouse,
        // offscreen-images). Lazy and hidden means never fetched; on a desktop
        // it is in view at load and arrives at once.
        fetchPriority="high"
        className="portrait shrink-0 bg-sunk object-cover object-top shadow-[inset_0_0_0_1px_var(--color-rail-line)]"
      />

      <div className="mt-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="display text-base uppercase leading-[1.15] tracking-[0.02em] text-rail-ink">
            {NAME}
            <span aria-hidden="true">.</span>
          </p>
          <p className="mt-0.5 font-mono text-3xs uppercase leading-snug tracking-[0.09em] text-accent-bright">
            {ROLE_TITLE}
          </p>
          <p className="mt-0.5 meta text-rail-muted">{LOCATION}</p>
        </div>
        <ThemeToggle
          iconOnly
          className="shrink-0 bg-rail-line/40 text-rail-muted hover:bg-rail-line/70 hover:text-rail-ink"
        />
      </div>
    </div>
  );
}
