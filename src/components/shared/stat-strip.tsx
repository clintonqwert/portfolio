import type { Stat } from "@/types/content";

/** Measured strip. Two columns on phones, four above. */
export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 border-t border-rule sm:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={[
            "py-6 pr-6 border-line",
            i % 2 === 1 ? "border-r-0" : "border-r",
            i === stats.length - 1 ? "sm:border-r-0" : "sm:border-r",
            i < 2 ? "border-b sm:border-b-0" : "",
          ].join(" ")}
        >
          <dd className="font-mono text-[clamp(1.4rem,2.2vw,1.8rem)] font-medium leading-none tabular-nums tracking-[-0.03em] text-ink">
            {stat.value}
          </dd>
          <dt className="mt-2.5 font-mono text-[0.66rem] uppercase leading-[1.55] tracking-[0.08em] text-faint">
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
