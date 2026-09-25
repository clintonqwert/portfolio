import type { Metadata } from "next";

import { GapsTable } from "@/components/shared/data-table";
import { PageClose } from "@/components/layout/page-close";
import { PageHero } from "@/components/layout/page-hero";
import { getPagePosition } from "@/lib/content/navigation";
import { getGaps } from "@/lib/content/practice";
import { CONTACT, CONTACT_HREF, RESUME } from "@/lib/content/profile";
import { buildMetadata } from "@/lib/seo";

const LEDE =
  "Written into the repositories with their consequences attached before any interviewer asked, because a gap you have named is a plan and a gap you have hidden is a liability.";

export const metadata: Metadata = buildMetadata({
  title: "Open gaps — what I would fix first",
  description: LEDE,
  path: "/gaps",
});

/**
 * One table, so one section and no chapter bar: numbering a single chapter
 * would be scaffolding, not structure. The table is shown whole at the full
 * width of the sheet — this is the page whose job is to show the weaknesses
 * in full, and it once clipped the entire Fix column into a 247px panel.
 */
export default async function GapsPage() {
  const [gaps, { page, prev }] = await Promise.all([getGaps(), getPagePosition("/gaps")]);

  return (
    <article>
      <PageHero
        trail={[{ label: "Overview", href: "/" }, { label: "Open gaps" }]}
        index={page?.index}
        kicker="Open gaps"
        title="What I would fix first"
        lede={LEDE}
        specs={[
          { label: "Open", value: String(gaps.length) },
          { label: "Each row", value: "Gap · consequence · planned fix" },
        ]}
        next="the-gaps"
        cueLabel="Scroll to the table"
      />

      <section id="the-gaps" aria-label="The gaps, in full" className="scroll-mt-14">
        <div className="sheet">
          <div className="rise border-t border-line py-[clamp(3rem,5.5vw,5.25rem)]">
            <GapsTable rows={gaps} />
            <p className="mt-8 max-w-[62ch] text-lg italic leading-relaxed text-muted">
              Both sites are my own studio&rsquo;s work. I am looking for a senior role
              on a team where the standards are shared rather than self-imposed.
            </p>
          </div>
        </div>
      </section>

      {/* Last on the reading path, so there is no next — the way back to the
          deck and the two ways to get in touch are what remain. */}
      <PageClose
        prev={prev}
        email={{ href: CONTACT_HREF.email, label: CONTACT.email }}
        resume={RESUME}
      />
    </article>
  );
}
