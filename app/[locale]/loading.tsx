import messages from "@/i18n/messages/sr-Latn.json";

export default function Loading() {
  return (
    <main
      className="page-shell section-padding"
      role="status"
      aria-label={messages.Common.loading}
    >
      <div className="bg-border/60 h-12 w-2/3 animate-pulse rounded-full" />
      <div className="bg-border/40 mt-5 h-6 w-1/2 animate-pulse rounded-full" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-card shadow-soft h-80 animate-pulse bg-white"
          />
        ))}
      </div>
    </main>
  );
}
