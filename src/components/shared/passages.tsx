import type { Passage } from "@/types/content";

/**
 * Renders prose passages, each optionally introduced by a subheading.
 *
 * The subheading is h2: every route using this renders an h1 title above it,
 * and jumping straight to h3 skips a level — which Lighthouse flags and which
 * screen reader users navigate by.
 *
 * It is also deliberately small. These sit inside a ~30ch column, where the
 * full section-heading scale runs to three lines and overwhelms the paragraphs
 * it is meant to introduce.
 */
export function Passages({ passages }: { passages: Passage[] }) {
  return (
    <>
      {passages.map((passage, i) => (
        // Spacing lives on the wrapper, not the heading: `first:` matches the
        // first child of a parent, and the heading is always that — which
        // silently removed the gap above every subhead, not just the first.
        <div key={passage.heading ?? i} className="mt-4 first:mt-0">
          {passage.heading ? (
            <h2 className="mb-2 font-display text-base font-semibold leading-snug tracking-[-0.008em] text-ink">
              {passage.heading}
            </h2>
          ) : null}
          {passage.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
          {passage.list ? (
            // A definition list, not a table: inside a ~30ch column a two-column
            // table cannot hold its shape, and this has to survive the flow.
            <dl className="mt-3 border-t border-line pt-2">
              {passage.list.map((row) => (
                <div key={row.term} className="mb-2 last:mb-0">
                  <dt className="font-mono text-2xs text-accent">{row.term}</dt>
                  <dd className="text-sm leading-snug text-muted">{row.detail}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {passage.diagram ? (
            // Chips, not a decorative graphic: the same ink-block the tile
            // counter and the résumé button use, so a sequence of real steps
            // looks like part of this design system rather than a dropped-in
            // illustration. break-inside-avoid keeps it from splitting across
            // the flow's columns, which would scatter the arrows.
            <div
              aria-label={passage.diagram.join(' → ')}
              className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2 border-t border-line pt-3"
              style={{ breakInside: 'avoid' }}
            >
              {passage.diagram.map((step, i) => (
                <span key={step} className="flex items-center gap-1.5">
                  <span className="chip meta px-2 py-1 leading-none">{step}</span>
                  {i < passage.diagram!.length - 1 ? (
                    <span aria-hidden="true" className="text-faint">
                      →
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </>
  );
}
