import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export function CategoryTile({
  href,
  icon,
  label,
  className,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-card text-brand focus-visible:ring-highlight flex min-h-16 items-center gap-3 p-3 font-bold transition-transform outline-none hover:-translate-y-1 focus-visible:ring-3 sm:min-h-36 sm:flex-col sm:justify-center sm:gap-4 sm:p-5 sm:text-center",
        className,
      )}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/65 sm:size-12"
        aria-hidden="true"
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
