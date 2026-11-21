import { cn } from "@/lib/utils";
import { AVAILABILITY, CONTACT, CONTACT_HREF } from "@/lib/content/profile";

/**
 * The two parts of the profile a reader acts on — whether this person is open
 * to work, and how to check and reach them — shared by the desktop rail and
 * the phone profile card, so the two can never list different links.
 */

/** Availability, stated rather than buried. */
export function Availability({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-center gap-2 meta text-rail-muted", className)}>
      <span aria-hidden="true" className="size-[6px] shrink-0 rounded-full bg-pass" />
      {AVAILABILITY}
    </p>
  );
}

/** [href, full address, short label for the rail's grid]. */
const LINKS = [
  [CONTACT_HREF.email, CONTACT.email, "Email"],
  [CONTACT_HREF.github, CONTACT.github, "GitHub"],
  [CONTACT_HREF.linkedin, CONTACT.linkedin, "LinkedIn"],
  [CONTACT_HREF.studio, CONTACT.studio, CONTACT.studio],
] as const;

/**
 * The site's argument is that every claim is checkable, and these are how a
 * reader checks — they were once only in JSON-LD, which is to say invisible to
 * the human being asked to verify.
 *
 * `grid` is the rail's: short labels two to a row, which took the rail's
 * four full addresses (four rows) down to two and helped it fit a 768px
 * window without scrolling (2026-10-31). Each link's name starts with its
 * label and carries the full address (Label in Name), and hovering shows it.
 * `wrap` flows the full addresses across a phone's width.
 *
 * py-2 is a floor, not a rhythm choice, in both: it keeps each link above the
 * 24px WCAG 2.2 target-size minimum at this type size. A spacing sweep once
 * took it to py-1 — 23.3px — and only Lighthouse caught it.
 */
export function ContactLinks({ layout }: { layout: "grid" | "wrap" }) {
  const grid = layout === "grid";
  return (
    <ul
      className={cn(
        "font-mono text-3xs",
        grid ? "grid grid-cols-2 gap-x-3" : "flex flex-wrap gap-x-5",
      )}
    >
      {LINKS.map(([href, address, short]) => (
        <li key={href} className="min-w-0">
          <a
            href={href}
            aria-label={grid && short !== address ? `${short} ${address}` : undefined}
            title={grid ? address : undefined}
            className="block truncate py-2 text-rail-muted no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:text-accent"
          >
            {grid ? short : address}
          </a>
        </li>
      ))}
    </ul>
  );
}
