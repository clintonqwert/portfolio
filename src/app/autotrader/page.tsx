import type { Metadata } from "next";

import { ChapterBar } from "@/components/layout/chapter-bar";
import { PageClose } from "@/components/layout/page-close";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/layout/page-hero";
import { PassageChapters, passageRefs } from "@/components/shared/passage-chapters";
import { Shot } from "@/components/shared/shot";
import { AUTOSYNC_IMAGE } from "@/lib/content/assets";
import { AUTOTRADER_LEDE, AUTOTRADER_RAIL, getAutoTraderPassages } from "@/lib/content/experience";
import { getPagePosition } from "@/lib/content/navigation";
import { CONTACT, CONTACT_HREF, RESUME } from "@/lib/content/profile";
import { buildBreadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { readingMinutes } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "AutoTrader.ca — caching as a stability problem",
  description: AUTOTRADER_LEDE,
  path: "/autotrader",
});

const TRAIL = [{ label: "Overview", href: "/" }, { label: "AutoTrader.ca" }];

export default async function AutoTraderPage() {
  const [passages, { page, prev, next }] = await Promise.all([
    getAutoTraderPassages(),
    getPagePosition("/autotrader"),
  ]);
  const chapters = passageRefs(passages);

  return (
    <article>
      <JsonLd data={buildBreadcrumbJsonLd(TRAIL, "/autotrader")} />
      <ChapterBar index={page?.index} kicker={AUTOTRADER_RAIL.org} chapters={chapters} />

      <PageHero
        trail={TRAIL}
        index={page?.index}
        kicker={AUTOTRADER_RAIL.org}
        title="Caching as a stability problem, not a speed problem"
        lede={AUTOTRADER_LEDE}
        specs={[
          { label: "Role", value: "Senior Software Engineer, Full-Stack" },
          { label: "Period", value: AUTOTRADER_RAIL.period },
          { label: "Stack", value: AUTOTRADER_RAIL.stack.join(" · ") },
          {
            label: "Reading",
            value: `${readingMinutes(passages.flatMap((p) => p.paragraphs))} min`,
          },
        ]}
        media={
          <Shot
            image={AUTOSYNC_IMAGE}
            figure="01"
            sizes="(min-width: 1280px) 560px, (min-width: 1024px) calc(100vw - 332px), 100vw"
            hero
          />
        }
        next={chapters[0]!.id}
        cueLabel={`Scroll to the page — ${chapters.length} chapters`}
      />

      <PassageChapters passages={passages} firstFigure={2} />

      <PageClose
        prev={prev}
        next={next}
        email={{ href: CONTACT_HREF.email, label: CONTACT.email }}
        resume={RESUME}
      />
    </article>
  );
}
