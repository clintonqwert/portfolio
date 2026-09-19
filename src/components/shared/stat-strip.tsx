import type { Stat } from "@/types/content";

/** The measured strip beneath the masthead. Two columns on phones, four above. */
export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 border-b border-rule sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={[
            "py-6 pr-5",
            "border-line",
            // Right rule on every cell except the last in its row.
            i % 2 === 0 ? "border-r sm:border-r" : "sm:border-r",
            i < 2 ? "border-b sm:border-b-0" : "",
            i === 3 ? "sm:border-r-0" : "",
            i === 1 ? "border-r-0 sm:border-r" : "",
          ].join(" ")}
        >
          <dd className="block font-mono text-[1.85rem] font-medium leading-[1.1] tracking-[-0.03em] tabular-nums text-ink">
            {stat.value}
          </dd>
          <dt className="mt-1 font-mono text-[0.7rem] uppercase leading-[1.5] tracking-[0.08em] text-faint">
            {stat.label}
            {stat.detail ? (
              <>
                <br />
                {stat.detail}
              </>
            ) : null}
          </dt>
        </div>
      ))}
    </dl>
  );
}
