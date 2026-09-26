import Image, { getImageProps } from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { DeckPreview, Stat } from "@/types/content";

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
    // Head and body share one inset at every width, so a tile's text lines
    // up under its own title — they were 16px and 12px, a visible 4px step.
    // 12px up to 1280, where the narrow cells are ~200px and each pixel of
    // inset re-wraps a stat label; 16px above, as in the spacing reference.
    <div className="flex items-baseline justify-between gap-2 border-b border-line px-3 py-2 xl:px-4">
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
      <div className="flex min-h-0 flex-1 flex-col px-3 py-3 xl:px-4">{children}</div>
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
 * A screenshot inside a tile: a fixed window onto the top of a whole page,
 * which pans down the page while the tile is hovered or keyboard-focused —
 * a scroll preview of the site, returning to the top when the pointer leaves.
 *
 * Every shot on the deck is the same height (`.tile-shot-frame`), set to the
 * room the most crowded tile has, so the row reads as one set of windows
 * rather than four pictures cropped to whatever each cell happened to leave.
 * The frame may still shrink as a last resort at a viewport the deck was not
 * measured at (`min-h-0`), so a tile can never be pushed past its cell.
 *
 * Two images, one on the other. At rest only the window loads: the page's
 * top, which is all the frame shows. The whole page is an <img> that is always
 * in the DOM but has no `src` until DeckPointer sees intent — a pointer or
 * keyboard focus on the tile — and copies it in from `data-src`. It is always
 * there because an element switched in from `display: none` has no previous
 * style to transition from, so the pan would jump rather than glide; and it
 * is not lazy-loaded because a lazy image in view loads anyway. The window is
 * a crop of the page's top, so the page lands exactly over it.
 *
 * On the desktop deck the pan runs on hover or focus at a steady pace: a long
 * page takes longer to pass than a short one, the way scrolling it would. On
 * a phone there is no hover, so the page pans as the tile scrolls past — the
 * reader's own scroll drives it (.tile-shot-frame's view timeline). Off under
 * reduced motion either way, and then the whole page is never fetched.
 */
export function TileShot({
  preview,
  className,
  priority = false,
}: {
  preview: DeckPreview;
  className?: string;
  /**
   * Fetch the window at once, not lazily. For the first work tile: on a phone
   * its window is in the first screen and the largest paint there, and a lazy
   * image waits for layout before it even asks — mobile LCP went to 3.4s
   * until it stopped waiting. The price is ~40 kB fetched for nothing at
   * 1024–1439, the one band where this tile hides its shot.
   */
  priority?: boolean;
}) {
  const { window: top, page } = preview;
  // ~1.75s per image-width of page: about 230px/s through a 390px window.
  const pan = Math.min(10, Math.max(2.5, (page.height / page.width) * 1.75));

  const common = {
    src: page.src,
    alt: "",
    width: page.width,
    height: page.height,
    sizes: SHOT_SIZES,
  } as const;
  const { props: whole } = getImageProps({ ...common, quality: 90 });
  // Phones pan the page as it scrolls by rather than on a held hover, so it
  // is passing, not studied: a lighter encode is the right trade there.
  const {
    props: { srcSet: narrowSrcSet },
  } = getImageProps({ ...common, quality: 75 });

  return (
    <figure
      className={cn("min-h-0 shrink flex-col", className)}
      style={{ "--pan": `${pan.toFixed(2)}s` } as React.CSSProperties}
    >
      <div className="tile-shot-frame">
        <Image
          src={top.src}
          alt={top.alt}
          width={top.width}
          height={top.height}
          sizes={SHOT_SIZES}
          quality={90}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="tile-shot-window"
        />
        {/* The whole page, for the pan. No src until intent (see above); the
            optimizer's srcset rides along in data attributes. Decorative
            beside the window, which carries the description. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- deferred on purpose; next/image cannot hold a src back */}
        <img
          data-src={whole.src}
          data-srcset={whole.srcSet}
          data-srcset-narrow={narrowSrcSet}
          sizes={whole.sizes}
          width={whole.width}
          height={whole.height}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="tile-shot-image"
        />
      </div>
      {top.isPlaceholder ? (
        <figcaption className="mt-0.5 shrink-0 meta text-faint">
          Screenshot pending
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Widest window at each width — the AutoTrader tile's, ~450px at 1728 and
 * ~520px at 1920 — so no tile is handed a source narrower than it draws.
 * Undersizing this once upscaled an 800px image into a 904-device-pixel
 * window, which is most of what read as blur.
 */
const SHOT_SIZES =
  "(max-width: 1023px) calc(100vw - 56px), (min-width: 2400px) 760px, (min-width: 1920px) 540px, (min-width: 1680px) 470px, 320px";
