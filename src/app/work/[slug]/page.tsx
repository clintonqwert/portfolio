import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssertionTable } from "@/components/shared/data-table";
import { JsonLd } from "@/components/shared/json-ld";
import { Passages } from "@/components/shared/passages";
import { StatStrip } from "@/components/shared/stat-strip";
import { Section, SectionHeading } from "@/components/ui/section";
import { Col, Rail, Spec } from "@/components/ui/spec";
import { Wrap } from "@/components/ui/wrap";
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

      <Wrap>
        <div className="pb-10 pt-12 sm:pt-16">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-accent">
            <Link href="/#work" className="underline-offset-4 hover:underline">
              Work
            </Link>{" "}
            / {study.name}
          </p>
          <h1 className="mt-4 max-w-[20ch] font-display text-[clamp(2rem,5vw,3.1rem)] font-bold leading-[1.05] tracking-[-0.025em] text-ink">
            {study.headline}
          </h1>
          <p className="mt-4 max-w-[62ch] text-muted">{study.summary}</p>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.78rem]">
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
        </div>
        <StatStrip stats={study.stats} />
      </Wrap>

      <Section divider={false}>
        <Spec>
          <Rail label={study.name}>
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
          </Rail>
          <Col>
            <Passages passages={study.passages} />
          </Col>
        </Spec>
      </Section>

      {study.assertions ? (
        <Section>
          <Spec>
            <Rail label="Asserted">On every
              <br />
              pull request
            </Rail>
            <Col wide>
              <SectionHeading className="mb-2">The budget, in full</SectionHeading>
              <AssertionTable
                caption={study.assertions.caption}
                rows={study.assertions.rows}
              />
            </Col>
          </Spec>
        </Section>
      ) : null}

      <Section>
        <Spec>
          <Rail label="Next" />
          <Col>
            <p className="font-mono text-[0.8rem]">
              <Link href="/#gaps" className="text-accent underline underline-offset-4">
                What I would fix first →
              </Link>
            </p>
          </Col>
        </Spec>
      </Section>
    </>
  );
}
