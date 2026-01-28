"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { useI18n } from "../../../admin/i18n";
import { PageHeader } from "../../../admin/components/PageHeader";
import { Input } from "../../../admin/components/Input";
import { Button } from "../../../admin/components/Button";
import { DataTable } from "../../../admin/components/DataTable";
import { ErrorBanner } from "../../../admin/components/ErrorBanner";

type Store = {
  id: string;
  name_ar: string;
  name_en?: string | null;
  max_discount_percent: number;
  commission_percent: number;
  is_active: boolean;
};

export default function StoresPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Store[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name_ar: "",
    name_en: "",
    max_discount_percent: 10,
    commission_percent: 0
  });
  const [editing, setEditing] = useState<Store | null>(null);

  const loadStores = async () => {
    try {
      setError(null);
      const response = await apiRequest<Store[]>("/api/v1/stores");
      setRows(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleCreate = async () => {
    try {
      setError(null);
      await apiRequest<Store>("/api/v1/stores", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          max_discount_percent: Number(form.max_discount_percent),
          commission_percent: Number(form.commission_percent)
        })
      });
      setForm({ name_ar: "", name_en: "", max_discount_percent: 10, commission_percent: 0 });
      await loadStores();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setError(null);
      await apiRequest<Store>(`/api/v1/stores/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          max_discount_percent: Number(form.max_discount_percent),
          commission_percent: Number(form.commission_percent)
        })
      });
      setEditing(null);
      setForm({ name_ar: "", name_en: "", max_discount_percent: 10, commission_percent: 0 });
      await loadStores();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    try {
      setError(null);
      await apiRequest(`/api/v1/stores/${id}`, { method: "DELETE" });
      await loadStores();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("stores.title")}
        action={
          <Button type="button" onClick={loadStores} variant="ghost">
            {t("actions.refresh")}
          </Button>
        }
      />
      <ErrorBanner message={error} />
      <div className="glass rounded-2xl border border-white/60 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Input
            label={t("stores.nameAr")}
            value={form.name_ar}
            onChange={(event) => setForm({ ...form, name_ar: event.target.value })}
          />
          <Input
            label={t("stores.nameEn")}
            value={form.name_en}
            onChange={(event) => setForm({ ...form, name_en: event.target.value })}
          />
          <Input
            label={t("stores.maxDiscount")}
            type="number"
            value={form.max_discount_percent}
            onChange={(event) =>
              setForm({ ...form, max_discount_percent: Number(event.target.value) })
            }
          />
          <Input
            label={t("stores.commission")}
            type="number"
            value={form.commission_percent}
            onChange={(event) =>
              setForm({ ...form, commission_percent: Number(event.target.value) })
            }
          />
        </div>
        <div className="mt-4 flex gap-3">
          {!editing ? (
            <Button type="button" onClick={handleCreate}>
              {t("actions.create")}
            </Button>
          ) : (
            <>
              <Button type="button" onClick={handleUpdate}>
                {t("actions.update")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                {t("actions.cancel")}
              </Button>
            </>
          )}
        </div>
      </div>
      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "name_ar", label: t("stores.nameAr") },
          { key: "max_discount_percent", label: t("stores.maxDiscount") },
          { key: "commission_percent", label: t("stores.commission") },
          { key: "is_active", label: t("stores.status") }
        ]}
        rows={rows}
        renderActions={(row) => (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(row);
                setForm({
                  name_ar: row.name_ar,
                  name_en: row.name_en || "",
                  max_discount_percent: row.max_discount_percent,
                  commission_percent: row.commission_percent
                });
              }}
            >
              {t("actions.edit")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => handleDelete(row.id)}>
              {t("actions.delete")}
            </Button>
          </div>
        )}
      />
    </div>
  );
}
