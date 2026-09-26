"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "There is more below", for a hero that fills its viewport and so reads as a
 * finished page: a thread with dots dropping down it (see .scroll-cue).
 *
 * A real link to the first chapter, so it is also the keyboard's way down. The
 * loop is CSS; this only decides when the cue has done its job: once the
 * reader has started scrolling — a sentinel 64px into the hero has left the
 * viewport — and it comes back if they return to the top. IntersectionObserver
 * rather than a scroll listener: no per-frame work, and it follows whichever
 * element is doing the scrolling (<main> at desktop, the document below it).
 */
export function ScrollCue({ target, label }: { target: string; label: string }) {
  const [away, setAway] = useState(false);
  const sentinel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setAway(!entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span
        ref={sentinel}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-16 h-px w-px"
      />
      {/* The entrance runs on this wrapper, not the link: an animation holding
          `transform` and `opacity` would stop the link's own fade-out transition. */}
      <div
        aria-hidden={away}
        className="sheet enter pointer-events-none absolute inset-x-0 top-0"
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
          className="scroll-cue pointer-events-auto no-underline"
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
