"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { HomeCategory } from "@/features/home/data";

type SearchTabsProps = {
  categories: HomeCategory[];
  cities: Array<{ id: string; name: string; slug: string }>;
};

const tabValues = ["pets", "grooming", "boarding"] as const;

export function SearchTabs({ categories, cities }: SearchTabsProps) {
  const t = useTranslations("Search");

  return (
    <Tabs.Root defaultValue="pets" className="w-full">
      <Tabs.List
        aria-label={t("tabsLabel")}
        className="border-border bg-cream/80 flex gap-1 overflow-x-auto rounded-2xl border p-1"
      >
        {tabValues.map((tab) => (
          <Tabs.Trigger
            key={tab}
            value={tab}
            className="text-coffee data-[state=active]:text-brand focus-visible:ring-highlight min-h-11 min-w-max flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-colors outline-none focus-visible:ring-3 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {t(tab)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabValues.map((tab) => (
        <Tabs.Content key={tab} value={tab} className="mt-4 outline-none">
          <form
            action="/pretraga"
            method="get"
            className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <label className="text-coffee grid gap-1 text-xs font-bold">
              {t("speciesLabel")}
              <select
                name="vrsta"
                className="rounded-input border-border text-ink focus:border-brand focus:ring-mint min-h-12 border bg-white px-4 text-base outline-none focus:ring-3"
                defaultValue=""
              >
                <option value="">
                  {tab === "pets"
                    ? t("speciesPlaceholder")
                    : t("servicePlaceholder")}
                </option>
                {tab === "pets"
                  ? categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))
                  : null}
              </select>
            </label>
            <label className="text-coffee grid gap-1 text-xs font-bold">
              {t("breedLabel")}
              <select
                name="rasa"
                className="rounded-input border-border text-ink focus:border-brand focus:ring-mint min-h-12 border bg-white px-4 text-base outline-none focus:ring-3"
                defaultValue=""
              >
                <option value="">{t("breedPlaceholder")}</option>
              </select>
            </label>
            <label className="text-coffee grid gap-1 text-xs font-bold">
              {t("cityLabel")}
              <select
                name="grad"
                className="rounded-input border-border text-ink focus:border-brand focus:ring-mint min-h-12 border bg-white px-4 text-base outline-none focus:ring-3"
                defaultValue=""
              >
                <option value="">{t("cityPlaceholder")}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="submit"
              variant="secondary"
              className="self-end lg:px-7"
            >
              <Search aria-hidden="true" className="size-5" />
              {t("submit")}
            </Button>
          </form>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
