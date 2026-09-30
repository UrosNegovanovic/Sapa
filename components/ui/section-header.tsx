import { Link } from "@/i18n/navigation";

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6 sm:mb-8">
      <div>
        <h2 className="font-heading text-ink text-3xl font-bold sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-coffee mt-2 max-w-2xl">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-action hidden min-h-11 items-center font-bold underline-offset-4 hover:underline sm:inline-flex"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
