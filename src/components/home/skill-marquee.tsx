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
 */
export function SkillMarquee({ skills }: { skills: string[] }) {
  return (
    <section
      aria-label="Skills"
      className="marquee panel shrink-0 overflow-hidden"
    >
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
                className="relative flex shrink-0 items-center whitespace-nowrap pr-9 font-mono text-[0.72rem] text-muted after:absolute after:right-[18px] after:top-1/2 after:h-3 after:w-px after:-translate-y-1/2 after:bg-line after:content-['']"
              >
                {skill}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
