import { Wrap } from "@/components/ui/wrap";
import { CONTACT, CONTACT_HREF, LEDE, LOCATION, NAME } from "@/lib/content/profile";

const LINKS = [
  { href: CONTACT_HREF.email, label: CONTACT.email },
  { href: `tel:+17785124600`, label: "778-512-4600" },
  { href: CONTACT_HREF.linkedin, label: CONTACT.linkedin },
  { href: CONTACT_HREF.github, label: CONTACT.github },
  { href: CONTACT_HREF.studio, label: CONTACT.studio },
] as const;

export function Masthead() {
  return (
    <Wrap>
      <div className="pb-11 pt-16 sm:pt-[76px]">
        <p className="mb-6 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-accent">
          {LOCATION}
        </p>
        <h1 className="font-display text-[clamp(2.5rem,6.4vw,4.1rem)] font-bold leading-[1.02] tracking-[-0.028em] text-ink">
          {NAME.split(" ").slice(0, 2).join(" ")}
          <br />
          {NAME.split(" ").slice(2).join(" ")}
        </h1>
        <p className="mt-[1.1rem] max-w-[46ch] font-display text-[clamp(1rem,2vw,1.22rem)] font-semibold tracking-[-0.01em] text-muted">
          {LEDE}
        </p>
        <ul className="mt-[1.6rem] flex flex-wrap gap-x-[26px] gap-y-[10px] font-mono text-[0.82rem]">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                className="text-accent underline decoration-1 underline-offset-[3px]"
                href={link.href}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Wrap>
  );
}
