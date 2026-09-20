import type { Role, StackGroup } from "@/types/content";

export function TrackRecord({ roles }: { roles: Role[] }) {
  return (
    <ol className="space-y-[13px]">
      {roles.map((role) => (
        <li
          key={`${role.period}-${role.title}`}
          className="grid gap-x-[13px] gap-y-[2px] sm:grid-cols-[112px_minmax(0,1fr)]"
        >
          <div className="font-mono text-[0.66rem] uppercase tracking-[0.05em] text-faint">
            {role.period}
          </div>
          <div>
            <h3 className="font-display text-[0.88rem] font-semibold text-ink">
              {role.title}{" "}
              <em className="font-normal not-italic text-accent">· {role.org}</em>
            </h3>
            <p className="mt-[2px] text-[0.8rem] leading-snug text-muted">{role.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function StackGrid({ groups }: { groups: StackGroup[] }) {
  return (
    <dl className="space-y-[13px]">
      {groups.map((group) => (
        <div key={group.name}>
          <dt className="font-display text-[0.82rem] font-semibold text-ink">
            {group.name}
          </dt>
          <dd className="mt-[2px] text-[0.78rem] leading-snug text-muted">{group.items}</dd>
        </div>
      ))}
    </dl>
  );
}
