"use client";

import { useEffect, useState } from "react";

import { media } from "@/lib/design-tokens";

/**
 * "There is more below", for a hero that fills its viewport and so reads as a
 * finished page: a thread with dots dropping down it (see .scroll-cue).
 *
 * A real link to the first chapter, so it is also the keyboard's way down. The
 * loop is CSS; this only decides when the cue has done its job: once the
 * reader has started scrolling — the layout's sentinel, the page's first
 * 64px, has left the viewport — and it comes back if they return to the top.
 * The sentinel was 64px into the hero until the landing page put a profile
 * above the hero on phones, where it took 400px of scrolling to leave.
 * IntersectionObserver rather than a scroll listener: no per-frame work, and
 * it follows whichever element is doing the scrolling (<main> at desktop, the
 * document below it).
 */
export function ScrollCue({ target, label }: { target: string; label: string }) {
  const [away, setAway] = useState(false);

  useEffect(() => {
    const el = document.getElementById("scroll-sentinel");
    if (!el) return;
    let observer: IntersectionObserver | undefined;
    const watch = () => {
      observer?.disconnect();
      // Where the page starts on the screen: under the sticky bar on a
      // phone, at the top at desktop. The root's top moves down by that
      // much, so the sentinel leaves after the same 64px of scrolling either
      // way rather than 64px plus the bar.
      const start = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY));
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry) setAway(!entry.isIntersecting);
        },
        { rootMargin: `-${start}px 0px 0px 0px` },
      );
      observer.observe(el);
    };
    watch();
    // Crossing lg moves where the page starts (the phone's bar comes or
    // goes), so a rotated tablet or a resized window measures it again; once
    // at mount kept a stale offset (review of #32, P2-2).
    const stacked = window.matchMedia(media.stacked);
    stacked.addEventListener("change", watch);
    return () => {
      stacked.removeEventListener("change", watch);
      observer?.disconnect();
    };
  }, []);

  return (
    <>
      {/* Last in the hero's flow and sticky to the screen's foot (see
          .scroll-cue-dock): on the first screen of every page, in the same
          place, however long the hero runs. Unstuck, it followed the content,
          and on a phone that put it below the fold.
          The entrance runs on this wrapper, not the link: an animation holding
          `transform` and `opacity` would stop the link's own fade-out transition. */}
      <div
        aria-hidden={away}
        className="scroll-cue-dock enter"
        style={{ "--i": 5 } as React.CSSProperties}
      >
        <a
          href={`#${target}`}
          aria-label={label}
          tabIndex={away ? -1 : undefined}
          data-away={away}
          onClick={(event) => {
            const el = document.getElementById(target);
            if (!el) return;
            event.preventDefault();
            const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            el.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
            history.replaceState(null, "", `#${target}`);
          }}
          className="scroll-cue no-underline"
        >
          <span className="scroll-cue-thread" aria-hidden="true">
            <span className="scroll-cue-dot" />
            <span className="scroll-cue-dot scroll-cue-drop" />
            <span
              className="scroll-cue-dot scroll-cue-drop"
              style={{ "--delay": "0.92s" } as React.CSSProperties}
            />
          </span>
          <span className="label pt-px leading-none text-ink">Scroll</span>
        </a>
      </div>
    </>
  );
}
