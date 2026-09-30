import { Heart, Home, Search, UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function MobileTabBar() {
  const t = await getTranslations("MobileNav");
  const items = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/pretraga", label: t("search"), icon: Search },
    { href: "#", label: t("favorites"), icon: Heart },
    { href: "#", label: t("profile"), icon: UserRound },
  ] as const;

  return (
    <nav
      aria-label={t("home")}
      className="border-border fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 px-3 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-coffee hover:text-brand flex min-h-18 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold"
            >
              <item.icon aria-hidden="true" className="size-5" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
