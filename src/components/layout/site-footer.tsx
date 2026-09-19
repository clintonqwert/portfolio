import { Rail, Spec } from "@/components/ui/spec";
import { Wrap } from "@/components/ui/wrap";
import { CONTACT, CONTACT_HREF } from "@/lib/content/profile";

const LINKS = [
  { href: CONTACT_HREF.email, label: CONTACT.email },
  { href: CONTACT_HREF.linkedin, label: CONTACT.linkedin },
  { href: CONTACT_HREF.github, label: CONTACT.github },
  { href: CONTACT_HREF.studio, label: CONTACT.studio },
] as const;

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-rule py-14 sm:py-[72px]">
      <Wrap>
        <Spec>
          <Rail label="Contact">Vancouver, BC</Rail>
          <div className="max-w-[min(64ch,100%)]">
            <p className="mb-6 text-muted">
              Open to senior and staff full-stack roles. The fastest way to judge
              the work is to open{" "}
              <a
                className="text-accent underline decoration-1 underline-offset-[3px]"
                href={CONTACT_HREF.studio}
              >
                {CONTACT.studio}
              </a>{" "}
              with the network tab open, and then ask me about anything in the
              gaps table.
            </p>
            <ul className="flex flex-col gap-1 font-mono text-[0.82rem]">
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
        </Spec>
      </Wrap>
    </footer>
  );
}
