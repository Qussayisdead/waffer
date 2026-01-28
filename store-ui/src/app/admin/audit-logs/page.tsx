"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { useI18n } from "../../../admin/i18n";
import { PageHeader } from "../../../admin/components/PageHeader";
import { DataTable } from "../../../admin/components/DataTable";
import { ErrorBanner } from "../../../admin/components/ErrorBanner";
import { Button } from "../../../admin/components/Button";

type AuditRow = {
  id: string;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  created_at: string;
};

export default function AuditLogsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      setError(null);
      const response = await apiRequest<AuditRow[]>("/api/v1/audit-logs");
      setRows(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title={t("audit.title")} />
      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={loadLogs}>
          {t("actions.refresh")}
        </Button>
      </div>
      <ErrorBanner message={error} />
      <DataTable
        columns={[
          { key: "created_at", label: t("audit.date") },
          { key: "actor_name", label: t("audit.actor") },
          { key: "actor_role", label: t("audit.role") },
          { key: "action", label: t("audit.action") },
          { key: "entity", label: t("audit.entity") },
          { key: "entity_id", label: t("audit.entityId") }
        ]}
        rows={rows.map((row) => ({
          ...row,
          created_at: new Date(row.created_at).toLocaleString("ar-EG")
        }))}
      />
    </div>
  );
}
