import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { AssertionTable } from "@/components/shared/data-table";
import { JsonLd } from "@/components/shared/json-ld";
import { Passages } from "@/components/shared/passages";
import { StatStrip } from "@/components/shared/stat-strip";
import { Label, Prose, Section, SectionHeading } from "@/components/ui/section";
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

  return (
    <>
      <JsonLd
        data={buildCaseStudyJsonLd({
          name: study.name,
          summary: study.summary,
          path: `/work/${study.slug}`,
        })}
      />

      <div className="px-6 pt-[clamp(2.5rem,5vw,4rem)] sm:px-10 lg:px-14">
        <div className="max-w-[1080px]">
          <nav aria-label="Breadcrumb">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent">
              <Link href="/#work" className="no-underline hover:underline">
                Work
              </Link>
              <span className="text-faint"> / {study.name}</span>
            </p>
          </nav>

          <SectionHeading
            as="h1"
            className="mt-5 max-w-[18ch] text-[clamp(2.1rem,4.6vw,3.2rem)] leading-[1.06] tracking-[-0.026em]"
          >
            {study.headline}
          </SectionHeading>

          <Prose className="mt-5 text-[1.05rem]">
            <p>{study.summary}</p>
          </Prose>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.74rem]">
            {study.liveUrl ? (
              <li>
                <a
                  className="text-accent underline decoration-1 underline-offset-[3px]"
                  href={`https://${study.liveUrl}`}
                >
                  {study.liveUrl}
                </a>
              </li>
            ) : null}
            {study.repoUrl ? (
              <li>
                <a
                  className="text-accent underline decoration-1 underline-offset-[3px]"
                  href={`https://${study.repoUrl}`}
                >
                  Source
                </a>
              </li>
            ) : null}
          </ul>

          <div className="mt-[clamp(2rem,4vw,3rem)]">
            <StatStrip stats={study.stats} />
          </div>
        </div>
      </div>

      <Section divider={false}>
        <div className="datagrid">
          <Label title={study.name}>
            {study.period}
            <br />
            {study.role}
            <br />
            <br />
            {study.stack.map((tech) => (
              <span key={tech} className="block">
                {tech}
              </span>
            ))}
          </Label>
          <Prose>
            <Passages passages={study.passages} />
          </Prose>
        </div>
      </Section>

      {study.assertions ? (
        <Section>
          <div className="datagrid">
            <Label title="Asserted">
              On every
              <br />
              pull request
            </Label>
            <div>
              <SectionHeading className="mb-1">The budget, in full</SectionHeading>
              <AssertionTable
                caption={study.assertions.caption}
                rows={study.assertions.rows}
              />
            </div>
          </div>
        </Section>
      ) : null}

      <Section>
        <div className="datagrid">
          <Label title="Next" />
          <p className="font-mono text-[0.78rem]">
            <Link href="/#gaps" className="text-accent underline underline-offset-4">
              What I would fix first →
            </Link>
          </p>
        </div>
      </Section>

      <SiteFooter />
    </>
  );
}
