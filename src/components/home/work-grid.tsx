import Link from "next/link";

import type { CaseStudy } from "@/types/content";

/**
 * The work grid.
 *
 * The first study gets a wider panel and its full stat row; the second is
 * narrower with two figures. Deliberately not an identical card grid — equal
 * cards would claim the two builds are equivalent, and they are not: one carries
 * the enforced budget, the other is the reuse proof.
 */
export function WorkGrid({ studies }: { studies: CaseStudy[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {studies.map((study, i) => (
        <article
          key={study.slug}
          className={`panel rise flex flex-col p-6 sm:p-7 ${
            i === 0 ? "lg:col-span-3" : "lg:col-span-2"
          }`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="font-display text-[1.28rem] font-bold leading-tight tracking-[-0.018em] text-ink">
              <Link
                href={`/work/${study.slug}`}
                className="no-underline transition-colors duration-200 hover:text-accent"
              >
                {study.name}
              </Link>
            </h3>
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-faint">
              {study.period}
            </span>
          </div>

          <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-accent">
            {study.role}
          </p>

          <p className="mt-4 max-w-[52ch] text-[0.95rem] text-muted">
            {study.summary}
          </p>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-5">
            {study.stats.slice(0, i === 0 ? 3 : 2).map((stat) => (
              <div key={stat.label}>
                <dd className="font-mono text-[1.15rem] font-medium leading-none tabular-nums tracking-[-0.02em] text-ink">
                  {stat.value}
                </dd>
                <dt className="mt-2 font-mono text-[0.62rem] uppercase leading-tight tracking-[0.07em] text-faint">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 font-mono text-[0.7rem]">
            <Link
              href={`/work/${study.slug}`}
              className="text-accent underline decoration-1 underline-offset-4"
            >
              Case study →
            </Link>
            {study.liveUrl ? (
              <a
                href={`https://${study.liveUrl}`}
                className="text-faint no-underline transition-colors hover:text-accent"
              >
                {study.liveUrl}
              </a>
            ) : null}
            {study.repoUrl ? (
              <a
                href={`https://${study.repoUrl}`}
                className="text-faint no-underline transition-colors hover:text-accent"
              >
                Source
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
