"use client";

import { useEffect, useRef, useState } from "react";

import { ShotCaption } from "@/components/shared/shot-caption";
import { reducingMotion, savingData } from "@/lib/reader-preferences";
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
 * video; the button still plays it.
 *
 * The button is the pause WCAG 2.2.2 asks of anything that moves on its own
 * for more than five seconds. Once a reader has used it, their choice holds:
 * scrolling away and back does not restart what they paused.
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
  const chosen = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // The poster too waits until the figure is near: set in the markup, it
    // was fetched with the page and competed with the hero image, the
    // largest paint — mobile LCP on /work/riflessi went from 2.9s to 3.3s.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.poster = video.poster;
        near.disconnect();
      },
      { rootMargin: "800px 0px" },
    );
    near.observe(el);
    if (reducingMotion() || savingData()) return () => near.disconnect();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (chosen.current || !entry) return;
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      near.disconnect();
      observer.disconnect();
    };
  }, [video.poster]);

  function toggle() {
    const el = ref.current;
    if (!el) return;
    chosen.current = true;
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
          className="chip absolute bottom-3 right-3 inline-flex min-h-7 cursor-pointer items-center gap-2 px-2.5 py-1.5 font-mono text-3xs uppercase tracking-[0.08em]"
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
      </div>
      <ShotCaption figure={figure} caption={caption} source={video.source} linkSource />
    </figure>
  );
}
