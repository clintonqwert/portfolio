import Link from "next/link";

import { cn } from "@/lib/utils";
import type { PageLink } from "@/types/content";

/**
 * The end of a secondary page: where to go next, and how to get in touch.
 *
 * Next is the dominant move — the reader who got this far is the one worth
 * keeping — so it takes the full sheet in display type. Previous, related
 * reading and the way back to the deck sit beneath it at reading size, and the
 * last line is the two actions the whole site exists to earn: an email, and
 * the résumé.
 */
export function PageClose({
  prev,
  next,
  related,
  email,
  resume,
}: {
  prev?: PageLink;
  next?: PageLink;
  related?: { label: string; href: string }[];
  email: { href: string; label: string };
  resume: { href: string };
}) {
  return (
    <footer className="border-t border-rule">
      <div className="sheet py-16 lg:py-24">
        <nav aria-label="Keep reading">
          {next ? (
            <Link
              href={next.href}
              className="group rise block border border-line p-6 no-underline transition-[border-color] duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:border-rule focus-visible:border-rule sm:p-8 lg:p-10"
            >
              <span className="flex items-center gap-2.5 label text-faint">
                Next
                <span className="chip meta px-1.5 py-0.5 leading-none">{next.index}</span>
                {next.group ? <span>{next.group.label}</span> : null}
              </span>
              <span className="mt-5 flex items-end justify-between gap-6">
                <span className="min-w-0">
                  <span className="display block text-[clamp(2rem,5.5vw,4.5rem)] leading-[0.98] text-ink transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-quart)] group-hover:translate-x-1">
                    {next.label}
                  </span>
                  {next.summary ? (
                    <span className="mt-4 block max-w-[48ch] text-lg leading-snug text-muted">
                      {next.summary}
                    </span>
                  ) : null}
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 font-display text-[clamp(1.75rem,3.5vw,3rem)] leading-none text-ink transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-quart)] group-hover:translate-x-2"
                >
                  →
                </span>
              </span>
            </Link>
          ) : null}

          {/* Spaced from the next-page block above it — and only then: on the
              last page of the reading path there is none, and the margin
              was a gap above nothing. */}
          <div className={cn("grid gap-10 md:grid-cols-2", next ? "mt-10" : "")}>
            {prev ? (
              <div>
                <p className="label text-faint">Previous</p>
                <Link
                  href={prev.href}
                  className="group mt-3 flex items-baseline gap-3 py-1 text-ink no-underline"
                >
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] group-hover:-translate-x-1"
                  >
                    ←
                  </span>
                  <span className="meta text-faint">{prev.index}</span>
                  <span className="display-tight text-xl underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-[var(--duration-fast)] group-hover:decoration-current">
                    {prev.label}
                  </span>
                </Link>
              </div>
            ) : (
              <div />
            )}

            {related && related.length > 0 ? (
              <div>
                <p className="label text-faint">Read alongside</p>
                <ul className="mt-3 space-y-1">
                  {related.map((r) => (
                    <li key={r.href}>
                      <Link
                        href={r.href}
                        className="inline-block py-1 text-base leading-snug text-ink underline decoration-1 underline-offset-[3px] hover:decoration-2"
                      >
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-6">
          <Link href="/" className="group flex items-center gap-2 py-1 label text-ink no-underline">
            <span
              aria-hidden="true"
              className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] group-hover:-translate-x-1"
            >
              ←
            </span>
            All work
          </Link>
          <a
            href={email.href}
            className="py-1 font-mono text-xs text-muted underline decoration-1 underline-offset-[3px] hover:text-ink"
          >
            {email.label}
          </a>
          <a
            href={resume.href}
            download
            className="chip display ml-auto flex items-center gap-3 px-3 py-2 text-2xs uppercase tracking-[0.08em] no-underline transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:opacity-80"
          >
            Résumé
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
