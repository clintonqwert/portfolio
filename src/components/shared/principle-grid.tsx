import type { Principle } from "@/types/content";

/** The practice grid. Auto-fits, so it needs no breakpoint of its own. */
export function PrincipleGrid({ principles }: { principles: Principle[] }) {
  return (
    <ul className="mt-7 grid gap-px border border-line bg-line [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
      {principles.map((principle) => (
        <li key={principle.title} className="bg-ground p-5">
          <h3 className="font-display text-[1.02rem] font-semibold text-ink">
            {principle.title}
          </h3>
          <p className="mt-1 text-[0.92rem] text-muted">{principle.body}</p>
        </li>
      ))}
    </ul>
  );
}
