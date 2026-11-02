/**
 * The landing's last screen: what the reader needs to start a conversation.
 * Lives inside the page's one ink chapter, so every line is canvas on ink,
 * a pair the contrast gate checks in both themes. The accent stays out of
 * it: its three uses are elsewhere (PRODUCT.md principle 5).
 */
export function ContactBlock({
  availability,
  facts,
  email,
  resume,
  links,
}: {
  availability: string;
  /** Location, arrangement and work authorisation, in that order. */
  facts: readonly string[];
  email: { href: string; label: string };
  resume: { href: string; size: string };
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="max-w-[40ch] text-xl leading-snug text-canvas lg:text-2xl">{availability}.</p>
      <ul className="mt-4 space-y-1 font-mono text-sm text-canvas">
        {facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={email.href}
          className="inline-flex items-center gap-2 bg-canvas px-5 py-3 font-mono text-sm text-ink no-underline transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:opacity-85"
        >
          {email.label}
        </a>
        <a
          href={resume.href}
          download
          className="inline-flex items-center gap-2 border border-canvas px-5 py-3 font-mono text-sm text-canvas no-underline transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:opacity-85"
        >
          Download résumé
          <span aria-hidden="true">↓</span>
        </a>
      </div>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-block py-1 text-canvas underline decoration-1 underline-offset-[3px] hover:decoration-2"
            >
              {link.label}
              <span aria-hidden="true"> ↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
