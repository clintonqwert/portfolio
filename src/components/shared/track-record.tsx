import type { Role, StackGroup } from "@/types/content";

/**
 * The track record as ruled rows: period in the margin, then the role, then
 * what it amounted to. A list of dated rows rather than a timeline of dots —
 * PRODUCT.md rules the dots out, and the dates are the part a reader checks.
 */
export function TrackRecord({ roles }: { roles: Role[] }) {
  return (
    <ol className="border-t border-rule">
      {roles.map((role, i) => (
        <li
          key={`${role.period}-${role.title}`}
          className="rise grid gap-x-8 gap-y-1.5 border-b border-line py-5 sm:grid-cols-[9.5rem_minmax(0,1fr)]"
          style={{ "--i": Math.min(i, 3) } as React.CSSProperties}
        >
          <div className="pt-1 meta text-2xs uppercase tracking-[0.06em] text-faint">
            {role.period}
          </div>
          <div>
            <h3 className="display-tight text-xl leading-snug text-ink">{role.title}</h3>
            <p className="mt-0.5 font-mono text-xs text-muted">{role.org}</p>
            <p className="mt-2 max-w-[64ch] text-base leading-relaxed text-muted">
              {role.summary}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Tool groups: the group's name, then everything in it, one ruled row each. */
export function StackGrid({ groups }: { groups: StackGroup[] }) {
  return (
    <dl className="border-t border-rule">
      {groups.map((group, i) => (
        <div
          key={group.name}
          className="rise grid gap-x-8 gap-y-1 border-b border-line py-4 sm:grid-cols-[9.5rem_minmax(0,1fr)]"
          style={{ "--i": Math.min(i, 3) } as React.CSSProperties}
        >
          <dt className="display-tight text-lg leading-snug text-ink">{group.name}</dt>
          <dd className="text-base leading-relaxed text-muted">{group.items}</dd>
        </div>
      ))}
    </dl>
  );
}
