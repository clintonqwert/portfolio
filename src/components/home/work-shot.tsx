import Image, { getImageProps } from "next/image";

import { media } from "@/lib/design-tokens";
import type { WorkPreview } from "@/types/content";

/**
 * A work card's screenshot: a fixed window onto the top of a whole page,
 * which pans down the page while the card is hovered or keyboard-focused,
 * and returns to the top when the pointer leaves. On a phone there is no
 * hover, so the reader's own scroll drives the pan (.work-shot-frame's view
 * timeline). Off under reduced motion either way, and then the whole page is
 * never fetched.
 *
 * Two images, one on the other. At rest only the window loads: the page's
 * top, which is all the frame shows. The whole page is an <img> that is always
 * in the DOM but has no `src` until PreviewLoader sees intent and copies it in
 * from `data-src`. It stays hidden until that fetch arrives, since a sized
 * image with no source draws a broken-image icon. It is always there because
 * an element switched in from `display: none` has no previous style to
 * transition from, so the pan would jump rather than glide; and it is not
 * lazy-loaded because a lazy image in view loads anyway. The window is a crop
 * of the page's top, so the page lands exactly over it.
 *
 * The pan runs at a steady pace: a long page takes longer to pass than a short
 * one, the way scrolling it would.
 */
export function WorkShot({ preview }: { preview: WorkPreview }) {
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
      className="work-shot-frame"
      style={{ "--pan": `${pan.toFixed(2)}s` } as React.CSSProperties}
    >
      <Image
        src={top.src}
        alt={top.alt}
        width={top.width}
        height={top.height}
        sizes={SHOT_SIZES}
        quality={90}
        className="work-shot-window"
      />
      {/* The whole page, for the pan. No src until intent; the optimizer's
          srcset rides along in data attributes. Decorative beside the
          window, which carries the description. */}
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
        className="work-shot-image"
      />
    </figure>
  );
}

/**
 * The window's drawn width: stacked, the card spans the sheet (100vw less the
 * sheet's 20px gutters); from lg, cards sit two to a row in a sheet capped at
 * 1240px, so none draws wider than 560px.
 */
const SHOT_SIZES = `${media.stacked} calc(100vw - 40px), 560px`;
