import Link from "next/link";

import { WorkShot } from "@/components/home/work-shot";
import { ShotVideo } from "@/components/shared/shot-video";
import type { AgentRole, WorkPreview, FeaturedWork } from "@/types/content";

/**
 * A featured project: the live page, a recording of it, or (for the AI
 * workflow) its roles; then the capability it proves, one paragraph, the
 * stack, and one specific call to action.
 *
 * The call to action is the card's one link, stretched over the whole card
 * (its ::after), so the card is clickable anywhere and a screen reader hears
 * one link with a specific name. A recording's Play button sits above the
 * stretch (z-10): a button inside a link is invalid, and would swallow the
 * click either way.
 */
export function WorkCard({ work, preview }: { work: FeaturedWork; preview?: WorkPreview }) {
  return (
    <article className="work-card group relative flex h-full flex-col border border-line transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] hover:border-ink focus-within:border-ink">
      {work.video ? (
        <div className="relative z-10">
          <ShotVideo video={work.video} />
        </div>
      ) : preview ? (
        <WorkShot preview={preview} />
      ) : work.roles ? (
        <RolesPanel roles={work.roles} />
      ) : null}

      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <p className="label text-faint">{work.capability}</p>
        <h3 className="display-tight mt-3 text-2xl leading-tight text-ink">{work.name}</h3>
        <p className="mt-3 text-base leading-relaxed text-muted">{work.text}</p>
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 meta text-faint">
          {work.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        <Link
          href={work.href}
          className="mt-auto flex items-center gap-2 pt-6 font-mono text-sm text-ink no-underline transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
        >
          {work.cta}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quart)] group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

/**
 * The AI card's picture: the five roles and what each hands back, in the same
 * frame a page screenshot gets. One writes; the rest report. That limit is a
 * role contract, not a tool permission (profile.ts), and the panel says so.
 */
function RolesPanel({ roles }: { roles: AgentRole[] }) {
  // 16:9 like the screenshots beside it, but not their clipping frame: if the
  // roles ever need more height than the ratio gives, the panel grows rather
  // than cutting a role off unseen. Rows are sized to fit the ratio at the
  // narrowest two-up card (~334px wide, 188px tall), which check:behaviour
  // holds: at py-1.5 the panel was 208px there, 20px taller than its row.
  return (
    <div className="flex aspect-video flex-col justify-center bg-sunk px-5 py-2 shadow-[inset_0_0_0_1px_var(--color-line)] lg:px-6">
      <dl className="divide-y divide-line border-y border-line">
        {roles.map((role) => (
          <div key={role.term} className="flex items-baseline justify-between gap-4 py-1">
            <dt className="flex items-center gap-2 text-xs text-ink">
              {role.term}
              {role.writes ? (
                <span className="chip meta px-1.5 py-0.5 leading-none">writes</span>
              ) : null}
            </dt>
            <dd className="meta text-right text-muted">{role.returns}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-1.5 meta text-faint">One writes code and four only report, by role contract.</p>
    </div>
  );
}
