import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ImageSlot } from "@/lib/content/assets";
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
    <div className="flex items-baseline justify-between gap-2 border-b border-line px-3 py-2">
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
        <span className="meta shrink-0 text-faint transition-colors group-hover:text-accent">
          {cta} →
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
      <div className="figure-label mt-1 line-clamp-2 text-faint">
        {stat.label}
      </div>
    </div>
  );
}

/**
 * A screenshot inside a tile.
 *
 * Height is fixed rather than aspect-derived, because the deck is exactly one
 * viewport tall and a tile cannot grow: an image whose height depends on the
 * column width would push the cell at some widths and not others. `object-cover`
 * takes the crop instead.
 *
 * Tiles only have room for this above a certain width — measured, not guessed —
 * so every caller passes its own breakpoint class.
 */
export function TileShot({
  image,
  className,
}: {
  image: ImageSlot;
  className?: string;
}) {
  return (
    <figure className={cn("shrink-0", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        width={800}
        height={500}
        className="h-[var(--shot-h)] w-full rounded-md bg-sunk object-cover object-top shadow-[inset_0_0_0_1px_var(--color-line)]"
      />
      {image.isPlaceholder ? (
        <figcaption className="mt-0.5 meta text-faint">
          Screenshot pending
        </figcaption>
      ) : null}
    </figure>
  );
}
