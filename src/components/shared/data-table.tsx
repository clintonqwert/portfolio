import type { Assertion, Gap } from "@/types/content";

/**
 * Tables carry a min-width so their columns stay legible, and scroll inside
 * this wrapper rather than widening the page. The `.spec > * { min-width: 0 }`
 * rule in globals.css is what makes that containment work.
 */
function TableFrame({
  caption,
  children,
  minWidth,
}: {
  caption: string;
  children: React.ReactNode;
  minWidth: string;
}) {
  return (
    <div className="my-6 overflow-x-auto border border-line bg-panel">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <caption className="border-b border-line bg-sunk px-4 py-3 text-left font-mono text-[0.7rem] uppercase tracking-[0.1em] text-faint">
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

const TH =
  "border-b border-line px-4 py-2 text-left font-mono text-[0.68rem] uppercase tracking-[0.09em] text-faint font-normal";
const TD = "border-b border-line px-4 py-3 align-top text-[0.92rem]";

export function AssertionTable({
  caption,
  rows,
}: {
  caption: string;
  rows: Assertion[];
}) {
  return (
    <TableFrame caption={caption} minWidth="520px">
      <thead>
        <tr>
          <th scope="col" className={TH}>
            Assertion
          </th>
          <th scope="col" className={TH}>
            Threshold
          </th>
          <th scope="col" className={TH}>
            State
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td className={`${TD} font-mono text-[0.84rem] text-ink`}>{row.name}</td>
            <td className={`${TD} font-mono text-[0.84rem] text-muted`}>
              {row.threshold}
            </td>
            <td
              className={`${TD} font-mono text-[0.84rem] ${
                row.measured ? "text-signal" : "text-pass"
              }`}
            >
              {row.state}
            </td>
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}

export function GapsTable({ rows }: { rows: Gap[] }) {
  return (
    <TableFrame caption="Open — gap, consequence, planned fix" minWidth="640px">
      <thead>
        <tr>
          <th scope="col" className={TH}>
            Gap
          </th>
          <th scope="col" className={TH}>
            Consequence
          </th>
          <th scope="col" className={TH}>
            Fix
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.gap}>
            <th
              scope="row"
              className={`${TD} font-mono text-[0.84rem] font-normal text-signal`}
            >
              {row.gap}
            </th>
            <td className={TD}>{row.consequence}</td>
            <td className={TD}>{row.fix}</td>
          </tr>
        ))}
      </tbody>
    </TableFrame>
  );
}
