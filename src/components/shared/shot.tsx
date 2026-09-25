import Image from "next/image";

import type { ImageSlot } from "@/lib/content/assets";

/**
 * A screenshot shown at the size the work deserves, captioned like a figure on
 * a drawing: number, then where it came from.
 *
 * When the site is live the frame is a link to it, so the image is proof you
 * can open rather than a picture of a claim. Sized from the slot's own pixels,
 * so the frame holds the image's exact shape before a byte of it arrives.
 */
export function Shot({
  image,
  figure,
  href,
  source,
  priority = false,
}: {
  image: ImageSlot;
  /** Figure number on this page, e.g. "01". */
  figure: string;
  /** Live URL the frame opens, when there is one. */
  href?: string;
  /** Where the capture came from, as a reader would type it. */
  source?: string;
  /** Above the fold: fetch it first, since it is likely the largest paint. */
  priority?: boolean;
}) {
  const img = (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes="(min-width: 1280px) 560px, (min-width: 1024px) calc(100vw - 332px), 100vw"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className="block h-auto w-full"
    />
  );

  return (
    <div className="shot-drift">
      <figure className="shot">
        {href ? (
          <a href={href} className="shot-frame" aria-label={`${image.alt} — open ${source ?? "the live site"}`}>
            {img}
          </a>
        ) : (
          <div className="shot-frame">{img}</div>
        )}
        <figcaption className="mt-2 flex items-baseline justify-between gap-4 meta text-faint">
          <span className="min-w-0">
            <span className="label">Fig. {figure}</span>
            {source ? <span> — {source}</span> : null}
          </span>
          {image.isPlaceholder ? <span className="shrink-0">Screenshot pending</span> : null}
        </figcaption>
      </figure>
    </div>
  );
}
