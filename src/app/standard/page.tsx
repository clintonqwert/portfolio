import type { Metadata } from "next";

import { ChapterBar } from "@/components/layout/chapter-bar";
import { PageClose } from "@/components/layout/page-close";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/layout/page-hero";
import { PassageChapters, passageRefs } from "@/components/shared/passage-chapters";
import { PROJECT_OS_LEDE, PROJECT_OS_RAIL, getProjectOsPassages } from "@/lib/content/experience";
import { getPagePosition } from "@/lib/content/navigation";
import { CONTACT, CONTACT_HREF, RESUME } from "@/lib/content/profile";
import { buildBreadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { readingMinutes } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "How I use AI — Project OS, the rules my projects share",
  description: PROJECT_OS_LEDE,
  path: "/standard",
});

const TRAIL = [{ label: "Overview", href: "/" }, { label: "How I use AI" }];

export default async function StandardPage() {
  const [passages, { page, prev, next }] = await Promise.all([
    getProjectOsPassages(),
    getPagePosition("/standard"),
  ]);
  const chapters = passageRefs(passages);

  return (
    <article>
      <JsonLd data={buildBreadcrumbJsonLd(TRAIL, "/standard")} />
      <ChapterBar index={page?.index} kicker="How I use AI" chapters={chapters} />

      <PageHero
        trail={TRAIL}
        index={page?.index}
        kicker="How I use AI"
        title="Project OS: the rules my projects share"
        lede={PROJECT_OS_LEDE}
        specs={[
          { label: "Size", value: `${PROJECT_OS_RAIL.documents}, ${PROJECT_OS_RAIL.lines}` },
          { label: "Roles", value: PROJECT_OS_RAIL.roles },
          { label: "Status", value: "Written by me, not adopted by an employer" },
          { label: "Example", value: PROJECT_OS_RAIL.example.label, href: PROJECT_OS_RAIL.example.href },
          {
            label: "Reading",
            value: `${readingMinutes(passages.flatMap((p) => p.paragraphs))} min`,
          },
        ]}
        next={chapters[0]!.id}
        cueLabel={`Scroll to the page, ${chapters.length} chapters`}
      />

      <PassageChapters passages={passages} />

      <PageClose
        prev={prev}
        next={next}
        email={{ href: CONTACT_HREF.email, label: CONTACT.email }}
        resume={RESUME}
      />
    </article>
  );
}
