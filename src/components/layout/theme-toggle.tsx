"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

/**
 * Day / night toggle.
 *
 * The theme lives on <html data-theme>, set before paint by the inline script
 * in layout.tsx. That attribute is the source of truth, so this subscribes to
 * it with useSyncExternalStore rather than mirroring it into React state —
 * mirroring in an effect causes a cascading render, and would also drift if
 * anything else changed the attribute.
 *
 * The server snapshot is null: the server cannot know a stored preference, and
 * rendering a neutral label is more honest than guessing and hydrating wrong.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

const getServerSnapshot = (): null => null;

export function ThemeToggle({
  className,
  /** Drops the text label. For narrow chrome where the label would truncate. */
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Blocked storage: the theme still applies for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === null ? undefined : isDark}
      // The name starts with the word on screen ("Dark"/"Light"), so a
      // voice-control user can say what they see (WCAG 2.5.3, Label in
      // Name). "Switch to light mode" under a visible "Dark" was flagged by
      // Lighthouse on the mobile bar, the one place the word shows.
      aria-label={isDark ? "Dark theme — switch to light" : "Light theme — switch to dark"}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 font-mono text-3xs uppercase tracking-[0.08em] transition-colors duration-200 ${className ?? ""}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="size-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        {isDark ? (
          <path d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z" />
        ) : (
          <>
            <circle cx="8" cy="8" r="3.1" />
            <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1" />
          </>
        )}
      </svg>
      {/* Fixed width so the control does not resize when toggled; wide enough
          for "Light", which is the longer of the two labels. The icon-only
          variant still carries the state in aria-label and aria-pressed. */}
      {iconOnly ? null : (
        <span className="w-[3.1rem] text-left">{isDark ? "Dark" : "Light"}</span>
      )}
    </button>
  );
}
