"use client";

import { useEffect, useRef, useState } from "react";

import type { ChapterRef } from "@/components/shared/chapter";

/**
 * Where you are in a long page: the chapter you are reading, its number out of
 * the total, and a hairline that fills as the page is read.
 *
 * Desktop only. There the rail cannot list a page's chapters, and <main> is
 * the scroller, so a sticky bar at its top holds still. Below lg the site's own
 * sticky bar already occupies that edge, and a second one would stack on it.
 *
 * The progress line is CSS — a scroll timeline — so the only script is one
 * IntersectionObserver deciding which chapter crosses the reading line.
 */
export function ChapterBar({
  index,
  kicker,
  chapters,
}: {
  index?: string;
  kicker: string;
  chapters: ChapterRef[];
}) {
  const [current, setCurrent] = useState(-1);
  const inBand = useRef(new Set<string>());

  useEffect(() => {
    const band = inBand.current;
    const order = chapters.map((c) => c.id);
    const els = order
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    // A thin band a fifth of the way down the viewport: a chapter is current
    // once its top has risen into the reading area, not when it first peeks
    // in at the bottom. Chapters are contiguous, so exactly one crosses it —
    // except in the hero, where none do and the bar stays away.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) band.add(e.target.id);
          else band.delete(e.target.id);
        }
        const hit = order.findIndex((id) => band.has(id));
        setCurrent(hit);
      },
      { rootMargin: "-20% 0px -79% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      band.clear();
    };
  }, [chapters]);

  const chapter = current >= 0 ? chapters[current] : undefined;

  return (
    <div aria-hidden="true" className="sticky top-0 z-[var(--z-sticky)] hidden h-0 lg:block">
      <div className="chapterbar" data-visible={chapter ? "true" : "false"}>
        <div className="sheet flex h-11 items-center gap-4">
          <span className="flex min-w-0 items-center gap-2.5 label text-ink">
            {index ? (
              <span className="chip meta px-1.5 py-0.5 leading-none">{index}</span>
            ) : null}
            <span className="display truncate tracking-[0.08em]">{kicker}</span>
          </span>

          {chapter ? (
            <span className="ml-auto flex min-w-0 items-baseline gap-3">
              <span key={chapter.number} className="tick meta shrink-0 text-faint">
                {chapter.number} / {String(chapters.length).padStart(2, "0")}
              </span>
              <span key={chapter.id} className="tick truncate text-sm text-ink">
                {chapter.title}
              </span>
            </span>
          ) : null}

          {/* Not focusable: the bar is aria-hidden, so a tab stop inside it
              would land on nothing a screen reader could name. The rail,
              the breadcrumb and the page's own close already go everywhere
              this could. */}
          <a
            href="#top"
            tabIndex={-1}
            className="shrink-0 meta text-faint no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:text-ink"
          >
            Top ↑
          </a>
        </div>
        <div className="chapterbar-progress" />
      </div>
    </div>
  );
}
