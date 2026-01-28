"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { useI18n } from "../../../admin/i18n";
import { PageHeader } from "../../../admin/components/PageHeader";
import { DataTable } from "../../../admin/components/DataTable";
import { ErrorBanner } from "../../../admin/components/ErrorBanner";
import { Button } from "../../../admin/components/Button";

type VoucherRow = {
  id: string;
  code: string;
  reward_name: string;
  value_amount: number;
  currency: string;
  expires_at: string;
  used_at: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  store_id: string | null;
};

export default function VouchersPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<VoucherRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadVouchers = async () => {
    try {
      setError(null);
      const response = await apiRequest<VoucherRow[]>("/api/v1/vouchers");
      setRows(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString("ar-EG") : "-";

  return (
    <div className="space-y-6">
      <PageHeader title={t("vouchers.title")} />
      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={loadVouchers}>
          {t("actions.refresh")}
        </Button>
      </div>
      <ErrorBanner message={error} />
      <DataTable
        columns={[
          { key: "reward_name", label: t("vouchers.reward") },
          { key: "code", label: t("vouchers.code") },
          { key: "customer_name", label: t("vouchers.customer") },
          { key: "value_amount", label: t("vouchers.value") },
          { key: "expires_at", label: t("vouchers.expiresAt") },
          { key: "used_at", label: t("vouchers.usedAt") }
        ]}
        rows={rows.map((row) => ({
          ...row,
          value_amount: `${row.value_amount} ${row.currency}`,
          expires_at: formatDate(row.expires_at),
          used_at: formatDate(row.used_at)
        }))}
      />
    </div>
  );
}
