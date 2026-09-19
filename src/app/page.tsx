import { Masthead } from "@/components/home/masthead";
import { WorkGrid } from "@/components/home/work-grid";
import { SiteFooter } from "@/components/layout/site-footer";
import { GapsTable } from "@/components/shared/data-table";
import { JsonLd } from "@/components/shared/json-ld";
import { Passages } from "@/components/shared/passages";
import { PrincipleGrid } from "@/components/shared/principle-grid";
import { StackGrid, TrackRecord } from "@/components/shared/track-record";
import { Label, Prose, Section, SectionHeading } from "@/components/ui/section";
import {
  AUTOTRADER_RAIL,
  PROJECT_OS_RAIL,
  getAutoTraderPassages,
  getProjectOsPassages,
} from "@/lib/content/experience";
import {
  getGaps,
  getPrinciples,
  getStackGroups,
  getTrackRecord,
} from "@/lib/content/practice";
import { getHeadlineStats, getPositionPassages } from "@/lib/content/profile";
import { getCaseStudies } from "@/lib/content/work";
import { buildPersonJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const [
    stats,
    position,
    caseStudies,
    autoTrader,
    projectOs,
    principles,
    gaps,
    roles,
    stackGroups,
  ] = await Promise.all([
    getHeadlineStats(),
    getPositionPassages(),
    getCaseStudies(),
    getAutoTraderPassages(),
    getProjectOsPassages(),
    getPrinciples(),
    getGaps(),
    getTrackRecord(),
    getStackGroups(),
  ]);

  return (
    <>
      <JsonLd data={buildPersonJsonLd()} />

      <Masthead stats={stats} />

      <Section divider={false}>
        <div className="datagrid">
          <Label title="Position">
            Senior / Staff
            <br />
            Full-stack
          </Label>
          <Prose>
            <Passages passages={position} />
          </Prose>
        </div>
      </Section>

      <Section id="work">
        <div className="datagrid">
          <Label title="Work" index="01">
            Two live sites
            <br />
            Sole engineer
          </Label>
          <div>
            <SectionHeading className="mb-6">Selected work</SectionHeading>
            <WorkGrid studies={caseStudies} />
          </div>
        </div>
      </Section>

      <Section id="autotrader">
        <div className="datagrid">
          <Label title={AUTOTRADER_RAIL.org} index="02">
            {AUTOTRADER_RAIL.period}
            <br />
            {AUTOTRADER_RAIL.duration}
            <br />
            <br />
            {AUTOTRADER_RAIL.stack.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </Label>
          <Prose>
            <SectionHeading className="mb-5">
              Caching as a stability problem, not a speed problem
            </SectionHeading>
            <Passages passages={autoTrader} />
          </Prose>
        </div>
      </Section>

      <Section id="standard">
        <div className="datagrid">
          <Label title={PROJECT_OS_RAIL.name} index="03">
            {PROJECT_OS_RAIL.documents}
            <br />
            {PROJECT_OS_RAIL.lines}
            <br />
            <br />
            {PROJECT_OS_RAIL.roles}
          </Label>
          <Prose>
            <SectionHeading className="mb-5">
              Standards that outlive one repository
            </SectionHeading>
            <Passages passages={projectOs} />
          </Prose>
        </div>
      </Section>

      <Section id="practice">
        <div className="datagrid">
          <Label title="Practice" index="04">
            How I work
          </Label>
          <PrincipleGrid principles={principles} />
        </div>
      </Section>

      <Section id="gaps">
        <div className="datagrid">
          <Label title="Open gaps" index="05">
            Recorded in
            <br />
            the repos
          </Label>
          <div>
            <SectionHeading className="mb-4">What I would fix first</SectionHeading>
            <Prose>
              <p>
                These were written into the repositories with their consequences
                attached before any interviewer asked, because a gap you have
                named is a plan and a gap you have hidden is a liability. They
                read on the same instrument as everything above.
              </p>
            </Prose>
            <GapsTable rows={gaps} />
            <Prose className="text-[0.94rem]">
              <p>
                Both sites are my own studio&rsquo;s work. I am looking for a
                senior role on a team where the standards are shared rather than
                self-imposed.
              </p>
            </Prose>
          </div>
        </div>
      </Section>

      <Section id="history">
        <div className="datagrid">
          <Label title="History" index="06">
            2016 – 2020
          </Label>
          <div>
            <SectionHeading>Track record</SectionHeading>
            <TrackRecord roles={roles} />
            <SectionHeading className="mt-14">Tools</SectionHeading>
            <StackGrid groups={stackGroups} />
          </div>
        </div>
      </Section>

      <SiteFooter />
    </>
  );
}
