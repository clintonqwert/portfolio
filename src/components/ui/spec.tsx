import { cn } from "@/lib/utils";

/**
 * The spec-sheet row: a mono annotation rail beside a prose column. The rail
 * collapses above the column below 880px — see the `.spec` rule in globals.css.
 */
export function Spec({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("spec", className)}>{children}</div>;
}

/**
 * The annotation rail. `label` is the accented heading; children are the
 * metadata lines beneath it.
 */
export function Rail({
  label,
  children,
}: {
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="pt-2 font-mono text-[0.7rem] uppercase leading-[1.7] tracking-[0.1em] text-faint">
      {label ? <b className="block font-medium text-accent">{label}</b> : null}
      {children}
    </div>
  );
}

/** The prose column. Measured to 64ch, but never wider than its grid cell. */
export function Col({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Opt out of the measure for tables and grids. */
  wide?: boolean;
}) {
  return (
    <div className={cn(wide ? "max-w-none" : "max-w-[min(64ch,100%)]", className)}>
      {children}
    </div>
  );
}
