import { Wrap } from "@/components/ui/wrap";
import { cn } from "@/lib/utils";

/** A top-level page section with its dividing rule. */
export function Section({
  id,
  children,
  className,
  divider = true,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-14 sm:py-[72px]",
        divider && "border-t border-rule",
        className,
      )}
    >
      <Wrap>{children}</Wrap>
    </section>
  );
}

/** Section headline. Sizes are clamped so they scale without a media query. */
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
        "font-display font-bold leading-[1.15] tracking-[-0.02em] text-ink",
        Tag === "h3"
          ? "text-[1.02rem] tracking-[-0.005em]"
          : "text-[clamp(1.55rem,3.1vw,2.05rem)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
