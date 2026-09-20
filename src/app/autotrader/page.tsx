import type { Metadata } from "next";

import { DetailView } from "@/components/layout/detail-view";
import { Passages } from "@/components/shared/passages";
import { AUTOTRADER_LEDE, AUTOTRADER_RAIL, getAutoTraderPassages } from "@/lib/content/experience";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AutoTrader.ca — caching as a stability problem",
  description: AUTOTRADER_LEDE,
  path: "/autotrader",
});

export default async function AutoTraderPage() {
  const passages = await getAutoTraderPassages();

  return (
    <DetailView
      eyebrow="AutoTrader"
      title="Caching as a stability problem, not a speed problem"
      meta={[
        { label: "Role", value: "Senior Software Engineer, Full-Stack" },
        { label: "Period", value: AUTOTRADER_RAIL.period },
        { label: "Stack", value: AUTOTRADER_RAIL.stack.join(" · ") },
      ]}
    >
      <Passages passages={passages} />
    </DetailView>
  );
}
