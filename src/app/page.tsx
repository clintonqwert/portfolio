import { Deck } from "@/components/home/deck";
import { JsonLd } from "@/components/shared/json-ld";
import { AUTOTRADER_LEDE, PROJECT_OS_LEDE } from "@/lib/content/experience";
import { getGaps } from "@/lib/content/practice";
import { getHeadlineStats } from "@/lib/content/profile";
import { getCaseStudies } from "@/lib/content/work";
import { buildPersonJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const [stats, studies, gaps] = await Promise.all([
    getHeadlineStats(),
    getCaseStudies(),
    getGaps(),
  ]);

  return (
    <>
      <JsonLd data={buildPersonJsonLd()} />
      <Deck
        stats={stats}
        studies={studies}
        gaps={gaps}
        autoTraderLede={AUTOTRADER_LEDE}
        standardLede={PROJECT_OS_LEDE}
      />
    </>
  );
}
