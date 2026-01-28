"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { useI18n } from "../../../admin/i18n";
import { PageHeader } from "../../../admin/components/PageHeader";
import { DataTable } from "../../../admin/components/DataTable";
import { ErrorBanner } from "../../../admin/components/ErrorBanner";

type CardApplication = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  status: string;
  created_at: string;
  card_type: string;
};

export default function CardApplicationsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<CardApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setError(null);
      const response = await apiRequest<CardApplication[]>("/api/v1/card-applications");
      const mapped = response.data.map((item) => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleString("ar-EG")
      }));
      setRows(mapped);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setError(null);
      setUpdatingId(id);
      await apiRequest(`/api/v1/card-applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await loadApplications();
    } catch (err) {
      setError(t((err as Error).message));
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title={t("cardApplications.title")} />
      <ErrorBanner message={error} />
      <DataTable
        columns={[
          { key: "name", label: t("cardApplications.name") },
          { key: "phone", label: t("cardApplications.phone") },
          { key: "email", label: t("cardApplications.email") },
          { key: "city", label: t("cardApplications.city") },
          { key: "card_type", label: t("cardApplications.cardType") },
          { key: "status", label: t("cardApplications.status") },
          { key: "created_at", label: t("cardApplications.createdAt") }
        ]}
        rows={rows}
        actionsLabel={t("cardApplications.actions")}
        renderActions={(row) => (
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-xl border border-night/20 bg-white/90 px-3 py-2 text-xs text-night outline-none focus:border-emerald-500"
              value={row.status}
              onChange={(event) => handleStatusUpdate(row.id, event.target.value)}
              disabled={updatingId === row.id}
            >
              <option value="pending">{t("cardApplications.pending")}</option>
              <option value="completed">{t("cardApplications.completed")}</option>
              <option value="rejected">{t("cardApplications.rejected")}</option>
            </select>
          </div>
        )}
      />
    </div>
  );
}
