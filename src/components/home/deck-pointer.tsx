"use client";

import { useEffect, useRef } from "react";

import { media } from "@/lib/design-tokens";

/**
 * The deck's pointer behaviour, in one small island mounted as a child of the
 * deck and watching its parent:
 *
 *  1. Loading each tile's whole-page preview only when its pan is about to
 *     run. At rest a tile shows only the top of the page (TileShot). On the
 *     desktop deck the page pans on hover or focus, so the first pointer or
 *     keyboard focus on a tile is the signal. On a phone it pans as the tile
 *     scrolls past, so the signal is the tile coming within 300px of the
 *     viewport, and the lighter q75 encode is used. Nowhere the pan cannot
 *     run — reduced motion, or no scroll timelines on a phone — is a whole
 *     page fetched at all, nor on a phone whose reader has asked to save
 *     data: scrolling past is not asking for a page the way hovering one is.
 *
 *  2. The tile cursor: a square that shatters into a grid, spreads, flies
 *     apart and settles back into one — after the image-hover cursor on
 *     architech-template.webflow.io, rebuilt in CSS. It rides beside the
 *     arrow rather than replacing it, so nobody who relies on an enlarged or
 *     high-contrast system cursor loses theirs over a tile. Fine pointers only.
 *
 * Both follow the media queries live, so plugging in a mouse or changing the
 * motion setting mid-visit is honoured without a reload.
 */
export function DeckPointer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = ref.current;
    const deck = cursor?.parentElement;
    if (!cursor || !deck) return;

    const canPan = window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)");
    const fine = window.matchMedia("(pointer: fine)");
    // The phone pan (see .tile-shot-frame): scroll-driven, below lg. The same
    // three conditions as the CSS that runs it — width, motion, support — so
    // no page is fetched that will not pan.
    const scrollPan = window.matchMedia(`${media.stacked} and (prefers-reduced-motion: no-preference)`);
    const timelines = CSS.supports("animation-timeline: view()");

    let detachPointer: (() => void) | undefined;
    let detachScroll: (() => void) | undefined;
    const sync = () => {
      detachPointer?.();
      detachScroll?.();
      detachPointer = canPan.matches ? attach(deck, cursor, fine) : undefined;
      detachScroll = scrollPan.matches && timelines && !savingData() ? loadNearViewport(deck) : undefined;
    };
    sync();
    canPan.addEventListener("change", sync);
    scrollPan.addEventListener("change", sync);
    return () => {
      canPan.removeEventListener("change", sync);
      scrollPan.removeEventListener("change", sync);
      detachPointer?.();
      detachScroll?.();
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" data-active="false" className="tile-cursor">
      <div className="tile-cursor-burst">
        {SHARDS.map(([gx, gy, jx, jy], i) => (
          <span
            key={i}
            className={i === MAIN ? "tile-cursor-shard tile-cursor-main" : "tile-cursor-shard"}
            style={
              {
                "--x": gx,
                "--y": gy,
                "--jx": `${jx}px`,
                "--jy": `${jy}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

/** Wire the deck up; returns the undo. */
function attach(deck: HTMLElement, cursor: HTMLElement, fine: MediaQueryList): () => void {
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let placed = false;
  let active = false;
  let frame = 0;

  const setActive = (next: boolean) => {
    // Written only on change: a pointermove per frame rewriting the same
    // attribute is a style invalidation per frame for nothing.
    if (next === active) return;
    active = next;
    cursor.dataset.active = next ? "true" : "false";
  };

  const render = () => {
    // Close a fifth of the distance each frame: quick enough to feel
    // attached, slow enough to trail. Offset down and right of the pointer,
    // so the square sits beside the arrow's tip instead of on it.
    x += (targetX - x) * 0.2;
    y += (targetY - y) * 0.2;
    cursor.style.transform = `translate3d(${(x + OFFSET).toFixed(1)}px, ${(y + OFFSET).toFixed(1)}px, 0)`;
    frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.3 ? requestAnimationFrame(render) : 0;
  };

  const onMove = (event: PointerEvent) => {
    const tile = (event.target as Element | null)?.closest("a.tile") ?? null;
    if (tile) loadPreview(tile);
    if (!fine.matches || event.pointerType !== "mouse") return setActive(false);

    targetX = event.clientX;
    targetY = event.clientY;
    if (!placed) {
      // First sighting: appear where the pointer is, not glide in from 0,0.
      x = targetX;
      y = targetY;
      placed = true;
    }
    setActive(tile !== null);
    if (!frame) frame = requestAnimationFrame(render);
  };

  const onLeave = () => {
    setActive(false);
    placed = false;
  };

  // Keyboard focus pans the tile too (:focus-visible), so it is intent as well.
  const onFocus = (event: FocusEvent) => {
    const tile = (event.target as Element | null)?.closest("a.tile");
    if (tile) loadPreview(tile);
  };

  deck.addEventListener("pointermove", onMove);
  deck.addEventListener("pointerleave", onLeave);
  deck.addEventListener("focusin", onFocus);
  return () => {
    deck.removeEventListener("pointermove", onMove);
    deck.removeEventListener("pointerleave", onLeave);
    deck.removeEventListener("focusin", onFocus);
    if (frame) cancelAnimationFrame(frame);
    setActive(false);
  };
}

/** Give a tile's whole-page image its source, once. */
function loadPreview(tile: Element) {
  const img = tile.querySelector<HTMLImageElement>("img.tile-shot-image[data-src]");
  if (img) load(img);
}

function load(img: HTMLImageElement) {
  if (!img.dataset.src) return;
  // Shown once it has arrived (see .tile-shot-image). Until then the window
  // beneath is the picture, and a fetch that fails leaves it that way.
  img.addEventListener(
    "load",
    () => {
      img.dataset.loaded = "true";
    },
    { once: true },
  );
  const narrow = window.matchMedia(media.stacked).matches;
  const srcset = narrow ? img.dataset.srcsetNarrow : img.dataset.srcset;
  if (srcset) img.srcset = srcset;
  img.src = img.dataset.src;
  delete img.dataset.src;
  delete img.dataset.srcset;
  delete img.dataset.srcsetNarrow;
}

/**
 * Whether the reader has asked to save data: Save-Data, or the media feature
 * where a browser ships it. The window then stays at its page's top. The CSS
 * pan still runs, over an image with no source, which draws nothing.
 */
function savingData(): boolean {
  const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
  return connection?.saveData === true || window.matchMedia("(prefers-reduced-data: reduce)").matches;
}

/** Phones: load each page as its tile comes within 300px of the viewport. */
function loadNearViewport(deck: HTMLElement): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        load(entry.target as HTMLImageElement);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "300px 0px" },
  );
  deck.querySelectorAll<HTMLImageElement>("img.tile-shot-image[data-src]").forEach((img) => {
    // The image itself is clipped by its window; its box still intersects.
    observer.observe(img);
  });
  return () => observer.disconnect();
}

/** How far down and right of the pointer the square rides, in px. */
const OFFSET = 26;

/**
 * The 4×4 grid, as cell offsets from centre, each with a small fixed jitter so
 * the spread reads as fragments rather than a grid expanding in step. Fixed,
 * not random: the same every render, so server and client agree.
 */
const SHARDS: [number, number, number, number][] = [
  [-1.5, -1.5, -2, 1], [-0.5, -1.5, 1, -2], [0.5, -1.5, -1, 2], [1.5, -1.5, 2, -1],
  [-1.5, -0.5, 1, 2], [-0.5, -0.5, 0, 0], [0.5, -0.5, 2, 1], [1.5, -0.5, -2, 2],
  [-1.5, 0.5, -1, -2], [-0.5, 0.5, 2, -1], [0.5, 0.5, -2, -1], [1.5, 0.5, 1, 1],
  [-1.5, 1.5, 2, 2], [-0.5, 1.5, -1, 1], [0.5, 1.5, 1, -2], [1.5, 1.5, -2, -1],
];

/** The shard that survives each cycle, rotating back to the centre. */
const MAIN = 5;
