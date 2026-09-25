import type { Metadata } from "next";

import { DetailView } from "@/components/layout/detail-view";
import { StackGrid, TrackRecord } from "@/components/shared/track-record";
import {
  HISTORY_LEDE,
  getPrinciples,
  getStackGroups,
  getTrackRecord,
} from "@/lib/content/practice";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "History — track record, tools and practice",
  description: HISTORY_LEDE,
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
    <DetailView eyebrow="History" title="Track record, tools and practice" lede={HISTORY_LEDE} raw>
      {/* Track record takes more of the row than it used to: Tools and Practice
          both fit with room to spare while it overflowed by 132px, cutting the
          earliest role off mid-word. */}
      <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <section className="tile min-h-0 overflow-hidden">
          <h2 className="border-b border-line px-4 py-2 label text-accent">
            Track record
          </h2>
          {/* Scroll rather than clip: the width change alone is not a promise,
              and a truncated first job is worse than a scrollbar. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <TrackRecord roles={roles} />
          </div>
        </section>

        <section className="tile min-h-0 overflow-hidden">
          <h2 className="border-b border-line px-4 py-2 label text-accent">
            Tools
          </h2>
          {/* Scrolls like Track Record beside it. The stack list grew when the
              Convertus material landed, and a reference list that silently
              drops its last group is worse than one you scroll. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <StackGrid groups={groups} />
          </div>
        </section>

        <section className="tile min-h-0 overflow-hidden">
          <h2 className="border-b border-line px-4 py-2 label text-accent">
            How I work
          </h2>
          <ul className="min-h-0 flex-1 space-y-3 overflow-hidden px-3 py-3">
            {/* Not soft skills — six things the repositories are actually
                held to, which is the difference between a claim and a check. */}
            {principles.map((principle) => (
              <li key={principle.title}>
                <h3 className="font-display text-md font-semibold text-ink">
                  {principle.title}
                </h3>
                <p className="mt-0.5 text-sm leading-snug text-muted">
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
