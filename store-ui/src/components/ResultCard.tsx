"use client";

import { useI18n } from "../i18n";

type ResultCardProps = {
  customerName: string;
  storeName?: string | null;
  discountPercent: number;
  amount: number;
  discountAmount: number;
  finalAmount: number;
};

export function ResultCard({
  customerName,
  storeName,
  discountPercent,
  amount,
  discountAmount,
  finalAmount
}: ResultCardProps) {
  const { t } = useI18n();

  const handlePrint = () => {
    const receiptWindow = window.open("", "_blank", "width=400,height=600");
    if (!receiptWindow) return;
    const now = new Date().toLocaleString("ar-EG");
    const congrats = t("result.congrats")
      .replace("{customer}", customerName)
      .replace("{amount}", discountAmount.toFixed(2));
    receiptWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <title>${t("invoice.printReceipt")}</title>
          <style>
            body { font-family: Tahoma, Arial, sans-serif; margin: 16px; }
            .receipt { border: 1px dashed #bbb; padding: 12px; }
            .title { font-size: 16px; margin-bottom: 8px; text-align: center; }
            .row { display: flex; justify-content: space-between; font-size: 13px; margin: 6px 0; }
            .total { font-size: 16px; font-weight: bold; margin-top: 10px; }
            .meta { font-size: 11px; color: #666; text-align: center; margin-top: 10px; }
            .promo { font-size: 12px; margin-top: 10px; text-align: center; color: #0f766e; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="title">${t("result.title")}</div>
            <div class="row"><span>${t("store.name")}</span><span>${storeName || "—"}</span></div>
            <div class="row"><span>${t("customer.name")}</span><span>${customerName}</span></div>
            <div class="row"><span>${t("customer.discount")}</span><span>${discountPercent}%</span></div>
            <div class="row"><span>${t("invoice.amount")}</span><span>${amount.toFixed(2)} ₪</span></div>
            <div class="row"><span>${t("invoice.discountAmount")}</span><span>${discountAmount.toFixed(2)} ₪</span></div>
            <div class="row total"><span>${t("invoice.final")}</span><span>${finalAmount.toFixed(2)} ₪</span></div>
            <div class="promo">${congrats}</div>
            <div class="meta">${now}</div>
          </div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  return (
    <div className="glass rounded-3xl border border-white/70 p-6 shadow-[0_22px_60px_rgba(15,23,42,0.1)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint/15 text-mint">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 12l4 4 12-12" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-ink">{t("result.title")}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
          <div className="text-xs text-night/60">{t("customer.name")}</div>
          <div className="mt-2 text-lg font-semibold text-night">{customerName}</div>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
          <div className="text-xs text-night/60">{t("customer.discount")}</div>
          <div className="mt-2 text-lg font-semibold text-night">{discountPercent}%</div>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
          <div className="text-xs text-night/60">{t("invoice.amount")}</div>
          <div className="mt-2 text-lg font-semibold text-night">{amount.toFixed(2)} ₪</div>
        </div>
        <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
          <div className="text-xs text-night/60">{t("invoice.discountAmount")}</div>
          <div className="mt-2 text-lg font-semibold text-night">
            {discountAmount.toFixed(2)} ₪
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-mint/30 bg-mint/10 px-4 py-3 text-lg font-semibold text-night">
        <span>{t("invoice.final")}</span>
        <span>{finalAmount.toFixed(2)} ₪</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-mint">{t("result.success")}</p>
        <button
          type="button"
          className="rounded-xl border border-night/20 px-4 py-2 text-sm text-night"
          onClick={handlePrint}
        >
          {t("invoice.printReceipt")}
        </button>
      </div>
    </div>
  );
}
