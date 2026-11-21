"use client";

import { useEffect, useRef } from "react";

import { media } from "@/lib/design-tokens";

/**
 * Gives a work card's whole-page image its source on intent: a pointer over
 * the card, or keyboard focus on it, on a hover-capable screen; on a phone, as
 * the card comes within 300px of the viewport, since the scroll drives that
 * pan. Nothing is fetched at rest, under reduced motion, or while saving data.
 *
 * Renders nothing; it watches its parent element.
 */
export function PreviewLoader() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scope = ref.current?.parentElement;
    if (!scope) return;

    const canPan = window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)");
    // The phone pan (see .work-shot-frame): scroll-driven, below lg. The same
    // three conditions as the CSS that runs it — width, motion, support — so
    // no page is fetched that will not pan.
    const scrollPan = window.matchMedia(`${media.stacked} and (prefers-reduced-motion: no-preference)`);
    const timelines = CSS.supports("animation-timeline: view()");

    let detachPointer: (() => void) | undefined;
    let detachScroll: (() => void) | undefined;
    const sync = () => {
      detachPointer?.();
      detachScroll?.();
      detachPointer = canPan.matches ? onIntent(scope) : undefined;
      detachScroll = scrollPan.matches && timelines && !savingData() ? nearViewport(scope) : undefined;
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

  return <span ref={ref} hidden />;
}

/** Pointer or keyboard focus on a card loads its page. Returns the undo. */
function onIntent(scope: HTMLElement): () => void {
  const handle = (event: Event) => {
    const card = (event.target as Element | null)?.closest(".work-card");
    const img = card?.querySelector<HTMLImageElement>("img.work-shot-image[data-src]");
    if (img) load(img);
  };
  scope.addEventListener("pointerover", handle);
  scope.addEventListener("focusin", handle);
  return () => {
    scope.removeEventListener("pointerover", handle);
    scope.removeEventListener("focusin", handle);
  };
}

/** Phones: load each page as its card comes within 300px of the viewport. */
function nearViewport(scope: HTMLElement): () => void {
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
  scope.querySelectorAll<HTMLImageElement>("img.work-shot-image[data-src]").forEach((img) => {
    // The image itself is clipped by its window; its box still intersects.
    observer.observe(img);
  });
  return () => observer.disconnect();
}

function load(img: HTMLImageElement) {
  if (!img.dataset.src) return;
  // Shown once it has arrived (see .work-shot-image). Until then the window
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

function savingData(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData === true;
}
