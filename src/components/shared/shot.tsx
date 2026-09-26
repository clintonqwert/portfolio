import Image from "next/image";

import { media } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import type { ImageSlot } from "@/types/content";

/**
 * `sizes` for a case-study hero's shot: beside the title from xl (half the
 * sheet), the sheet's width beside the rail from lg (the viewport less the
 * 236px rail and the sheet's gutters), and the viewport below that. The
 * switches are the page's own breakpoints, from design-tokens, so the image
 * is chosen for the layout the hero is actually in.
 */
export const HERO_SIZES = `${media.xl} 560px, ${media.lg} calc(100vw - 332px), 100vw`;

/**
 * A screenshot shown at the size the work deserves, captioned like a figure on
 * a drawing: number, what it shows, then where it came from.
 *
 * When the slot knows its source the frame is a link to it, so the image is
 * proof you can open rather than a picture of a claim. Sized from the slot's
 * own pixels, so the frame holds the image's exact shape before a byte of it
 * arrives — no layout shift, however late it loads.
 *
 * The hero shot unveils once on load and drifts as the hero leaves; a figure
 * further down reveals as it scrolls into view instead, since by the time a
 * reader reaches it a load animation has long since finished unseen.
 */
export function Shot({
  image,
  figure,
  caption,
  sizes,
  hero = false,
}: {
  image: ImageSlot;
  /** Figure number on this page, e.g. "01". */
  figure: string;
  /** What the figure shows, when the page has something to say about it. */
  caption?: string;
  /** Rendered width hints for the srcset — see next/image `sizes`. */
  sizes: string;
  /** Above the fold: fetched first, since it is likely the largest paint. */
  hero?: boolean;
}) {
  const img = (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      loading={hero ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : undefined}
      className="block h-auto w-full"
    />
  );

  const source = image.source;

  return (
    <div className={hero ? "shot-drift" : undefined}>
      <figure className={hero ? "shot" : "shot-reveal"}>
        {source ? (
          <a
            href={source.href}
            className="shot-frame"
            aria-label={`${image.alt} — open ${source.label}`}
          >
            {img}
          </a>
        ) : (
          <div className="shot-frame">{img}</div>
        )}
        <figcaption
          className={cn(
            "mt-2.5 flex gap-x-4 gap-y-1 meta text-faint",
            caption ? "flex-col sm:flex-row sm:items-baseline" : "items-baseline",
          )}
        >
          <span className="label shrink-0">Fig. {figure}</span>
          {caption ? (
            <span className="max-w-[60ch] font-body text-sm leading-snug text-muted">
              {caption}
            </span>
          ) : null}
          {source ? (
            <span className={cn("min-w-0", caption ? "sm:ml-auto sm:shrink-0" : "")}>
              {source.label}
            </span>
          ) : null}
          {image.isPlaceholder ? <span className="shrink-0">Screenshot pending</span> : null}
        </figcaption>
      </figure>
    </div>
  );
}
