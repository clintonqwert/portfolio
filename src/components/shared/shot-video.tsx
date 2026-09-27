"use client";

import { useEffect, useRef, useState } from "react";

import { ShotCaption } from "@/components/shared/shot-caption";
import { savingData } from "@/lib/reader-preferences";
import type { VideoSlot } from "@/types/content";

/**
 * A screen recording shown as a figure: for what a screenshot cannot show,
 * motion driven by the reader's own scroll on a live site.
 *
 * Muted, looped and inline, and it plays only while at least half of it is on
 * screen, so it costs nothing until it is looked at: `preload="none"` means
 * the file is not fetched until it first plays, and the poster is set only
 * as the figure comes within 800px. Under reduced motion or Save-Data it
 * never starts by itself, since scrolling past is not asking for a 2 MB
 * video; the button still plays it. Reduced motion is followed live, as the
 * deck's pointer is: switched on mid-visit, the loop stops.
 *
 * The button is the pause WCAG 2.2.2 asks of anything that moves on its own
 * for more than five seconds, and the reader's last word on it outranks
 * every automatic decision to *play*: scrolling away and back does not
 * restart what they paused. Nothing outranks leaving the screen, which
 * always pauses — a loop the reader started must not decode off screen for
 * the rest of the visit.
 *
 * Without script the frame shows the poster, linked to the file, rather than
 * an empty box with a button that does nothing.
 */
export function ShotVideo({
  video,
  figure,
  caption,
}: {
  video: VideoSlot;
  /** Figure number on this page, e.g. "03". */
  figure: string;
  caption: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const choice = useRef<"play" | "pause" | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Observe against whichever box scrolls: <main> on the desktop layout,
    // where the body is overflow-hidden, the viewport below it. Rooted on the
    // viewport at a desktop width, <main>'s clip hid the video until it was
    // on screen, so the poster's 800px head start did nothing there.
    const main = document.querySelector("main");
    const root = main && main.scrollHeight > main.clientHeight ? main : null;

    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.at(-1)?.isIntersecting) return;
        el.poster = video.poster;
        near.disconnect();
      },
      { root, rootMargin: "800px 0px" },
    );
    near.observe(el);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const update = () => {
      if (!inView) return el.pause();
      const wanted = choice.current === "play" || (choice.current === null && !still.matches && !savingData());
      if (wanted) el.play().catch(() => {});
      else el.pause();
    };

    // The newest entry: a batch holds every crossing since the last callback,
    // oldest first, so the first can say "on screen" for a video that has
    // already left it.
    const view = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        inView = entry.isIntersecting;
        update();
      },
      { root, threshold: 0.5 },
    );
    view.observe(el);
    still.addEventListener("change", update);

    return () => {
      near.disconnect();
      view.disconnect();
      still.removeEventListener("change", update);
    };
  }, [video.poster]);

  function toggle() {
    const el = ref.current;
    if (!el) return;
    choice.current = el.paused ? "play" : "pause";
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }

  return (
    <figure className="shot-reveal">
      <div className="shot-frame relative">
        <video
          ref={ref}
          width={video.width}
          height={video.height}
          aria-label={video.label}
          muted
          loop
          playsInline
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="block h-auto w-full"
        >
          <source src={video.src} type="video/mp4" />
        </video>
        <button
          type="button"
          onClick={toggle}
          // The name starts with the word on the button (Label in Name).
          aria-label={playing ? "Pause the recording" : "Play the recording"}
          className="chip over-media absolute bottom-3 right-3 inline-flex min-h-7 cursor-pointer items-center gap-2 px-2.5 py-1.5 font-mono text-3xs uppercase tracking-[0.08em]"
        >
          <svg aria-hidden="true" viewBox="0 0 10 10" className="size-2.5 shrink-0" fill="currentColor">
            {playing ? (
              <path d="M2 1h2v8H2zM6 1h2v8H6z" />
            ) : (
              <path d="M2.5 1v8l6.5-4z" />
            )}
          </svg>
          {playing ? "Pause" : "Play"}
        </button>
        {/* Last, so it covers the video and the button that need script. */}
        <noscript>
          <a href={video.src} aria-label={`${video.label} (MP4)`} className="absolute inset-0 block">
            {/* eslint-disable-next-line @next/next/no-img-element -- a noscript fallback: next/image needs script to choose a source */}
            <img
              src={video.poster}
              alt=""
              width={video.width}
              height={video.height}
              className="block h-full w-full object-cover"
            />
          </a>
        </noscript>
      </div>
      <ShotCaption figure={figure} caption={caption} source={video.source} linkSource />
    </figure>
  );
}
