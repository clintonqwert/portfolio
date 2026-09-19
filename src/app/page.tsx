import { CaseStudyCard } from "@/components/home/case-study-card";
import { Masthead } from "@/components/home/masthead";
import { GapsTable } from "@/components/shared/data-table";
import { JsonLd } from "@/components/shared/json-ld";
import { Passages } from "@/components/shared/passages";
import { PrincipleGrid } from "@/components/shared/principle-grid";
import { StatStrip } from "@/components/shared/stat-strip";
import { StackGrid, TrackRecord } from "@/components/shared/track-record";
import { Section, SectionHeading } from "@/components/ui/section";
import { Col, Rail, Spec } from "@/components/ui/spec";
import { Wrap } from "@/components/ui/wrap";
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

      <Masthead />
      <Wrap>
        <StatStrip stats={stats} />
      </Wrap>

      <Section divider={false}>
        <Spec>
          <Rail label="Position">
            Senior / Staff
            <br />
            Full-stack
          </Rail>
          <Col>
            <Passages passages={position} />
          </Col>
        </Spec>
      </Section>

      <Section id="work">
        <Spec>
          <Rail label="Work">
            Two live sites
            <br />
            Sole engineer
          </Rail>
          <Col wide>
            <SectionHeading>Selected work</SectionHeading>
            <div className="mt-7 grid gap-9 lg:grid-cols-2">
              {caseStudies.map((study) => (
                <CaseStudyCard key={study.slug} study={study} />
              ))}
            </div>
          </Col>
        </Spec>
      </Section>

      <Section id="autotrader">
        <Spec>
          <Rail label={AUTOTRADER_RAIL.org}>
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
          </Rail>
          <Col>
            <SectionHeading className="mb-4">
              Caching as a stability problem, not a speed problem
            </SectionHeading>
            <Passages passages={autoTrader} />
          </Col>
        </Spec>
      </Section>

      <Section id="standard">
        <Spec>
          <Rail label={PROJECT_OS_RAIL.name}>
            {PROJECT_OS_RAIL.documents}
            <br />
            {PROJECT_OS_RAIL.lines}
            <br />
            <br />
            {PROJECT_OS_RAIL.roles}
          </Rail>
          <Col>
            <SectionHeading className="mb-4">
              Standards that outlive one repository
            </SectionHeading>
            <Passages passages={projectOs} />
          </Col>
        </Spec>
      </Section>

      <Section id="practice">
        <Spec>
          <Rail label="Practice">How I work</Rail>
          <Col wide>
            <PrincipleGrid principles={principles} />
          </Col>
        </Spec>
      </Section>

      <Section id="gaps">
        <Spec>
          <Rail label="Open">
            Known gaps
            <br />
            Recorded in
            <br />
            the repos
          </Rail>
          <Col wide>
            <SectionHeading className="mb-3">What I would fix first</SectionHeading>
            <p className="max-w-[64ch] text-muted">
              These were written into the repositories with their consequences
              attached before any interviewer asked, because a gap you have named
              is a plan and a gap you have hidden is a liability. They read on the
              same instrument as everything above.
            </p>
            <GapsTable rows={gaps} />
            <p className="max-w-[64ch] text-[0.94rem] italic text-muted">
              Both sites are my own studio&rsquo;s work. I am looking for a senior
              role on a team where the standards are shared rather than
              self-imposed.
            </p>
          </Col>
        </Spec>
      </Section>

      <Section id="track-record">
        <Spec>
          <Rail label="Before">2016 – 2020</Rail>
          <Col wide>
            <SectionHeading>Track record</SectionHeading>
            <TrackRecord roles={roles} />
          </Col>
        </Spec>
      </Section>

      <Section id="stack">
        <Spec>
          <Rail label="Stack">
            Current and
            <br />
            prior-role
          </Rail>
          <Col wide>
            <SectionHeading>Tools</SectionHeading>
            <StackGrid groups={stackGroups} />
          </Col>
        </Spec>
      </Section>
    </>
  );
}
