import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const variants = {
  sun: "bg-highlight/30 text-ink",
  mint: "bg-mint text-brand",
  coral: "bg-peach text-action",
  neutral: "bg-cream text-coffee",
};

export function Badge({
  className,
  variant = "sun",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
