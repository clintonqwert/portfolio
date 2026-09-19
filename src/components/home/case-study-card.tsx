import Link from "next/link";

import type { CaseStudy } from "@/types/content";

/** Home-page entry point into a case study. */
export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <article className="border-t border-line pt-6">
      <div className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-faint">
        {study.period} · {study.role}
      </div>
      <h3 className="mt-2 font-display text-[1.3rem] font-bold leading-tight tracking-[-0.015em] text-ink">
        <Link
          href={`/work/${study.slug}`}
          className="underline-offset-4 hover:text-accent hover:underline"
        >
          {study.headline}
        </Link>
      </h3>
      <p className="mt-2 max-w-[60ch] text-muted">{study.summary}</p>
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        {study.stats.slice(0, 3).map((stat) => (
          <div key={stat.label}>
            <dd className="font-mono text-[1.1rem] font-medium tabular-nums text-ink">
              {stat.value}
            </dd>
            <dt className="font-mono text-[0.66rem] uppercase tracking-[0.08em] text-faint">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-mono text-[0.75rem]">
        <Link href={`/work/${study.slug}`} className="text-accent underline underline-offset-4">
          Read the case study →
        </Link>
      </p>
    </article>
  );
}
