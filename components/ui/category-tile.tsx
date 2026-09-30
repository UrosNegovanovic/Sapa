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
        "rounded-card text-brand focus-visible:ring-highlight flex min-h-36 flex-col items-center justify-center gap-4 p-5 text-center font-bold transition-transform outline-none hover:-translate-y-1 focus-visible:ring-3",
        className,
      )}
    >
      <span
        className="flex size-12 items-center justify-center rounded-2xl bg-white/65"
        aria-hidden="true"
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
