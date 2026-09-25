import type { Stat } from "@/types/content";

/**
 * The measured figures, set as large as the argument needs them.
 *
 * Laid out as a ruled sheet — value, what it measures, the qualifier — rather
 * than the big-number-small-label decoration row PRODUCT.md rules out: every
 * cell carries its own detail, and the row under the grid says where to check
 * all of them. Rendered inside an ink chapter, so every line is `canvas`.
 *
 * Value size follows the cell, not the viewport (`cqi`): "205k → 96k" is ten
 * mono characters and has to fit a 160px cell at 1024 as well as a 300px one
 * at 1440, which no single viewport-based clamp managed both of.
 */
export function Figures({
  stats,
  verify,
  note,
}: {
  stats: Stat[];
  /** Where the figures can be checked — repository first, then the live site. */
  verify: { label: string; href: string }[];
  /** A caveat that belongs beside the numbers, not under a separate heading. */
  note?: string;
}) {
  return (
    <div>
      <dl className="grid grid-cols-2 border-t border-canvas">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="rise flex min-w-0 flex-col-reverse justify-end gap-3 border-b border-canvas/25 py-6 pr-4 [container-type:inline-size] odd:not-last:border-r odd:not-last:border-r-canvas/25 even:pl-5"
            style={{ "--i": i % 2 } as React.CSSProperties}
          >
            {/* Term before value in the markup, which is the order a screen
                reader wants; flex-col-reverse shows the value first without
                changing what is read. */}
            <dt>
              <span className="figure-label block">{stat.label}</span>
              {stat.detail ? (
                <span className="mt-1 block text-sm leading-snug">{stat.detail}</span>
              ) : null}
            </dt>
            <dd className="figure-value text-[clamp(1.5rem,15cqi,3.25rem)]">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {note ? (
        <p className="mt-6 max-w-[60ch] font-mono text-xs leading-relaxed">{note}</p>
      ) : null}

      {verify.length > 0 ? (
        <p className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2 meta">
          <span className="label">Check these against</span>
          {verify.map((v) => (
            <a
              key={v.href}
              href={v.href}
              className="py-1 text-xs underline decoration-1 underline-offset-[3px] hover:decoration-2"
            >
              {v.label}
              <span aria-hidden="true"> ↗</span>
            </a>
          ))}
        </p>
      ) : null}
    </div>
  );
}
