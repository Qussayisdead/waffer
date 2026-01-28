"use client";

import { StatCard } from "../../admin/components/StatCard";
import { useI18n } from "../../admin/i18n";

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-night">{t("nav.dashboard")}</h1>
        <p className="mt-2 text-night/60">{t("app.tagline")}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("reports.sales")} value="1,240,000 ₪" />
        <StatCard label={t("reports.discounts")} value="86,500 ₪" />
        <StatCard label={t("reports.activeCards")} value="2,340" />
        <StatCard label={t("reports.stores")} value="120" />
      </div>
    </div>
  );
}
