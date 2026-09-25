import { Deck } from "@/components/home/deck";
import { JsonLd } from "@/components/shared/json-ld";
import { AUTOSYNC_IMAGE, WORK_IMAGES } from "@/lib/content/assets";
import { AUTOTRADER_LEDE } from "@/lib/content/experience";
import {
  HISTORY_LEDE,
  getGaps,
  getPrinciples,
  getSkillMarquee,
  getTrackRecord,
} from "@/lib/content/practice";
import { getCaseStudies } from "@/lib/content/work";
import { buildPersonJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const [studies, gaps, skills, roles, principles] = await Promise.all([
    getCaseStudies(),
    getGaps(),
    getSkillMarquee(),
    getTrackRecord(),
    getPrinciples(),
  ]);

  return (
    <>
      <JsonLd data={buildPersonJsonLd()} />
      <Deck
        studies={studies}
        gaps={gaps}
        skills={skills}
        autoTraderLede={AUTOTRADER_LEDE}
        workImages={WORK_IMAGES}
        autoSyncImage={AUTOSYNC_IMAGE}
        historyLede={HISTORY_LEDE}
        historyRolesCount={roles.length}
        historyPrinciplesCount={principles.length}
      />
    </>
  );
}
