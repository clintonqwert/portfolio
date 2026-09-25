import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * A detail view.
 *
 * Ordinary block prose, sized to its own content, with <main> taking the
 * scroll — the same way any article page works.
 *
 * This used to pin the panel to the viewport at >=1440px and flow the prose
 * into CSS columns to fill it without scrolling. That forced every short case
 * study — most of them — into a newspaper page of three-line columns sitting
 * above a third of a screen of blank panel, because multi-column balance
 * fills the height it is given whether or not there is enough prose to fill
 * it. A page that is only as tall as what is actually on it does not have
 * that problem, and reads as a normal page rather than a broadsheet.
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
    <div className="flex flex-col gap-2 p-2 lg:gap-3 lg:p-3">
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

      <div
        className={cn(
          "grid items-start gap-3",
          aside ? "wide:grid-cols-[minmax(0,1fr)_320px]" : "",
        )}
      >
        {raw ? (
          children
        ) : (
          // max-w caps the box itself, not just the text inside it — a tile
          // stretched to a 1fr track with 75ch of text pinned to its left
          // edge left the same kind of dead space the column-balance fix
          // just removed, just turned sideways instead of underneath.
          <div className="tile max-w-[75ch]">
            <div className="flow px-4 py-4 text-muted">{children}</div>
          </div>
        )}
        {aside ? <div className="tile">{aside}</div> : null}
      </div>
    </div>
  );
}
