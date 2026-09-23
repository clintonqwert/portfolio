import { LOGOS } from "@/lib/logos";

/**
 * Stable element id for a mark.
 *
 * Namespaced because these ids are document-global: a second SkillMarquee on
 * one page would duplicate every one of them and <use> would silently resolve
 * to whichever came first.
 */
const symbolId = (skill: string) =>
  "skill-logo-" + skill.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * Skills marquee.
 *
 * The track is rendered twice and translated by exactly -50%, which is what
 * makes the loop seamless; the duplicate is aria-hidden so a screen reader
 * hears the list once. Motion pauses on hover and on focus-within, so a
 * keyboard user can stop it to read.
 *
 * Under prefers-reduced-motion the animation is removed entirely and the strip
 * becomes an ordinary horizontal scroller — the content stays reachable rather
 * than disappearing with the motion.
 *
 * Marks are defined once in a sprite and referenced with <use>. Inlining each
 * path would ship it twice because the track is duplicated — 54kB of path data
 * in the document for a decorative strip. This way the paths cost 27kB once and
 * every reference after that is a few dozen bytes.
 *
 * Not every skill has a mark, and that is deliberate: Amazon and OpenAI both
 * restrict redistribution of theirs, so those render as their label alone. The
 * row is built so a missing mark reads as intentional rather than broken — the
 * label is the constant and the mark is the addition.
 */
export function SkillMarquee({ skills }: { skills: string[] }) {
  const marks = skills.filter((skill) => LOGOS[skill]);

  return (
    <section aria-label="Skills" className="marquee panel shrink-0 overflow-hidden">
      {/* The sprite. aria-hidden and zero-sized: it is a definition, not content. */}
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          {marks.map((skill) => (
            <symbol key={skill} id={symbolId(skill)} viewBox="0 0 24 24">
              <path d={LOGOS[skill]} />
            </symbol>
          ))}
        </defs>
      </svg>

      <div className="marquee-track flex w-max items-center">
        {[false, true].map((isClone) => (
          <ul
            key={String(isClone)}
            aria-hidden={isClone || undefined}
            className="flex w-max items-center"
          >
            {skills.map((skill) => (
              <li
                key={skill}
                className="relative flex shrink-0 items-center gap-[8px] whitespace-nowrap pr-[28px] after:absolute after:right-[14px] after:top-1/2 after:h-[14px] after:w-px after:-translate-y-1/2 after:bg-line after:content-['']"
              >
                {LOGOS[skill] ? (
                  <svg
                    aria-hidden="true"
                    className="size-[17px] shrink-0 fill-current text-ink"
                    viewBox="0 0 24 24"
                  >
                    <use href={`#${symbolId(skill)}`} />
                  </svg>
                ) : null}
                <span className="font-mono text-[0.74rem] text-muted">{skill}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
