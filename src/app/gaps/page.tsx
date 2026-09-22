import type { Metadata } from "next";

import { DetailView } from "@/components/layout/detail-view";
import { GapsTable } from "@/components/shared/data-table";
import { getGaps } from "@/lib/content/practice";
import { buildMetadata } from "@/lib/seo";

const LEDE =
  "Written into the repositories with their consequences attached before any interviewer asked, because a gap you have named is a plan and a gap you have hidden is a liability.";

export const metadata: Metadata = buildMetadata({
  title: "Open gaps — what I would fix first",
  description: LEDE,
  path: "/gaps",
});

export default async function GapsPage() {
  const gaps = await getGaps();

  return (
    // `raw`: this route is a table, and CSS columns cannot paginate one. Flowed,
    // the 640px table was clipped into a 247px column — the entire Fix column
    // was unreachable and every consequence was cut mid-sentence, on the page
    // whose whole job is to show the weaknesses in full.
    <DetailView eyebrow="Open gaps" title="What I would fix first" lede={LEDE} raw>
      <div className="tile min-h-0 overflow-auto px-[16px] py-[16px]">
        <GapsTable rows={gaps} />
        <p className="mt-[12px] max-w-[70ch] text-[0.92rem] italic text-muted">
          Both sites are my own studio&rsquo;s work. I am looking for a senior role
          on a team where the standards are shared rather than self-imposed.
        </p>
      </div>
    </DetailView>
  );
}
