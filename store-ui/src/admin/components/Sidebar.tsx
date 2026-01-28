"use client";

import Link from "next/link";
import { useI18n } from "../i18n";

const navItems = [
  {
    key: "nav.dashboard",
    href: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 13.5L12 4l9 9" />
        <path d="M5 10.5V20h14v-9.5" />
      </svg>
    )
  },
  {
    key: "nav.stores",
    href: "/admin/stores",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 10h18" />
        <path d="M5 10l1-5h12l1 5" />
        <path d="M6 10v9h12v-9" />
      </svg>
    )
  },
  {
    key: "nav.customersCards",
    href: "/admin/customers-cards",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    )
  },
  {
    key: "nav.rewards",
    href: "/admin/rewards",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3l3 6 6 1-4.5 4.2 1.2 6L12 17l-5.7 3.2 1.2-6L3 10l6-1z" />
      </svg>
    )
  },
  {
    key: "nav.vouchers",
    href: "/admin/vouchers",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 7h16v10H4z" />
        <path d="M8 7v10" />
        <circle cx="14" cy="12" r="2.2" />
      </svg>
    )
  },
  {
    key: "nav.audit",
    href: "/admin/audit-logs",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M6 5h12v14H6z" />
        <path d="M9 9h6M9 13h6M9 17h4" />
      </svg>
    )
  },
  {
    key: "nav.storeQr",
    href: "/admin/store-qr-codes",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="4" y="4" width="6" height="6" />
        <rect x="14" y="4" width="6" height="6" />
        <rect x="4" y="14" width="6" height="6" />
        <path d="M14 14h3v3h3" />
      </svg>
    )
  },
  {
    key: "nav.ads",
    href: "/admin/ads",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 7h10l6-3v16l-6-3H4z" />
        <path d="M4 7v10" />
      </svg>
    )
  },
  {
    key: "nav.reports",
    href: "/admin/reports",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M5 20V9" />
        <path d="M10 20V4" />
        <path d="M15 20v-6" />
        <path d="M20 20v-11" />
      </svg>
    )
  },
  {
    key: "nav.monthlyStatement",
    href: "/admin/monthly-statement",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4" />
        <path d="M8 12h8M8 16h5" />
      </svg>
    )
  },
  {
    key: "nav.users",
    href: "/admin/users",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 20c0-3.2 3-5.2 6-5.2" />
        <circle cx="17" cy="9" r="2.6" />
        <path d="M14.5 20c.4-2.2 2.3-3.8 4.5-3.8" />
      </svg>
    )
  },
  {
    key: "nav.cardApplications",
    href: "/admin/card-applications",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    )
  }
];

export function Sidebar() {
  const { t } = useI18n();

  return (
    <aside className="glass w-72 shrink-0 border-l border-white/50 px-6 py-8">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
          <img className="h-10 w-10 object-contain" src="/logo.png" alt="وفّر كاش" />
        </div>
        <div>
          <div className="text-xl font-semibold text-night">{t("app.name")}</div>
          <p className="text-xs text-night/60">{t("app.tagline")}</p>
        </div>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.key}
            className="flex items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-base text-night transition hover:border-emerald-300 hover:bg-white/80"
            href={item.href}
          >
            <span className="text-emerald-700">{item.icon}</span>
            {t(item.key)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
