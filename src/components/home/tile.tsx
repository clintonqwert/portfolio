import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ImageSlot } from "@/types/content";
import type { Stat } from "@/types/content";

/**
 * A dashboard tile.
 *
 * Tiles clip: the deck is exactly one viewport tall at >=1024px, so a tile can
 * never push the grid. Anything that might exceed its cell goes in a
 * summarised and linked rather than scrolled — a tile that scrolls hides
 * content behind an interaction nobody expects on a dashboard.
 */
export function Tile({
  label,
  index,
  href,
  children,
  className,
  cta,
}: {
  label: string;
  index?: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
  cta?: string;
}) {
  const head = (
    <div className="flex items-baseline justify-between gap-2 border-b border-line px-4 py-2">
      <span className="label flex min-w-0 items-center gap-2 text-ink">
        {/* The counter block, from the reference's page marker: ink with the
            number knocked out, rather than a faint grey numeral. */}
        {index ? (
          <span className="chip meta shrink-0 px-1.5 py-0.5 leading-none">
            {index}
          </span>
        ) : null}
        <span className="display truncate tracking-[0.08em]">{label}</span>
      </span>
      {cta ? (
        <span className="meta flex shrink-0 items-center gap-1 text-faint transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] group-hover:text-accent">
          {cta}
          {/* Decorative: the link's own accessible name already says where
              it goes. The nudge is the same directional cue the rail's
              drop-cap letters use on hover — reaching toward the content
              rather than just changing colour. */}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      ) : null}
    </div>
  );

  const body = (
    <>
      {head}
      <div className="flex min-h-0 flex-1 flex-col px-3 py-3">{children}</div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("tile group no-underline", className)}>
        {body}
      </Link>
    );
  }

  return <div className={cn("tile", className)}>{body}</div>;
}

/** Compact figure used inside tiles. */
export function Figure({ stat, size = "md" }: { stat: Stat; size?: "sm" | "md" }) {
  return (
    <div className="min-w-0">
      <div
        className={cn(
          "figure-value text-ink",
          size === "sm" ? "text-lg" : "text-2xl",
        )}
      >
        {stat.value}
      </div>
      {/* Clamped rather than truncated: at narrow widths a single line cut the
          labels to "PRERENDERED ROU…". Two lines still cannot overflow a cell. */}
      <div className="figure-label mt-0.5 line-clamp-2 text-faint">
        {stat.label}
      </div>
    </div>
  );
}

/**
 * A screenshot inside a tile.
 *
 * The frame takes the image's own aspect ratio, so where the tile has room the
 * whole screen shows, uncropped. Where it does not, the frame is the one thing
 * in the tile allowed to give: it is a shrinkable flex item (`min-h-0`) and
 * the image crops from the bottom (`object-top`), because the top of a page is
 * the part that identifies it. The deck is exactly one viewport tall and a
 * tile cannot grow, so the picture adapts to the cell rather than the cell to
 * the picture.
 *
 * This replaced a fixed 88–132px strip, which cropped a 16:10 screen to a
 * letterbox slice at every width — the deck showed the top eighth of each site
 * and read as cut off. The parent must be a flex column for the shrink to
 * work; each caller also gates the shot behind the width at which its cell has
 * room for it at all.
 */
export function TileShot({
  image,
  className,
}: {
  image: ImageSlot;
  className?: string;
}) {
  return (
    <figure className={cn("min-h-0 shrink flex-col", className)}>
      <div
        className="min-h-0 shrink overflow-hidden bg-sunk shadow-[inset_0_0_0_1px_var(--color-line)]"
        style={{ aspectRatio: `${image.width} / ${image.height}` }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1920px) 480px, 360px"
          className="h-full w-full object-cover object-top"
        />
      </div>
      {image.isPlaceholder ? (
        <figcaption className="mt-0.5 shrink-0 meta text-faint">
          Screenshot pending
        </figcaption>
      ) : null}
    </figure>
  );
}
