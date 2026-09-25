import type { Metadata } from "next";

import { DetailView } from "@/components/layout/detail-view";
import { Passages } from "@/components/shared/passages";
import { PROJECT_OS_LEDE, PROJECT_OS_RAIL, getProjectOsPassages } from "@/lib/content/experience";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI Engineering — Project OS, standards that outlive one repository",
  description: PROJECT_OS_LEDE,
  path: "/standard",
});

export default async function StandardPage() {
  const passages = await getProjectOsPassages();

  return (
    <DetailView
      eyebrow="AI Engineering"
      title="Project OS: standards that outlive one repository"
      lede={PROJECT_OS_LEDE}
      meta={[
        { label: "Size", value: `${PROJECT_OS_RAIL.documents}, ${PROJECT_OS_RAIL.lines}` },
        { label: "Roles", value: PROJECT_OS_RAIL.roles },
        { label: "Status", value: "Self-authored · not employer-adopted" },
      ]}
    >
      <Passages passages={passages} />
    </DetailView>
  );
}
