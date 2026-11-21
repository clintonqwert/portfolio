import Link from "next/link";

import { SkillMarquee } from "@/components/home/skill-marquee";
import { ScrollCue } from "@/components/layout/scroll-cue";
import type { ProofPoint } from "@/types/content";

/**
 * The landing's first screen: who this is, what they do, the proof, and the
 * two things a reader came to do — see the work, or take the résumé.
 *
 * Built from the secondary pages' hero parts (.hero, .sheet, the per-word
 * rise, .titleblock, the scroll cue) so the two read as one system. Sentence
 * case, unlike a secondary page's capitals (PRODUCT.md principle 3): this is
 * a statement to read, not a page's name.
 *
 * The accent appears twice here and nowhere else on the page: the primary
 * action and the one key figure (PRODUCT.md principle 5).
 */
export function LandingHero({
  headline,
  lede,
  proofLine,
  points,
  skills,
  resume,
  workId,
}: {
  headline: string;
  lede: string;
  proofLine: string;
  points: ProofPoint[];
  /** The stack, as the strip of marks that closes the first screen. */
  skills: string[];
  resume: { href: string; size: string };
  /** The section the primary action and the scroll cue lead to. */
  workId: string;
}) {
  return (
    <section id="top" aria-labelledby="page-title" className="hero">
      <div className="sheet flex flex-1 flex-col pb-6 pt-6 lg:pb-8 lg:pt-8">
        <div className="my-auto pt-10 lg:pt-12">
          {/* One span per word, so each can rise a beat after the last. The
              heading is named from the plain text, so assistive tech reads the
              sentence, not a list of words. */}
          <h1
            id="page-title"
            aria-label={headline}
            className="display-hero max-w-[18ch] text-[clamp(2.5rem,5.2vw,5rem)] leading-[1.02] text-ink"
          >
            {headline.split(" ").map((word, i, words) => (
              <span key={i}>
                <span
                  aria-hidden="true"
                  className="hero-word"
                  style={{ "--w": i } as React.CSSProperties}
                >
                  {word}
                </span>
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p
            className="enter mt-6 max-w-[52ch] text-lg leading-relaxed text-ink lg:text-xl lg:leading-relaxed"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            {lede}
          </p>
          <p
            className="enter mt-3 max-w-[64ch] text-base leading-relaxed text-muted"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            {proofLine}
          </p>

          <div
            className="enter mt-8 flex flex-wrap gap-3"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <a
              href={`#${workId}`}
              className="inline-flex items-center gap-2 bg-accent px-5 py-3 font-mono text-sm text-canvas no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:bg-ink"
            >
              View selected work
              <span aria-hidden="true">↓</span>
            </a>
            <a
              href={resume.href}
              download
              className="inline-flex items-center gap-2 border border-line px-5 py-3 font-mono text-sm text-ink no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:border-ink"
            >
              Download résumé
              <span className="text-faint">PDF, {resume.size}</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          {/* The proof strip: one claim per capability, each opening the page
              that owns the fact. */}
          <dl
            className="titleblock enter mt-12"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            {points.map((point) => (
              <div key={point.label}>
                <dt className="label text-faint">{point.label}</dt>
                <dd className="mt-2">
                  {point.href ? (
                    <Link
                      href={point.href}
                      className="group block text-sm leading-snug text-ink no-underline"
                    >
                      {point.figure ? (
                        <span className="figure-value block text-[2rem] text-accent">{point.figure}</span>
                      ) : null}
                      <span className="transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] group-hover:text-accent">
                        {point.figure ? " " : null}
                        {point.claim}
                      </span>
                      {point.note ? (
                        <span className="mt-1.5 block meta text-faint">{point.note}</span>
                      ) : null}
                    </Link>
                  ) : (
                    <span className="block text-sm leading-snug text-ink">{point.claim}</span>
                  )}
                  {/* A claim that rests on several things links each one. */}
                  {point.sources ? (
                    <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 meta">
                      {point.sources.map((source) => (
                        <li key={source.href}>
                          <a
                            href={source.href}
                            className="inline-block py-1 text-ink underline decoration-1 underline-offset-[3px] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:text-accent"
                          >
                            {source.label}
                            <span aria-hidden="true"> ↗</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>

          {/* The stack, under the proof: a reader scanning for their own
              stack's names finds them on the first screen, before the work.
              In the hero's flow, above the scroll cue. */}
          <div className="enter mt-8 border-y border-line" style={{ "--i": 5 } as React.CSSProperties}>
            <SkillMarquee skills={skills} />
          </div>
        </div>
        <ScrollCue target={workId} label="Scroll to the selected work" />
      </div>
    </section>
  );
}
