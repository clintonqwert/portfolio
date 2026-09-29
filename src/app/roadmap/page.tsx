import type { Metadata } from "next";

import { Chapter, type ChapterRef } from "@/components/shared/chapter";
import { ChapterBar } from "@/components/layout/chapter-bar";
import { PageClose } from "@/components/layout/page-close";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/layout/page-hero";
import { DirectionList } from "@/components/roadmap/direction-list";
import { GapsList } from "@/components/roadmap/gaps-list";
import { RoadmapList } from "@/components/roadmap/roadmap-list";
import { getPagePosition } from "@/lib/content/navigation";
import { CONTACT, CONTACT_HREF, RESUME } from "@/lib/content/profile";
import { ROADMAP_LEDE, getDirection, getGaps, getRoadmap } from "@/lib/content/roadmap";
import { buildBreadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Roadmap — shipped and next",
  description: ROADMAP_LEDE,
  path: "/roadmap",
});

const TRAIL = [{ label: "Overview", href: "/" }, { label: "Roadmap" }];

/**
 * Three chapters: where the studio is heading, the engineering items by
 * horizon, then the gaps, kept small, each linked to the item that closes it.
 * This page replaced /gaps on 2026-09-28; next.config.ts redirects the old URL.
 */
export default async function RoadmapPage() {
  const [stages, groups, gaps, { page, prev }] = await Promise.all([
    getDirection(),
    getRoadmap(),
    getGaps(),
    getPagePosition("/roadmap"),
  ]);

  const chapters: ChapterRef[] = [
    { id: "direction", number: "01", title: "Direction" },
    { id: "the-roadmap", number: "02", title: "Roadmap" },
    { id: "gaps", number: "03", title: "Gaps and improvements" },
  ];
  const [direction, roadmap, gapsChapter] = chapters as [ChapterRef, ChapterRef, ChapterRef];

  return (
    <article>
      <JsonLd data={buildBreadcrumbJsonLd(TRAIL, "/roadmap")} />
      <ChapterBar index={page?.index} kicker="Roadmap" chapters={chapters} />

      <PageHero
        trail={TRAIL}
        index={page?.index}
        kicker="Roadmap"
        title="Shipped and next"
        lede={ROADMAP_LEDE}
        specs={groups.map((g) => ({ label: g.title, value: String(g.items.length) }))}
        next={direction.id}
        cueLabel="Scroll to the direction, 3 chapters"
      />

      <Chapter {...direction}>
        <DirectionList stages={stages} />
      </Chapter>

      <Chapter {...roadmap}>
        <RoadmapList groups={groups} />
      </Chapter>

      <Chapter {...gapsChapter}>
        <GapsList gaps={gaps} />
        <p className="mt-8 max-w-[62ch] text-lg italic leading-relaxed text-muted">
          Both sites are my own studio&rsquo;s work. I am looking for a senior role on a team
          where the standards are shared rather than self-imposed.
        </p>
      </Chapter>

      {/* Last on the reading path, so there is no next. */}
      <PageClose
        prev={prev}
        email={{ href: CONTACT_HREF.email, label: CONTACT.email }}
        resume={RESUME}
      />
    </article>
  );
}
