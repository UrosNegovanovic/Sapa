"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(
      JSON.stringify({
        level: "error",
        event: "ui.route_error",
        digest: error.digest,
      }),
    );
  }, [error]);

  return (
    <main className="page-shell section-padding min-h-[55vh]">
      <div className="rounded-card border-border shadow-warm mx-auto max-w-xl border bg-white p-8 text-center">
        <AlertTriangle
          aria-hidden="true"
          className="text-action mx-auto size-10"
        />
        <h1 className="font-heading mt-5 text-3xl font-bold">{t("title")}</h1>
        <p className="text-coffee mt-3">{t("description")}</p>
        <Button className="mt-6" onClick={reset}>
          {t("retry")}
        </Button>
      </div>
    </main>
  );
}
