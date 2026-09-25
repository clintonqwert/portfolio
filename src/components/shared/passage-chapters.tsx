import { Chapter, type ChapterRef } from "@/components/shared/chapter";
import { Shot } from "@/components/shared/shot";
import { slugify } from "@/lib/utils";
import type { Passage } from "@/types/content";

/**
 * Prose passages, one chapter each, in the order they were written.
 *
 * The order is the author's argument — context, then the hard part, then what
 * would change — so it is kept rather than re-sorted into a template's
 * sections, and a page never grows a "Challenge" heading its content does not
 * have. A passage with no heading of its own is the framing that opens the
 * study, and is labelled as such.
 *
 * No paragraph is set as a larger lead. The first one usually restates the
 * summary the hero has just shown, and enlarging a repeat makes the repeat
 * the loudest thing on the page.
 */
export function PassageChapters({
  passages,
  start = 1,
  firstFigure = 1,
}: {
  passages: Passage[];
  /** Number of the first chapter. */
  start?: number;
  /** Number of the first figure in these chapters — 2 when the hero shows Fig. 01. */
  firstFigure?: number;
}) {
  // Derived here from the same pure function the page calls for its chapter
  // bar, rather than passed in beside `passages`: two parallel arrays could
  // drift out of step, and one input cannot.
  const refs = passageRefs(passages, start);

  // Figures are numbered in reading order across the page, not per chapter.
  let figureNumber = firstFigure;
  const figureNumbers = passages.map((p) => (p.figure ? figureNumber++ : 0));

  return (
    <>
      {passages.map((passage, i) => {
        const ref = refs[i]!;
        return (
          <Chapter
            key={ref.id}
            id={ref.id}
            number={ref.number}
            title={ref.title}
            wide={passage.diagram ? <FlowDiagram steps={passage.diagram} /> : undefined}
          >
            <div className="flow text-muted">
              {passage.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
              {passage.list ? <TermList rows={passage.list} /> : null}
            </div>
            {passage.figure ? (
              <div className="mt-10">
                <Shot
                  image={passage.figure.image}
                  figure={chapterNumber(figureNumbers[i]!)}
                  caption={passage.figure.caption}
                  // The prose column: ~700px at 1440, the full width below lg.
                  sizes="(min-width: 1024px) min(58vw, 740px), 100vw"
                />
              </div>
            ) : null}
          </Chapter>
        );
      })}
    </>
  );
}

/** The heading a passage is shown under. */
function passageTitle(passage: Passage): string {
  return passage.heading ?? "Overview";
}

/** Two-digit chapter number: 1 → "01". */
export function chapterNumber(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Ids the page shell already uses: <main>, the hero and its heading, the
 * chapters every case study appends, and the gaps table. A passage chapter
 * never takes one of these, whatever its heading slugifies to.
 */
const SHELL_IDS = ["main", "top", "page-title", "stack", "measured", "the-gaps"];

/**
 * Id, number and title for each passage's chapter, numbered from `start`.
 *
 * Ids come from the heading, so a chapter can be linked to by name — and are
 * unique on the page by construction. A second heading-less passage (two
 * "overview"s) or a passage titled "Stack" once would have produced a
 * duplicate id, and the scroll cue, the chapter bar and every deep link would
 * quietly have targeted the first match. Repeats get a numeric suffix instead.
 */
export function passageRefs(passages: Passage[], start = 1): ChapterRef[] {
  const taken = new Set(SHELL_IDS);
  return passages.map((passage, i) => {
    const title = passageTitle(passage);
    const base = slugify(title) || "chapter";
    let id = base;
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
    taken.add(id);
    return { id, number: chapterNumber(start + i), title };
  });
}

/**
 * A structural list — roles and their permissions, omissions and their
 * reasons — as a ruled two-column table rather than bullets, because the
 * shape is term and consequence and a reader skims it that way.
 */
function TermList({ rows }: { rows: NonNullable<Passage["list"]> }) {
  return (
    <dl className="!mt-8 border-t border-rule">
      {rows.map((row, i) => (
        <div
          key={row.term}
          className="rise grid gap-x-6 gap-y-0.5 border-b border-line py-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]"
          style={{ "--i": i } as React.CSSProperties}
        >
          <dt className="font-mono text-sm text-ink">{row.term}</dt>
          <dd className="text-base leading-snug text-muted">{row.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A mechanism that really is a sequence, drawn as one. Only passages that carry
 * a `diagram` get this — see the Passage type for why that is rationed.
 */
function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    // An ordered list is already the accessible form of a sequence; the
    // boxes and arrows are how it looks, not a second thing to announce.
    <div className="border-t border-line pt-8">
      <ol className="flowchart text-ink">
        {steps.map((step, i) => (
          <li
            key={step}
            className="rise text-base font-medium leading-snug"
            style={{ "--i": i } as React.CSSProperties}
          >
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
