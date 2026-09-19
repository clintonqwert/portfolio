import type { Role, StackGroup } from "@/types/content";

export function TrackRecord({ roles }: { roles: Role[] }) {
  return (
    <ol className="mt-6 space-y-7">
      {roles.map((role) => (
        <li
          key={`${role.period}-${role.title}`}
          className="grid gap-x-8 gap-y-1 sm:grid-cols-[150px_minmax(0,1fr)]"
        >
          <div className="font-mono text-[0.74rem] uppercase tracking-[0.06em] text-faint">
            {role.period}
          </div>
          <div>
            <h3 className="font-display text-[1rem] font-semibold text-ink">
              {role.title}{" "}
              <em className="font-normal not-italic text-accent">· {role.org}</em>
            </h3>
            <p className="mt-1 text-[0.94rem] text-muted">{role.summary}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function StackGrid({ groups }: { groups: StackGroup[] }) {
  return (
    <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.name}>
          <dt className="font-display text-[0.95rem] font-semibold text-ink">
            {group.name}
          </dt>
          <dd className="mt-1 text-[0.92rem] text-muted">{group.items}</dd>
        </div>
      ))}
    </dl>
  );
}
