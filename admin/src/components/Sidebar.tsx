"use client";

import Link from "next/link";
import { useI18n } from "../i18n";

const navItems = [
  { key: "nav.dashboard", href: "/" },
  { key: "nav.stores", href: "/stores" },
  { key: "nav.customersCards", href: "/customers-cards" },
  { key: "nav.reports", href: "/reports" },
  { key: "nav.monthlyStatement", href: "/monthly-statement" },
  { key: "nav.users", href: "/users" }
];

export function Sidebar() {
  const { t } = useI18n();

  return (
    <aside className="glass w-72 shrink-0 border-l border-white/50 px-6 py-8">
      <div className="mb-10">
        <div className="text-2xl font-semibold text-dusk">{t("app.name")}</div>
        <p className="text-sm text-dusk/70">{t("app.tagline")}</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.key}
            className="block rounded-xl border border-transparent px-4 py-3 text-base text-ink transition hover:border-clay/40 hover:bg-white/70"
            href={item.href}
          >
            {t(item.key)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
