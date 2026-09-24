import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * A detail view.
 *
 * Long-form prose lives inside a dashboard shell fixed to one viewport by
 * flowing into CSS columns rather than scrolling.
 *
 * The height is pinned only at 1440px and up. A multi-column box overflows in
 * the *inline* direction when its height is constrained — so below that width
 * the longest case study did not reflow, it ran 722px off the side of the page
 * where nothing could reach it. With the height left auto, the columns balance
 * and grow downwards instead, and <main> scrolls.
 */
export function DetailView({
  eyebrow,
  title,
  lede,
  meta,
  links,
  children,
  aside,
  /**
   * Skip the prose column-flow and let the route lay out its own panels. For
   * content that is block grids rather than paragraphs — CSS columns cannot
   * paginate a grid, so flowing it just pushes the panel sideways.
   */
  raw = false,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Mono key/value pairs shown under the title. */
  meta?: { label: string; value: string }[];
  links?: { href: string; label: string }[];
  children: React.ReactNode;
  /** Optional right-hand column, e.g. a figures panel. */
  aside?: React.ReactNode;
  raw?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 p-2 wide:h-full">
      <header className="tile shrink-0 px-4 py-3">
        <p className="label tracking-[0.12em] text-accent">
          <Link href="/" className="no-underline hover:underline">
            Overview
          </Link>
          <span className="text-faint"> / {eyebrow}</span>
        </p>
        <h1 className="mt-2 max-w-[24ch] font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-[1.08] tracking-[-0.025em] text-ink">
          {title}
        </h1>
        {lede ? (
          <p className="mt-2 max-w-[70ch] text-base leading-snug text-muted">{lede}</p>
        ) : null}

        {meta || links ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-2xs">
            {meta?.map((m) => (
              <span key={m.label} className="text-faint">
                <span className="uppercase tracking-[0.08em]">{m.label}</span>{" "}
                <span className="text-muted">{m.value}</span>
              </span>
            ))}
            {links?.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-accent underline decoration-1 underline-offset-[3px]"
              >
                {l.label}
              </a>
            ))}
          </div>
        ) : null}
      </header>

      {/* No width cap: the prose flows into columns, so a wider panel simply
          fits more of them. The old cap was from when this was one measured
          column — keeping it limited /work/tadvantage to three columns when the
          workspace had room for nearly five, and the content spilled. */}
      <div
        className={cn(
          "grid min-h-0 flex-1 gap-2",
          aside ? "wide:grid-cols-[minmax(0,1fr)_320px]" : "",
        )}
      >
        {raw ? (
          children
        ) : (
          <div className="tile min-h-0">
            {/* Columns, not scroll: the prose fills the panel across rather
                than running past its bottom edge. */}
            <div className="flow flex-1 px-4 py-4 text-muted">
              {children}
            </div>
          </div>
        )}
        {aside ? <div className="tile min-h-0">{aside}</div> : null}
      </div>
    </div>
  );
}
