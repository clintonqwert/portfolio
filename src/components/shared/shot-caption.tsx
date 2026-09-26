import { cn } from "@/lib/utils";

/**
 * A figure's caption, like a figure on a drawing: number, what it shows, then
 * where it came from. Shared by the screenshot and the recording, so the two
 * kinds of figure caption themselves identically.
 *
 * `linkSource`: a screenshot's frame is itself the link to its source, so its
 * caption only names it. A recording's frame holds the video and its control,
 * so there the caption carries the link.
 */
export function ShotCaption({
  figure,
  caption,
  source,
  linkSource = false,
  pending = false,
}: {
  figure: string;
  caption?: string;
  source?: { label: string; href: string };
  linkSource?: boolean;
  /** The asset is a placeholder: say so, rather than pass it off as the work. */
  pending?: boolean;
}) {
  return (
    <figcaption
      className={cn(
        "mt-2.5 flex gap-x-4 gap-y-1 meta text-faint",
        caption ? "flex-col sm:flex-row sm:items-baseline" : "items-baseline",
      )}
    >
      <span className="label shrink-0">Fig. {figure}</span>
      {caption ? (
        <span className="max-w-[60ch] font-body text-sm leading-snug text-muted">{caption}</span>
      ) : null}
      {source ? (
        <span className={cn("min-w-0", caption ? "sm:ml-auto sm:shrink-0" : "")}>
          {linkSource ? (
            <a
              href={source.href}
              className="py-2 underline decoration-1 underline-offset-[3px] hover:text-ink hover:decoration-2"
            >
              {source.label}
            </a>
          ) : (
            source.label
          )}
        </span>
      ) : null}
      {pending ? <span className="shrink-0">Screenshot pending</span> : null}
    </figcaption>
  );
}
