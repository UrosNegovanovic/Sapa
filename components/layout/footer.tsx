import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/layout/logo";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const [t, header] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Header"),
  ]);

  return (
    <footer className="bg-footer text-white">
      <div className="page-shell grid gap-12 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo name={header("brand")} label={header("homeLabel")} inverted />
          <p className="mt-5 max-w-md leading-7 text-white/70">
            {t("description")}
          </p>
        </div>
        <div>
          <h2 className="font-bold">{t("platform")}</h2>
          <ul className="mt-4 grid gap-2 text-white/70">
            <li>
              <Link
                href="/pretraga"
                className="inline-flex min-h-11 items-center hover:text-white"
              >
                {t("marketplace")}
              </Link>
            </li>
            <li>
              <Link
                href="/pretraga?vrsta=salon"
                className="inline-flex min-h-11 items-center hover:text-white"
              >
                {t("grooming")}
              </Link>
            </li>
            <li>
              <Link
                href="/pretraga?vrsta=smestaj"
                className="inline-flex min-h-11 items-center hover:text-white"
              >
                {t("boarding")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold">{t("support")}</h2>
          <ul className="mt-4 grid gap-2 text-white/70">
            <li>
              <Link
                href="#poverenje"
                className="inline-flex min-h-11 items-center hover:text-white"
              >
                {t("safety")}
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="inline-flex min-h-11 items-center hover:text-white"
              >
                {t("help")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page-shell flex flex-col gap-3 py-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-white">
              {t("terms")}
            </Link>
            <Link href="#" className="hover:text-white">
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
