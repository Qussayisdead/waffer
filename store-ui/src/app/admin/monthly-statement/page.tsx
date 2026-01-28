"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { useI18n } from "../../../admin/i18n";
import { PageHeader } from "../../../admin/components/PageHeader";
import { Button } from "../../../admin/components/Button";
import { DataTable } from "../../../admin/components/DataTable";
import { ErrorBanner } from "../../../admin/components/ErrorBanner";

type Store = {
  id: string;
  name_ar: string;
  name_en?: string | null;
};

type Statement = {
  store: Store;
  period: { year: number; month: number };
  currency: string;
  summary: {
    subtotal: number;
    totalSales: number;
    discountsGiven: number;
    commissionsTotal: number;
    invoiceCount: number;
    averageTicket: number;
    averageDiscountPercent: number;
  };
  daily: {
    bucket: string;
    subtotal: number;
    totalSales: number;
    discountsGiven: number;
    commissionsTotal: number;
    invoiceCount: number;
  }[];
};

export default function MonthlyStatementPage() {
  const { t } = useI18n();
  const [stores, setStores] = useState<Store[]>([]);
  const [statement, setStatement] = useState<Statement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const now = new Date();
  const [form, setForm] = useState({
    store_id: "",
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear())
  });

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await apiRequest<Store[]>("/api/v1/stores");
        setStores(response.data);
        if (!form.store_id && response.data.length > 0) {
          setForm((prev) => ({ ...prev, store_id: response.data[0].id }));
        }
      } catch (err) {
        setError(t((err as Error).message));
      }
    };
    loadStores();
  }, []);

  const handleFetch = async () => {
    try {
      setError(null);
      const response = await apiRequest<Statement>(
        `/api/v1/reports/monthly-statement?store_id=${form.store_id}&month=${form.month}&year=${form.year}`
      );
      setStatement(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const currencySymbol = "₪";

  const printableHtml = useMemo(() => {
    if (!statement) return "";
    const storeName = statement.store.name_ar || statement.store.name_en || "";
    const period = `${statement.period.year}-${String(statement.period.month).padStart(2, "0")}`;
    const rows = statement.daily
      .map(
        (row) => `
        <tr>
          <td>${new Date(row.bucket).toLocaleDateString("ar-EG")}</td>
          <td>${row.subtotal.toFixed(2)} ${currencySymbol}</td>
          <td>${row.discountsGiven.toFixed(2)} ${currencySymbol}</td>
          <td>${row.totalSales.toFixed(2)} ${currencySymbol}</td>
          <td>${row.commissionsTotal.toFixed(2)} ${currencySymbol}</td>
          <td>${row.invoiceCount}</td>
        </tr>
      `
      )
      .join("");
    return `
      <html lang="ar" dir="rtl">
      <head>
        <title>${t("reports.monthlyTitle")}</title>
        <style>
          body { font-family: Tahoma, Arial, sans-serif; margin: 24px; }
          h1 { font-size: 18px; margin-bottom: 6px; }
          .meta { color: #444; font-size: 12px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: right; }
        </style>
      </head>
      <body>
        <h1>${t("reports.monthlyTitle")}</h1>
        <div class="meta">${t("reports.storeLabel")}: ${storeName} | ${t("reports.period")}: ${period}</div>
        <div class="meta">${t("reports.subtotal")}: ${statement.summary.subtotal.toFixed(2)} ${currencySymbol}</div>
        <div class="meta">${t("reports.discounts")}: ${statement.summary.discountsGiven.toFixed(2)} ${currencySymbol}</div>
        <div class="meta">${t("reports.sales")}: ${statement.summary.totalSales.toFixed(2)} ${currencySymbol}</div>
        <div class="meta">${t("reports.commissions")}: ${statement.summary.commissionsTotal.toFixed(2)} ${currencySymbol}</div>
        <div class="meta">${t("reports.invoiceCount")}: ${statement.summary.invoiceCount}</div>
        <table>
          <thead>
            <tr>
              <th>${t("reports.period")}</th>
              <th>${t("reports.subtotal")}</th>
              <th>${t("reports.discounts")}</th>
              <th>${t("reports.sales")}</th>
              <th>${t("reports.commissions")}</th>
              <th>${t("reports.invoiceCount")}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;
  }, [statement, t]);

  const openPrint = () => {
    if (!statement) return;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(printableHtml);
    win.document.close();
    win.focus();
    win.print();
  };

  const storeOptions = stores.map((store) => (
    <option key={store.id} value={store.id}>
      {store.name_ar || store.name_en}
    </option>
  ));

  return (
    <div className="space-y-8">
      <PageHeader title={t("reports.monthlyTitle")} />
      <ErrorBanner message={error} />
      <div className="glass rounded-2xl border border-white/60 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-2 text-sm">
            <span className="text-night/70">{t("reports.storeLabel")}</span>
            <select
              className="w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-night outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60"
              value={form.store_id}
              onChange={(event) => setForm({ ...form, store_id: event.target.value })}
            >
              {storeOptions}
            </select>
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-night/70">{t("reports.monthLabel")}</span>
            <input
              className="w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-night outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60"
              value={form.month}
              onChange={(event) => setForm({ ...form, month: event.target.value })}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-night/70">{t("reports.yearLabel")}</span>
            <input
              className="w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-night outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60"
              value={form.year}
              onChange={(event) => setForm({ ...form, year: event.target.value })}
            />
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="button" onClick={handleFetch}>
            {t("actions.search")}
          </Button>
          <Button type="button" variant="ghost" onClick={openPrint}>
            {t("reports.print")}
          </Button>
          <Button type="button" variant="ghost" onClick={openPrint}>
            {t("reports.exportPdf")}
          </Button>
        </div>
      </div>

      {statement && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="glass rounded-2xl border border-white/60 p-4">
              <div className="text-xs text-night/60">{t("reports.subtotal")}</div>
              <div className="mt-2 text-lg font-semibold text-night">
                {statement.summary.subtotal.toFixed(2)} {currencySymbol}
              </div>
            </div>
            <div className="glass rounded-2xl border border-white/60 p-4">
              <div className="text-xs text-night/60">{t("reports.discounts")}</div>
              <div className="mt-2 text-lg font-semibold text-night">
                {statement.summary.discountsGiven.toFixed(2)} {currencySymbol}
              </div>
            </div>
            <div className="glass rounded-2xl border border-white/60 p-4">
              <div className="text-xs text-night/60">{t("reports.sales")}</div>
              <div className="mt-2 text-lg font-semibold text-night">
                {statement.summary.totalSales.toFixed(2)} {currencySymbol}
              </div>
            </div>
            <div className="glass rounded-2xl border border-white/60 p-4">
              <div className="text-xs text-night/60">{t("reports.commissions")}</div>
              <div className="mt-2 text-lg font-semibold text-night">
                {statement.summary.commissionsTotal.toFixed(2)} {currencySymbol}
              </div>
            </div>
            <div className="glass rounded-2xl border border-white/60 p-4">
              <div className="text-xs text-night/60">{t("reports.invoiceCount")}</div>
              <div className="mt-2 text-lg font-semibold text-night">
                {statement.summary.invoiceCount}
              </div>
            </div>
            <div className="glass rounded-2xl border border-white/60 p-4">
              <div className="text-xs text-night/60">{t("reports.averageTicket")}</div>
              <div className="mt-2 text-lg font-semibold text-night">
                {statement.summary.averageTicket.toFixed(2)} {currencySymbol}
              </div>
            </div>
            <div className="glass rounded-2xl border border-white/60 p-4">
              <div className="text-xs text-night/60">{t("reports.averageDiscountPercent")}</div>
              <div className="mt-2 text-lg font-semibold text-night">
                {statement.summary.averageDiscountPercent.toFixed(2)}%
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-night">{t("reports.dailyBreakdown")}</h2>
            <DataTable
              columns={[
                { key: "bucket", label: t("reports.period") },
                { key: "subtotal", label: t("reports.subtotal") },
                { key: "discountsGiven", label: t("reports.discounts") },
                { key: "totalSales", label: t("reports.sales") },
                { key: "commissionsTotal", label: t("reports.commissions") },
                { key: "invoiceCount", label: t("reports.invoiceCount") }
              ]}
              rows={statement.daily.map((row) => ({
                ...row,
                bucket: new Date(row.bucket).toLocaleDateString("ar-EG"),
                subtotal: `${row.subtotal.toFixed(2)} ${currencySymbol}`,
                discountsGiven: `${row.discountsGiven.toFixed(2)} ${currencySymbol}`,
                totalSales: `${row.totalSales.toFixed(2)} ${currencySymbol}`,
                commissionsTotal: `${row.commissionsTotal.toFixed(2)} ${currencySymbol}`
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
