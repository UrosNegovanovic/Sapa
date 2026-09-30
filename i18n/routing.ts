import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sr-Latn"],
  defaultLocale: "sr-Latn",
  localePrefix: "as-needed",
  localeCookie: false,
});
