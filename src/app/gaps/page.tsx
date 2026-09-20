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
    <DetailView eyebrow="Open gaps" title="What I would fix first" lede={LEDE}>
      {/* The table needs the full width of the panel, not the prose measure. */}
      <div className="w-[min(100%,62ch)]">
        <GapsTable rows={gaps} />
        <p className="mt-2 text-[0.92rem] italic">
          Both sites are my own studio&rsquo;s work. I am looking for a senior role
          on a team where the standards are shared rather than self-imposed.
        </p>
      </div>
    </DetailView>
  );
}
