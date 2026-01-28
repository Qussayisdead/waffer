"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { useI18n } from "../../../admin/i18n";
import { PageHeader } from "../../../admin/components/PageHeader";
import { DataTable } from "../../../admin/components/DataTable";
import { ErrorBanner } from "../../../admin/components/ErrorBanner";
import { Button } from "../../../admin/components/Button";

type StoreQrToken = {
  id: string;
  token: string;
  card_number: string;
  store_id: string;
  store_name: string | null;
  created_at: string;
  expires_at: string;
  used_at: string | null;
};

type StoreGroup = {
  storeId: string;
  storeName: string;
  rows: StoreQrToken[];
};

export default function StoreQrCodesPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<StoreQrToken[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = async () => {
    try {
      setError(null);
      const response = await apiRequest<StoreQrToken[]>("/api/v1/qr-tokens");
      setRows(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  const grouped = useMemo<StoreGroup[]>(() => {
    const map = new Map<string, StoreGroup>();
    rows.forEach((row) => {
      const storeName = row.store_name || row.store_id;
      const entry = map.get(row.store_id) || {
        storeId: row.store_id,
        storeName,
        rows: []
      };
      entry.rows.push(row);
      map.set(row.store_id, entry);
    });
    return Array.from(map.values());
  }, [rows]);

  const formatTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : "-");

  return (
    <div className="space-y-6">
      <PageHeader title={t("storeQr.title")} />
      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={loadTokens}>
          {t("actions.refresh")}
        </Button>
      </div>
      <ErrorBanner message={error} />
      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-night/70">
          {t("storeQr.empty")}
        </div>
      ) : (
        grouped.map((group) => (
          <div key={group.storeId} className="space-y-3">
            <div className="text-base font-semibold text-night">
              {t("storeQr.store")}: {group.storeName}
            </div>
            <DataTable
              columns={[
                { key: "card_number", label: t("storeQr.cardNumber") },
                { key: "token", label: t("storeQr.token") },
                { key: "created_at", label: t("storeQr.createdAt") },
                { key: "expires_at", label: t("storeQr.expiresAt") },
                { key: "used_at", label: t("storeQr.usedAt") }
              ]}
              rows={group.rows.map((row) => ({
                ...row,
                created_at: formatTime(row.created_at),
                expires_at: formatTime(row.expires_at),
                used_at: formatTime(row.used_at)
              }))}
            />
          </div>
        ))
      )}
    </div>
  );
}
