"use client";

import { useEffect, useRef } from "react";

/**
 * The cursor over a deck tile: a square that shatters into a grid, spreads,
 * flies apart and settles back into one — after the image-hover cursor on
 * architech-template.webflow.io, rebuilt in CSS rather than shipped as a
 * Lottie file and its player.
 *
 * Mounted as a child of the deck; it watches its parent for pointer movement
 * and appears only over a link tile. It trails the pointer with a little
 * smoothing, which is what makes it read as an object rather than a sprite
 * pinned to the arrow. The native cursor is hidden only once this has mounted
 * (`data-tile-cursor` on the deck), so if the script never runs, the arrow
 * never goes missing.
 *
 * Fine hover-capable pointers only, and never under reduced motion: on touch
 * there is no pointer to follow, and a cursor that keeps moving is exactly
 * what reduced motion asks to be spared.
 */
export function TileCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = ref.current;
    const deck = cursor?.parentElement;
    if (!cursor || !deck) return;

    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    if (!media.matches) return;

    deck.dataset.tileCursor = "";

    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let placed = false;
    let frame = 0;

    const render = () => {
      // Close a fifth of the distance each frame: quick enough to feel
      // attached, slow enough to trail.
      x += (targetX - x) * 0.2;
      y += (targetY - y) * 0.2;
      cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.3 ? requestAnimationFrame(render) : 0;
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!placed) {
        // First sighting: appear where the pointer is, not glide in from 0,0.
        x = targetX;
        y = targetY;
        placed = true;
      }
      const overTile = (event.target as Element | null)?.closest("a.tile") !== null;
      cursor.dataset.active = overTile ? "true" : "false";
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onLeave = () => {
      cursor.dataset.active = "false";
      placed = false;
    };

    deck.addEventListener("pointermove", onMove);
    deck.addEventListener("pointerleave", onLeave);
    return () => {
      deck.removeEventListener("pointermove", onMove);
      deck.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
      delete deck.dataset.tileCursor;
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
