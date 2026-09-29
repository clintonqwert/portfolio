import { cn } from "@/lib/utils";

/**
 * A status as a label with a square marker: solid when built or shipped,
 * open when planned. The words carry the meaning; the marker only lets a
 * reader scanning tell the two apart at a glance, so it is hidden from
 * assistive tech rather than announced twice.
 */
export function StatusMark({
  filled,
  label,
  className,
}: {
  filled: boolean;
  label: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 label", className)}>
      <span
        aria-hidden="true"
        className={cn("size-[7px] shrink-0 border border-current", filled ? "bg-current" : "")}
      />
      {label}
    </span>
  );
}
