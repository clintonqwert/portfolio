import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssertionTable } from "@/components/shared/data-table";
import { Chapter, type ChapterRef } from "@/components/shared/chapter";
import { ChapterBar } from "@/components/layout/chapter-bar";
import { Figures } from "@/components/case-study/figures";
import { JsonLd } from "@/components/shared/json-ld";
import { PageClose } from "@/components/layout/page-close";
import { PageHero, type Spec } from "@/components/layout/page-hero";
import {
  PassageChapters,
  chapterNumber,
  passageRefs,
} from "@/components/shared/passage-chapters";
import { Shot } from "@/components/shared/shot";
import { StackList } from "@/components/case-study/stack-list";
import { WORK_IMAGES } from "@/lib/content/assets";
import { getPagePosition } from "@/lib/content/navigation";
import { CONTACT, CONTACT_HREF, RESUME } from "@/lib/content/profile";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/content/work";
import { buildBreadcrumbJsonLd, buildCaseStudyJsonLd, buildMetadata } from "@/lib/seo";
import { readingMinutes } from "@/lib/utils";

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

/**
 * A case study, as a document rather than a panel of tiles.
 *
 * Hero, then the study's own passages in the order they were written, then
 * two chapters every study can fill from data it already has: the stack it
 * was built with (and, where there is one, the budget CI holds it to), and
 * the measured figures. A study without figures does not get an empty
 * Measured chapter — myGarage and Luxury tax end at the stack, honestly.
 */
export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  const path = `/work/${study.slug}`;
  const { page, prev, next } = await getPagePosition(path);

  const liveHref = study.liveUrl ? `https://${study.liveUrl}` : undefined;
  const repoHref = study.repoUrl ? `https://${study.repoUrl}` : undefined;

  // Only a real capture earns the hero's half of the width. A placeholder at
  // that size would be the largest thing on the page and say nothing.
  const image = WORK_IMAGES[study.slug];
  const shot = image && !image.isPlaceholder ? image : undefined;

  const prose = passageRefs(study.passages);
  const stack: ChapterRef = {
    id: "stack",
    number: chapterNumber(prose.length + 1),
    title: "Stack",
  };
  const measured: ChapterRef | undefined =
    study.stats.length > 0
      ? { id: "measured", number: chapterNumber(prose.length + 2), title: "Measured" }
      : undefined;
  const chapters = [...prose, stack, ...(measured ? [measured] : [])];

  const trail = [
    { label: "Overview", href: "/" },
    ...(page?.group ? [{ label: page.group.label, href: page.group.href }] : []),
    { label: study.name },
  ];

  const specs: Spec[] = [
    { label: "Period", value: study.period },
    { label: "Role", value: study.role },
    ...(study.liveUrl && liveHref ? [{ label: "Live", value: study.liveUrl, href: liveHref }] : []),
    ...(study.repoUrl && repoHref ? [{ label: "Source", value: study.repoUrl, href: repoHref }] : []),
    {
      label: "Reading",
      value: `${readingMinutes(study.passages.flatMap((p) => p.paragraphs))} min`,
    },
  ];

  // The figures are checked against the repository. The live site is offered
  // beside it only when there is a repository too: Tadvantage's are counted
  // from a private history, and pointing at a live dealer site under them
  // would imply the site proves numbers it cannot.
  const verify = repoHref
    ? [
        { label: study.repoUrl!, href: repoHref },
        ...(liveHref ? [{ label: study.liveUrl!, href: liveHref }] : []),
      ]
    : [];

  return (
    <>
      <JsonLd
        data={buildCaseStudyJsonLd({
          name: study.name,
          summary: study.summary,
          path,
        })}
      />
      <JsonLd data={buildBreadcrumbJsonLd(trail, path)} />

      <article>
        <ChapterBar index={page?.index} kicker={study.name} chapters={chapters} />

        <PageHero
          trail={trail}
          index={page?.index}
          kicker={study.name}
          title={study.headline}
          lede={study.summary}
          specs={specs}
          media={
            shot ? (
              <Shot
                image={shot}
                figure="01"
                sizes="(min-width: 1280px) 560px, (min-width: 1024px) calc(100vw - 332px), 100vw"
                hero
              />
            ) : undefined
          }
          next={chapters[0]!.id}
          cueLabel={`Scroll to the case study — ${chapters.length} chapters`}
        />

        <PassageChapters passages={study.passages} firstFigure={shot ? 2 : 1} />

        <Chapter
          id={stack.id}
          number={stack.number}
          title={stack.title}
          wide={
            study.assertions ? (
              <AssertionTable
                caption={study.assertions.caption}
                rows={study.assertions.rows}
              />
            ) : undefined
          }
        >
          <StackList items={study.stack} />
        </Chapter>

        {measured ? (
          <Chapter id={measured.id} number={measured.number} title={measured.title} tone="ink">
            <Figures stats={study.stats} verify={verify} note={study.note} />
          </Chapter>
        ) : null}

        <PageClose
          prev={prev}
          next={next}
          related={study.related}
          email={{ href: CONTACT_HREF.email, label: CONTACT.email }}
          resume={RESUME}
        />
      </article>
    </>
  );
}
