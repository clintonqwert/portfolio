import type { Metadata } from "next";

import { DetailView } from "@/components/layout/detail-view";
import { PrincipleGrid } from "@/components/shared/principle-grid";
import { StackGrid, TrackRecord } from "@/components/shared/track-record";
import { SectionHeading } from "@/components/ui/section";
import { getPrinciples, getStackGroups, getTrackRecord } from "@/lib/content/practice";
import { buildMetadata } from "@/lib/seo";

const LEDE = "Roles before the studio year, the tools they were built with, and the principles the current work is held to.";

export const metadata: Metadata = buildMetadata({
  title: "History — track record, tools and practice",
  description: LEDE,
  path: "/history",
});

export default async function HistoryPage() {
  const [roles, groups, principles] = await Promise.all([
    getTrackRecord(),
    getStackGroups(),
    getPrinciples(),
  ]);

  return (
    <DetailView eyebrow="History" title="Track record, tools and practice" lede={LEDE}>
      <div className="w-full max-w-none">
        <TrackRecord roles={roles} />

        <SectionHeading className="mt-12">Tools</SectionHeading>
        <StackGrid groups={groups} />

        <SectionHeading className="mt-12">Practice</SectionHeading>
        <PrincipleGrid principles={principles} />
      </div>
    </DetailView>
  );
}
