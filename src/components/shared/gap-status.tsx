import { cn } from "@/lib/utils";
import type { Gap } from "@/types/content";

const LABEL: Record<Gap["status"], string> = {
  "in-development": "In development",
  roadmap: "On the roadmap",
};

/**
 * Where a gap's fix stands, as a label with a square marker: solid for work
 * under way, open for work scheduled. The words carry the meaning; the marker
 * only lets a reader scanning the deck tell the two apart at a glance, so it
 * is hidden from assistive tech rather than announced twice.
 */
export function GapStatus({
  status,
  className,
}: {
  status: Gap["status"];
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 label", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "size-[7px] shrink-0 border border-current",
          status === "in-development" ? "bg-current" : "",
        )}
      />
      {LABEL[status]}
    </span>
  );
}
