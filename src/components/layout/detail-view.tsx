import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * A detail view.
 *
 * The page never scrolls; the body panel does. That is what lets long-form
 * prose live inside a dashboard whose shell is fixed to one viewport. Below
 * 1024px the constraint is lifted and the page scrolls normally.
 */
export function DetailView({
  eyebrow,
  title,
  lede,
  meta,
  links,
  children,
  aside,
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
}) {
  return (
    <div className="flex flex-col gap-3 p-3 lg:h-full">
      <header className={cn("tile shrink-0 px-6 py-5", aside ? "" : "lg:max-w-[860px]")}>
        <p className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-accent">
          <Link href="/" className="no-underline hover:underline">
            Overview
          </Link>
          <span className="text-faint"> / {eyebrow}</span>
        </p>
        <h1 className="mt-3 max-w-[22ch] font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-[1.08] tracking-[-0.025em] text-ink">
          {title}
        </h1>
        {lede ? (
          <p className="mt-3 max-w-[62ch] text-[0.95rem] text-muted">{lede}</p>
        ) : null}

        {meta || links ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.68rem]">
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

      {/* Without an aside the panel would stretch the full workspace while the
          prose stays at its measure, leaving a conspicuous void to the right.
          Cap it instead so the panel ends where the content does. */}
      <div
        className={cn(
          "grid min-h-0 flex-1 gap-3",
          aside ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "lg:max-w-[860px]",
        )}
      >
        <div className="tile min-h-0">
          <div className="tile-scroll flex-1 px-6 py-6">
            <div className="max-w-[62ch] text-muted">{children}</div>
          </div>
        </div>
        {aside ? <div className="tile min-h-0">{aside}</div> : null}
      </div>
    </div>
  );
}
