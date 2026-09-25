import type { Metadata } from "next";

import { ChapterBar } from "@/components/layout/chapter-bar";
import { PageClose } from "@/components/layout/page-close";
import { PageHero } from "@/components/layout/page-hero";
import { PassageChapters, passageRefs } from "@/components/shared/passage-chapters";
import { PROJECT_OS_LEDE, PROJECT_OS_RAIL, getProjectOsPassages } from "@/lib/content/experience";
import { getPagePosition } from "@/lib/content/navigation";
import { CONTACT, CONTACT_HREF, RESUME } from "@/lib/content/profile";
import { buildMetadata } from "@/lib/seo";
import { readingMinutes } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "AI Engineering — Project OS, standards that outlive one repository",
  description: PROJECT_OS_LEDE,
  path: "/standard",
});

export default async function StandardPage() {
  const [passages, { page, prev, next }] = await Promise.all([
    getProjectOsPassages(),
    getPagePosition("/standard"),
  ]);
  const chapters = passageRefs(passages);

  return (
    <article>
      <ChapterBar index={page?.index} kicker="AI Engineering" chapters={chapters} />

      <PageHero
        trail={[{ label: "Overview", href: "/" }, { label: "AI Engineering" }]}
        index={page?.index}
        kicker="AI Engineering"
        title="Project OS: standards that outlive one repository"
        lede={PROJECT_OS_LEDE}
        specs={[
          { label: "Size", value: `${PROJECT_OS_RAIL.documents}, ${PROJECT_OS_RAIL.lines}` },
          { label: "Roles", value: PROJECT_OS_RAIL.roles },
          { label: "Status", value: "Self-authored · not employer-adopted" },
          {
            label: "Reading",
            value: `${readingMinutes(passages.flatMap((p) => p.paragraphs))} min`,
          },
        ]}
        next={chapters[0]!.id}
        cueLabel={`Scroll to the page — ${chapters.length} chapters`}
      />

      <PassageChapters passages={passages} refs={chapters} />

      <PageClose
        prev={prev}
        next={next}
        email={{ href: CONTACT_HREF.email, label: CONTACT.email }}
        resume={RESUME}
      />
    </article>
  );
}
