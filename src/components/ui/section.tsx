import { cn } from "@/lib/utils";

/**
 * A workspace section. Padding is fluid rather than stepped so the rhythm
 * breathes on wide viewports without a breakpoint for every size.
 */
export function Section({
  id,
  children,
  className,
  divider = true,
  tone = "canvas",
  size = "default",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
  /**
   * `sunk` marks a section as a focal point. Used once, on the open-gaps
   * section: publishing unfixed weaknesses is this page's argument, and it
   * should not look like every other block on the page.
   */
  tone?: "canvas" | "sunk";
  /** Vertical rhythm tier. Uniform padding everywhere reads as monotonous. */
  size?: "tight" | "default" | "loose";
}) {
  const pad = {
    tight: "py-[clamp(2.25rem,4vw,3.5rem)]",
    default: "py-[clamp(3rem,6vw,5rem)]",
    loose: "py-[clamp(4rem,8vw,7rem)]",
  }[size];

  return (
    <section
      id={id}
      className={cn(
        "px-6 sm:px-10 lg:px-14",
        pad,
        divider && "border-t border-rule",
        tone === "sunk" && "bg-sunk",
        className,
      )}
    >
      <div className="max-w-[1080px]">{children}</div>
    </section>
  );
}

/**
 * The mono label column beside a section's content. `index` is the section's
 * position in the page order — the same number the rail shows, not decoration.
 */
export function Label({
  title,
  index,
  children,
}: {
  title: string;
  index?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="pt-1 font-mono text-2xs uppercase leading-[1.75] tracking-[0.1em] text-faint">
      <b className="flex items-baseline gap-2 font-medium text-accent">
        {index ? (
          <span className="tabular-nums text-faint">{index}</span>
        ) : null}
        {title}
      </b>
      {children}
    </div>
  );
}

export function SectionHeading({
  children,
  as: Tag = "h2",
  className,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "font-display text-ink",
        Tag === "h3"
          ? "text-lg font-semibold leading-snug tracking-[-0.008em]"
          : "text-[clamp(1.6rem,3vw,2.15rem)] font-bold leading-[1.12] tracking-[-0.022em]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * Measured prose column.
 *
 * 62ch, not 68: the `ch` unit measures the "0" glyph, which is narrower than the
 * average character in a proportional face, so a 68ch column rendered ~85
 * characters — past the 65–75 band. Measured against the real copy.
 */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[min(62ch,100%)] text-muted", className)}>
      {children}
    </div>
  );
}
