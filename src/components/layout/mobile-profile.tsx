import Image from "next/image";

import { Availability, ContactLinks } from "@/components/layout/profile-details";
import { LOCATION, NAME, PORTRAIT, ROLE_TITLE } from "@/lib/content/profile";

/**
 * The rail's profile, for a phone.
 *
 * Below lg the rail gives way to a slim bar — name, theme, résumé — so the
 * portrait, role, location, availability and every contact link beyond email
 * simply did not exist on a phone: a recruiter on mobile could not reach
 * LinkedIn or GitHub at all. This puts them back at the top of the overview
 * as a card: the portrait beside the name, the way a business card is laid
 * out, then whether this person is open to work and how to check and reach
 * them. It shares its parts with the rail (profile-details), so the two can
 * never list different links.
 *
 * The overview only. On a case study the reader has already chosen to read;
 * the bar and the page's own close carry the name, résumé and email there.
 */
export function MobileProfile() {
  return (
    <section aria-label="Profile" className="px-3 pt-3 lg:hidden">
      <div className="border-b border-line px-4 pb-4 pt-2">
        <div className="flex items-start gap-4">
          <Image
            src={PORTRAIT.src}
            alt={PORTRAIT.alt}
            width={224}
            height={224}
            sizes="112px"
            // Lazy on purpose: on a desktop this card is display:none, and a
            // lazy image that is never shown is never fetched. On a phone it
            // is at the top of the page, so it loads at once anyway.
            className="size-28 shrink-0 bg-sunk object-cover object-top shadow-[inset_0_0_0_1px_var(--color-rail-line)]"
          />
          <div className="min-w-0 pt-0.5">
            <p className="display text-lg uppercase leading-[1.1] tracking-[0.02em] text-rail-ink">
              {NAME}
              <span aria-hidden="true">.</span>
            </p>
            <p className="mt-1.5 font-mono text-3xs uppercase leading-snug tracking-[0.09em] text-accent-bright">
              {ROLE_TITLE}
            </p>
            <p className="mt-1 meta text-rail-muted">{LOCATION}</p>
          </div>
        </div>

        <Availability className="mt-4" />
        <div className="mt-1">
          <ContactLinks layout="wrap" />
        </div>
      </div>
    </section>
  );
}
