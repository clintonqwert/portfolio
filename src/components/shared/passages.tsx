import { SectionHeading } from "@/components/ui/section";
import type { Passage } from "@/types/content";

/** Renders prose passages, each optionally introduced by a subheading. */
export function Passages({ passages }: { passages: Passage[] }) {
  return (
    <>
      {passages.map((passage, i) => (
        <div key={passage.heading ?? i}>
          {passage.heading ? (
            <SectionHeading as="h3" className="mt-8 mb-2">
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
