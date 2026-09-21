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
    <div className="flex items-baseline justify-between gap-[8px] border-b border-line px-[12px] py-[8px]">
      <span className="flex items-baseline gap-2 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-accent">
        {index ? <span className="text-faint tabular-nums">{index}</span> : null}
        {label}
      </span>
      {cta ? (
        <span className="shrink-0 font-mono text-[0.64rem] text-faint transition-colors group-hover:text-accent">
          {cta} →
        </span>
      ) : null}
    </div>
  );

  const body = (
    <>
      {head}
      <div className="flex min-h-0 flex-1 flex-col px-[12px] py-[12px]">{children}</div>
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
          "font-mono font-medium leading-none tabular-nums tracking-[-0.025em] text-ink",
          size === "sm" ? "text-[1.05rem]" : "text-[1.45rem]",
        )}
      >
        {stat.value}
      </div>
      {/* Clamped rather than truncated: at narrow widths a single line cut the
          labels to "PRERENDERED ROU…". Two lines still cannot overflow a cell. */}
      <div className="mt-[4px] line-clamp-2 font-mono text-[0.6rem] uppercase leading-tight tracking-[0.07em] text-faint">
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
        <figcaption className="mt-[2px] font-mono text-[0.58rem] text-faint">
          Screenshot pending
        </figcaption>
      ) : null}
    </figure>
  );
}
