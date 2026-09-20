import { SectionHeading } from "@/components/ui/section";
import type { Passage } from "@/types/content";

/**
  * Renders prose passages, each optionally introduced by a subheading.
  *
  * The subheading is h2: every route using this renders an h1 title above it,
  * and jumping straight to h3 skips a level — which Lighthouse flags and screen
  * reader users navigate by.
  */
export function Passages({ passages }: { passages: Passage[] }) {
  return (
    <>
      {passages.map((passage, i) => (
        <div key={passage.heading ?? i}>
          {passage.heading ? (
            <SectionHeading as="h2" className="mt-[21px] mb-[8px]">
              {passage.heading}
            </SectionHeading>
          ) : null}
          {passage.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="mb-[1.15rem] last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}
