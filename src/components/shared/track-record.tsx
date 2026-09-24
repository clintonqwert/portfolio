import type { Role, StackGroup } from "@/types/content";

export function TrackRecord({ roles }: { roles: Role[] }) {
  return (
    <ol className="space-y-3">
      {roles.map((role) => (
        <li
          key={`${role.period}-${role.title}`}
          className="grid gap-x-3 gap-y-0.5 sm:grid-cols-[112px_minmax(0,1fr)]"
        >
          <div className="font-mono text-3xs uppercase tracking-[0.05em] text-faint">
            {role.period}
          </div>
          <div>
            <h3 className="font-display text-md font-semibold text-ink">
              {role.title}{" "}
              <em className="font-normal not-italic text-accent">· {role.org}</em>
            </h3>
            <p className="mt-0.5 text-sm leading-snug text-muted">{role.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function StackGrid({ groups }: { groups: StackGroup[] }) {
  return (
    <dl className="space-y-3">
      {groups.map((group) => (
        <div key={group.name}>
          <dt className="font-display text-sm font-semibold text-ink">
            {group.name}
          </dt>
          <dd className="mt-0.5 text-xs leading-snug text-muted">{group.items}</dd>
        </div>
      ))}
    </dl>
  );
}
