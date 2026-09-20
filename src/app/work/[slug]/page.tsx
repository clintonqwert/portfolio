import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailView } from "@/components/layout/detail-view";
import { AssertionTable } from "@/components/shared/data-table";
import { JsonLd } from "@/components/shared/json-ld";
import { Passages } from "@/components/shared/passages";
import { Figure } from "@/components/home/tile";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/content/work";
import { buildCaseStudyJsonLd, buildMetadata } from "@/lib/seo";

/** Every case study is known at build time, so every route prerenders. */
export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};

  return buildMetadata({
    title: `${study.name} — ${study.headline}`,
    description: study.summary,
    path: `/work/${study.slug}`,
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  const links = [
    study.liveUrl ? { href: `https://${study.liveUrl}`, label: study.liveUrl } : null,
    study.repoUrl ? { href: `https://${study.repoUrl}`, label: "Source" } : null,
  ].filter((l): l is { href: string; label: string } => l !== null);

  return (
    <>
      <JsonLd
        data={buildCaseStudyJsonLd({
          name: study.name,
          summary: study.summary,
          path: `/work/${study.slug}`,
        })}
      />

      <DetailView
        eyebrow={study.name}
        title={study.headline}
        lede={study.summary}
        meta={[
          { label: "Period", value: study.period },
          { label: "Role", value: study.role },
        ]}
        links={links}
        aside={
          <div className="tile-scroll flex-1 p-5">
            <p className="font-mono text-[0.64rem] uppercase tracking-[0.1em] text-accent">
              Measured
            </p>
            <div className="mt-4 space-y-5">
              {study.stats.map((stat) => (
                <Figure key={stat.label} stat={stat} size="sm" />
              ))}
            </div>

            <p className="mt-7 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-accent">
              Stack
            </p>
            <ul className="mt-3 space-y-1 font-mono text-[0.72rem] text-muted">
              {study.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>

            {study.assertions ? (
              <>
                <p className="mt-7 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-accent">
                  Asserted on every PR
                </p>
                <dl className="mt-3 space-y-1.5 font-mono text-[0.68rem]">
                  {study.assertions.rows.map((row) => (
                    <div key={row.name} className="flex justify-between gap-3">
                      <dt className="min-w-0 truncate text-muted">{row.name}</dt>
                      <dd className={row.measured ? "text-signal" : "text-pass"}>
                        {row.threshold}
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}
          </div>
        }
      >
        <Passages passages={study.passages} />

        {study.assertions ? (
          <div className="mt-8">
            <AssertionTable
              caption={study.assertions.caption}
              rows={study.assertions.rows}
            />
          </div>
        ) : null}
      </DetailView>
    </>
  );
}
