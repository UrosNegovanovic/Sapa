import { PawPrint } from "lucide-react";

import { Link } from "@/i18n/navigation";

export function Logo({
  name,
  label,
  inverted = false,
}: {
  name: string;
  label: string;
  inverted?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={label}
      className="focus-visible:ring-highlight inline-flex min-h-11 items-center gap-2 rounded-full outline-none focus-visible:ring-3"
    >
      <span
        className={
          inverted
            ? "text-highlight flex size-10 items-center justify-center rounded-full bg-white/10"
            : "bg-peach text-action flex size-10 items-center justify-center rounded-full"
        }
      >
        <PawPrint aria-hidden="true" className="size-5" />
      </span>
      <span
        className={
          inverted
            ? "font-heading text-2xl font-bold text-white"
            : "font-heading text-action text-2xl font-bold"
        }
      >
        {name}
      </span>
    </Link>
  );
}
