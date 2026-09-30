import { ArrowLeft, Search } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { searchParamsSchema } from "@/features/search/search-schema";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/pretraga">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("searchTitle") };
}

export default async function SearchPlaceholderPage({
  params,
  searchParams,
}: PageProps<"/[locale]/pretraga">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const raw = await searchParams;
  const result = searchParamsSchema.safeParse({
    kind: "pets",
    vrsta: typeof raw.vrsta === "string" ? raw.vrsta : "",
    rasa: typeof raw.rasa === "string" ? raw.rasa : "",
    grad: typeof raw.grad === "string" ? raw.grad : "",
  });
  const values = result.success ? result.data : searchParamsSchema.parse({});
  const t = await getTranslations("SearchPage");

  return (
    <main className="section-padding bg-cream min-h-[65vh]">
      <div className="page-shell max-w-3xl">
        <div className="border-border shadow-warm rounded-[2rem] border bg-white p-8 sm:p-12">
          <span className="bg-mint text-brand flex size-14 items-center justify-center rounded-2xl">
            <Search aria-hidden="true" className="size-7" />
          </span>
          <p className="text-action mt-6 font-bold tracking-wide uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="font-heading text-ink mt-3 text-4xl font-bold sm:text-5xl">
            {t("title")}
          </h1>
          <p className="text-coffee mt-5 text-lg leading-8">
            {t("description")}
          </p>
          <div className="rounded-card bg-cream mt-8 p-6">
            <h2 className="text-ink font-bold">{t("query")}</h2>
            <ul className="text-coffee mt-3 grid gap-2">
              <li>
                {t("species", { value: values.vrsta || t("notSelected") })}
              </li>
              <li>{t("breed", { value: values.rasa || t("notSelected") })}</li>
              <li>{t("city", { value: values.grad || t("notSelected") })}</li>
            </ul>
          </div>
          <Link
            href="/"
            className={buttonVariants({
              variant: "secondary",
              className: "mt-8",
            })}
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
            {t("back")}
          </Link>
        </div>
      </div>
    </main>
  );
}
