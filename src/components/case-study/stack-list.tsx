/**
 * The stack as a drawing's parts list: one item to a ruled line, numbered in
 * the order the case study declares them. Set large, because on a page about
 * how something was built the list of what it was built from is content, not
 * a footnote in ten-pixel mono.
 */
export function StackList({ items }: { items: string[] }) {
  return (
    <ol className="grid border-t border-rule sm:grid-cols-2 sm:gap-x-10">
      {items.map((item, i) => (
        <li
          key={item}
          className="rise flex items-baseline justify-between gap-4 border-b border-line py-3.5"
          style={{ "--i": i % 4 } as React.CSSProperties}
        >
          <span className="display-tight text-[clamp(1.15rem,1.6vw,1.45rem)] leading-tight text-ink">
            {item}
          </span>
          <span className="meta shrink-0 text-faint">{String(i + 1).padStart(2, "0")}</span>
        </li>
      ))}
    </ol>
  );
}
