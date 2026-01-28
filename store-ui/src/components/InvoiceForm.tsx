"use client";

import { Field } from "./Field";
import { Button } from "./Button";
import { useI18n } from "../i18n";

type InvoiceFormProps = {
  amount: number;
  onAmountChange: (value: number) => void;
  onSubmit: () => void;
};

export function InvoiceForm({ amount, onAmountChange, onSubmit }: InvoiceFormProps) {
  const { t } = useI18n();

  return (
    <div className="glass rounded-3xl border border-white/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-night/10 text-night">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 4h10a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <path d="M9 9h6M9 13h6M9 17h4" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-ink">{t("invoice.title")}</h2>
      </div>
      <div className="grid gap-4">
        <Field
          label={t("invoice.amount")}
          type="number"
          value={Number.isNaN(amount) ? "" : amount}
          onChange={(event) => onAmountChange(Number(event.target.value))}
          placeholder="0.00"
        />
        <Field label={t("invoice.currency")} value="₪" readOnly />
      </div>
      <div className="mt-5">
        <Button type="button" onClick={onSubmit}>
          {t("invoice.create")}
        </Button>
      </div>
    </div>
  );
}
