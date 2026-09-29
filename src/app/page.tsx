import { Deck } from "@/components/home/deck";
import { MobileProfile } from "@/components/layout/mobile-profile";
import { JsonLd } from "@/components/shared/json-ld";
import { DECK_PREVIEWS } from "@/lib/content/assets";
import { AUTOTRADER_FIGURES, AUTOTRADER_LEDE, AUTOTRADER_POINTS } from "@/lib/content/experience";
import {
  HISTORY_LEDE,
  getPrinciples,
  getSkillMarquee,
  getTrackRecord,
} from "@/lib/content/practice";
import { getReadingOrder } from "@/lib/content/navigation";
import { getDirection, getUpNext } from "@/lib/content/roadmap";
import { getCaseStudies } from "@/lib/content/work";
import { buildPersonJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const [studies, direction, upNext, skills, roles, principles, pages] = await Promise.all([
    getCaseStudies(),
    getDirection(),
    getUpNext(),
    getSkillMarquee(),
    getTrackRecord(),
    getPrinciples(),
    getReadingOrder(),
  ]);

  return (
    <>
      <JsonLd data={buildPersonJsonLd()} />
      {/* Phones only: the rail's portrait, role and contacts, which the
          slim mobile bar has no room for. */}
      <MobileProfile />
      <Deck
        studies={studies}
        direction={direction}
        upNext={upNext}
        skills={skills}
        autoTraderLede={AUTOTRADER_LEDE}
        autoTraderPoints={AUTOTRADER_POINTS}
        autoTraderFigures={AUTOTRADER_FIGURES}
        previews={DECK_PREVIEWS}
        historyLede={HISTORY_LEDE}
        historyRolesCount={roles.length}
        historyPrinciplesCount={principles.length}
        indexes={Object.fromEntries(pages.map((p) => [p.href, p.index]))}
      />
    </>
  );
}
