import { Globe2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function Header() {
  const [t, utility] = await Promise.all([
    getTranslations("Header"),
    getTranslations("Utility"),
  ]);

  return (
    <header className="border-border/70 relative z-40 border-b bg-white/95 backdrop-blur">
      <div className="bg-brand text-white">
        <div className="page-shell flex min-h-9 items-center justify-between gap-4 text-xs font-semibold">
          <p>{utility("message")}</p>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Globe2 aria-hidden="true" className="size-3.5" />
            {utility("locale")}
          </span>
        </div>
      </div>
      <div className="page-shell flex min-h-20 items-center justify-between gap-6">
        <Logo name={t("brand")} label={t("homeLabel")} />
        <nav
          aria-label={t("menuLabel")}
          className="hidden items-center gap-8 md:flex"
        >
          <Link
            href="/pretraga"
            className="text-ink hover:text-action inline-flex min-h-11 items-center font-semibold"
          >
            {t("marketplace")}
          </Link>
          <Link
            href="/pretraga?vrsta=salon"
            className="text-ink hover:text-action inline-flex min-h-11 items-center font-semibold"
          >
            {t("grooming")}
          </Link>
          <Link
            href="/pretraga?vrsta=smestaj"
            className="text-ink hover:text-action inline-flex min-h-11 items-center font-semibold"
          >
            {t("boarding")}
          </Link>
          <Link
            href="#kako-funkcionise"
            className="text-ink hover:text-action inline-flex min-h-11 items-center font-semibold"
          >
            {t("advice")}
          </Link>
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="#"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {t("login")}
          </Link>
          <Link
            href="#prodavci"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            {t("addListing")}
          </Link>
        </div>
        <Link
          href="#prodavci"
          className={buttonVariants({
            variant: "primary",
            size: "sm",
            className: "sm:hidden",
          })}
        >
          {t("addListing")}
        </Link>
      </div>
    </header>
  );
}
