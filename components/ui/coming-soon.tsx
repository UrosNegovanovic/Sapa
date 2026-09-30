import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ComingSoonProps = {
  children: ReactNode;
  badge: string;
  className?: string;
  badgeClassName?: string;
};

// Stands in for a link or button whose feature belongs to a later phase, so
// the UI never ships href="#" or inert controls.
export function ComingSoon({
  children,
  badge,
  className,
  badgeClassName,
}: ComingSoonProps) {
  return (
    <span
      className={cn("inline-flex cursor-default items-center gap-2", className)}
    >
      {children}
      <span
        className={cn(
          "bg-cream text-coffee rounded-full px-2 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase",
          badgeClassName,
        )}
      >
        {badge}
      </span>
    </span>
  );
}
