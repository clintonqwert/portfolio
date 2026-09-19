import { cn } from "@/lib/utils";

/** The page's measured container. Every section sits inside one. */
export function Wrap({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1060px] px-5 sm:px-7", className)}>
      {children}
    </div>
  );
}
