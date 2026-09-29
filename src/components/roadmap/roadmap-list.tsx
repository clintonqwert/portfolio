import { Fragment } from "react";

import { formatDay } from "@/lib/dates";
import type { RoadmapGroup } from "@/types/content";

const LINK =
  "py-2 underline decoration-1 underline-offset-[3px] hover:text-ink hover:decoration-2";

/**
 * One section per horizon. Lists rather than a table: the old gaps table
 * needed sideways scrolling on a phone, and an item is a title, a line and
 * its sources, which reads down a narrow screen without help. Each item's id
 * is its anchor, so a gap's "Closed by" link can land on it. The accessor
 * leaves out empty horizons, so every group here has items.
 */
export function RoadmapList({ groups }: { groups: RoadmapGroup[] }) {
  return (
    <div className="grid gap-12">
      {groups.map((group) => (
        <section key={group.horizon} aria-labelledby={`horizon-${group.horizon}`}>
          <h3 id={`horizon-${group.horizon}`} className="display-tight text-2xl text-ink">
            {group.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{group.meaning}</p>
          <ul className="mt-4 border-t border-rule">
            {group.items.map((item) => (
              <li
                key={item.id}
                id={item.id}
                className="scroll-mt-20 border-b border-line py-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-x-8"
              >
                <div className="min-w-0">
                  <p className="font-mono text-2xs text-faint">
                    {item.project}
                    {item.shippedOn ? ` · ${formatDay(item.shippedOn)}` : ""}
                  </p>
                  <h4 className="mt-1 text-lg leading-snug text-ink">{item.title}</h4>
                </div>
                <div className="min-w-0">
                  <p className="mt-2 text-base leading-relaxed text-muted md:mt-0">{item.detail}</p>
                  <p className="mt-1 text-sm text-muted">
                    {item.sources.map((source, i) => (
                      <Fragment key={source.href + source.label}>
                        {i > 0 ? " · " : null}
                        <a href={source.href} className={LINK}>
                          {source.label}
                        </a>
                      </Fragment>
                    ))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
