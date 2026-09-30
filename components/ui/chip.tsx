import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Chip({
  active = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "focus-visible:ring-highlight/70 min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-3",
        active
          ? "border-brand bg-brand text-white"
          : "border-border text-coffee hover:border-brand/35 hover:text-brand bg-white",
        className,
      )}
      {...props}
    />
  );
}
