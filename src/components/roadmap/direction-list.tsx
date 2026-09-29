import { StatusMark } from "@/components/shared/status-mark";
import type { DirectionStage } from "@/types/content";

const LINK =
  "py-2 underline decoration-1 underline-offset-[3px] hover:text-ink hover:decoration-2";

/** The studio's three stages, in order: side by side from lg, stacked below. */
export function DirectionList({ stages }: { stages: DirectionStage[] }) {
  return (
    <ol className="grid border-t border-rule lg:grid-cols-3 lg:gap-x-10">
      {stages.map((stage, i) => (
        <li
          key={stage.name}
          className="rise min-w-0 border-b border-line py-5"
          style={{ "--i": i } as React.CSSProperties}
        >
          <p className="font-mono text-2xs text-faint">
            {String(i + 1).padStart(2, "0")} · {stage.project}
          </p>
          <h3 className="display-tight mt-1 text-xl leading-snug text-ink">{stage.name}</h3>
          <StatusMark filled={stage.done} label={stage.statusLabel} className="mt-2 text-faint" />
          <p className="mt-2 text-base leading-relaxed text-muted">{stage.summary}</p>
          <p className="mt-1 text-sm text-muted">
            <a href={stage.source.href} className={LINK}>
              {stage.source.label}
            </a>
          </p>
        </li>
      ))}
    </ol>
  );
}
