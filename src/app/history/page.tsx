import type { Metadata } from "next";

import { Chapter, type ChapterRef } from "@/components/shared/chapter";
import { ChapterBar } from "@/components/layout/chapter-bar";
import { PageClose } from "@/components/layout/page-close";
import { PageHero } from "@/components/layout/page-hero";
import { StackGrid, TrackRecord } from "@/components/shared/track-record";
import { getPagePosition } from "@/lib/content/navigation";
import {
  HISTORY_LEDE,
  getPrinciples,
  getStackGroups,
  getTrackRecord,
} from "@/lib/content/practice";
import { CONTACT, CONTACT_HREF, RESUME } from "@/lib/content/profile";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "History — track record, tools and practice",
  description: HISTORY_LEDE,
  path: "/history",
});

/**
 * Three chapters, in the order the lede names them: the roles, the tools
 * they were built with, and the principles the work is held to. These were
 * three side-by-side panels that each scrolled inside themselves; as chapters
 * they are simply read down the page.
 */
export default async function HistoryPage() {
  const [roles, groups, principles, { page, prev, next }] = await Promise.all([
    getTrackRecord(),
    getStackGroups(),
    getPrinciples(),
    getPagePosition("/history"),
  ]);

  const chapters: ChapterRef[] = [
    { id: "track-record", number: "01", title: "Track record" },
    { id: "tools", number: "02", title: "Tools" },
    { id: "how-i-work", number: "03", title: "How I work" },
  ];
  const [record, tools, practice] = chapters as [ChapterRef, ChapterRef, ChapterRef];

  return (
    <article>
      <ChapterBar index={page?.index} kicker="History" chapters={chapters} />

      <PageHero
        trail={[{ label: "Overview", href: "/" }, { label: "History" }]}
        index={page?.index}
        kicker="History"
        title="Track record, tools and practice"
        lede={HISTORY_LEDE}
        specs={[
          { label: "Track record", value: `${roles.length} entries, 2016–present` },
          { label: "Tools", value: `${groups.length} groups` },
          { label: "Practice", value: `${principles.length} principles` },
        ]}
        next={record.id}
        cueLabel="Scroll to the track record — 3 chapters"
      />

      <Chapter {...record}>
        <TrackRecord roles={roles} />
      </Chapter>

      <Chapter {...tools}>
        <StackGrid groups={groups} />
      </Chapter>

      <Chapter {...practice}>
        {/* Not soft skills — six things the repositories are actually held
            to, which is the difference between a claim and a check. */}
        <ul className="grid border-t border-rule sm:grid-cols-2 sm:gap-x-10">
          {principles.map((principle, i) => (
            <li
              key={principle.title}
              className="rise border-b border-line py-5"
              style={{ "--i": i % 2 } as React.CSSProperties}
            >
              <h3 className="display-tight text-xl leading-snug text-ink">{principle.title}</h3>
              <p className="mt-1.5 text-base leading-relaxed text-muted">{principle.body}</p>
            </li>
          ))}
        </ul>
      </Chapter>

      <PageClose
        prev={prev}
        next={next}
        email={{ href: CONTACT_HREF.email, label: CONTACT.email }}
        resume={RESUME}
      />
    </article>
  );
}
