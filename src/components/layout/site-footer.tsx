import { CONTACT, CONTACT_HREF, RESUME } from "@/lib/content/profile";

const LINKS = [
  { href: CONTACT_HREF.email, label: CONTACT.email },
  { href: CONTACT_HREF.linkedin, label: CONTACT.linkedin },
  { href: CONTACT_HREF.github, label: CONTACT.github },
  { href: CONTACT_HREF.studio, label: CONTACT.studio },
] as const;

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-rule px-6 py-16 sm:px-10 lg:px-14">
      <div className="datagrid max-w-[1080px]">
        <div className="pt-1 font-mono text-[0.68rem] uppercase leading-[1.7] tracking-[0.1em] text-faint">
          <b className="block font-medium text-accent">Contact</b>
          Vancouver, BC
        </div>
        <div className="max-w-[62ch]">
          <p className="text-muted">
            Open to senior and staff full-stack roles. The fastest way to judge
            the work is to open{" "}
            <a className="text-accent underline decoration-1 underline-offset-[3px]" href={CONTACT_HREF.studio}>
              {CONTACT.studio}
            </a>{" "}
            with the network tab open, and then ask me about anything in the open
            gaps.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={RESUME.href}
              download
              className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-canvas no-underline transition-colors duration-200 hover:bg-accent"
            >
              Download résumé
              <span aria-hidden="true">↓</span>
            </a>
            <span className="font-mono text-[0.68rem] text-faint">
              PDF · {RESUME.pages} pages · {RESUME.size}
            </span>
          </div>

          <ul className="mt-8 flex flex-col gap-1 font-mono text-[0.8rem]">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a className="text-accent underline decoration-1 underline-offset-[3px]" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
