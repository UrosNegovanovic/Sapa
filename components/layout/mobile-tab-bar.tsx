import { Heart, Home, Search, UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

const itemClassName =
  "flex min-h-18 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold";

export async function MobileTabBar() {
  const [t, common] = await Promise.all([
    getTranslations("MobileNav"),
    getTranslations("Common"),
  ]);
  const links = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/pretraga", label: t("search"), icon: Search },
  ] as const;
  const comingSoon = [
    { label: t("favorites"), icon: Heart },
    { label: t("profile"), icon: UserRound },
  ] as const;

  return (
    <nav
      aria-label={t("home")}
      className="border-border fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 px-3 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {links.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className={`${itemClassName} text-coffee hover:text-brand`}
            >
              <item.icon aria-hidden="true" className="size-5" />
              {item.label}
            </Link>
          </li>
        ))}
        {comingSoon.map((item) => (
          <li key={item.label}>
            <span className={`${itemClassName} text-coffee cursor-default`}>
              <item.icon aria-hidden="true" className="size-5" />
              <span>
                {item.label}
                <span className="sr-only">: </span>
              </span>
              <span className="bg-cream rounded-full px-1.5 text-[0.6rem] font-bold uppercase">
                {common("comingSoon")}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
