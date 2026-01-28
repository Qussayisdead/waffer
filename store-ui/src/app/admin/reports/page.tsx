"use client";

import { useI18n } from "../../../admin/i18n";
import { PageHeader } from "../../../admin/components/PageHeader";
import { StatCard } from "../../../admin/components/StatCard";

export default function ReportsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <PageHeader title={t("reports.title")} />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("reports.sales")} value="2,430,000 ₪" />
        <StatCard label={t("reports.discounts")} value="142,000 ₪" />
        <StatCard label={t("reports.activeCards")} value="3,540" />
        <StatCard label={t("reports.stores")} value="210" />
      </div>
      <div className="glass rounded-2xl border border-white/60 p-6">
        <h2 className="text-lg font-semibold text-night">{t("reports.networkTitle")}</h2>
        <p className="mt-2 text-sm text-night/60">{t("reports.networkSubtitle")}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/60 bg-white/60 p-4">
            <div className="text-sm text-night/60">{t("reports.north")}</div>
            <div className="mt-2 text-xl font-semibold text-night">620,000 ₪</div>
          </div>
          <div className="rounded-xl border border-white/60 bg-white/60 p-4">
            <div className="text-sm text-night/60">{t("reports.central")}</div>
            <div className="mt-2 text-xl font-semibold text-night">840,000 ₪</div>
          </div>
          <div className="rounded-xl border border-white/60 bg-white/60 p-4">
            <div className="text-sm text-night/60">{t("reports.west")}</div>
            <div className="mt-2 text-xl font-semibold text-night">970,000 ₪</div>
          </div>
        </div>
      </div>
    </div>
  );
}
