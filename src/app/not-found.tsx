import Link from "next/link";

import { Section, SectionHeading } from "@/components/ui/section";

export default function NotFound() {
  return (
    <Section divider={false}>
      <SectionHeading as="h1">Page not found</SectionHeading>
      <p className="mt-3 max-w-[52ch] text-muted">
        That route does not exist. The work is on the{" "}
        <Link href="/" className="text-accent underline underline-offset-4">
          home page
        </Link>
        .
      </p>
    </Section>
  );
}
