import type { Metadata } from "next";

import { DetailView } from "@/components/layout/detail-view";
import { StackGrid, TrackRecord } from "@/components/shared/track-record";
import { getPrinciples, getStackGroups, getTrackRecord } from "@/lib/content/practice";
import { buildMetadata } from "@/lib/seo";

const LEDE =
  "Roles before the studio year, the tools they were built with, and the principles the current work is held to.";

export const metadata: Metadata = buildMetadata({
  title: "History — track record, tools and practice",
  description: LEDE,
  path: "/history",
});

/**
 * Three panels rather than flowing prose: this route is block grids, and CSS
 * columns cannot paginate a grid — flowing it pushed the panel 1377px past its
 * own width. Side by side, each panel fits the viewport on its own.
 */
export default async function HistoryPage() {
  const [roles, groups, principles] = await Promise.all([
    getTrackRecord(),
    getStackGroups(),
    getPrinciples(),
  ]);

  return (
    <DetailView eyebrow="History" title="Track record, tools and practice" lede={LEDE} raw>
      {/* Track record takes more of the row than it used to: Tools and Practice
          both fit with room to spare while it overflowed by 132px, cutting the
          earliest role off mid-word. */}
      <div className="grid min-h-0 gap-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <section className="tile min-h-0 overflow-hidden">
          <h2 className="border-b border-line px-[12px] py-[8px] font-mono text-[0.64rem] uppercase tracking-[0.1em] text-accent">
            Track record
          </h2>
          {/* Scroll rather than clip: the width change alone is not a promise,
              and a truncated first job is worse than a scrollbar. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-[12px] py-[12px]">
            <TrackRecord roles={roles} />
          </div>
        </section>

        <section className="tile min-h-0 overflow-hidden">
          <h2 className="border-b border-line px-[12px] py-[8px] font-mono text-[0.64rem] uppercase tracking-[0.1em] text-accent">
            Tools
          </h2>
          <div className="min-h-0 flex-1 overflow-hidden px-[12px] py-[12px]">
            <StackGrid groups={groups} />
          </div>
        </section>

        <section className="tile min-h-0 overflow-hidden">
          <h2 className="border-b border-line px-[12px] py-[8px] font-mono text-[0.64rem] uppercase tracking-[0.1em] text-accent">
            Practice
          </h2>
          <ul className="min-h-0 flex-1 space-y-[12px] overflow-hidden px-[12px] py-[12px]">
            {principles.map((principle) => (
              <li key={principle.title}>
                <h3 className="font-display text-[0.88rem] font-semibold text-ink">
                  {principle.title}
                </h3>
                <p className="mt-[2px] text-[0.8rem] leading-snug text-muted">
                  {principle.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DetailView>
  );
}
