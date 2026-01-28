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
};

type RewardItem = {
  id: string;
  name_ar: string;
  name_en?: string | null;
  type: string;
  points_cost: number;
  value_amount: number;
  currency: string;
  expiry_days: number;
  is_active: boolean;
  store_id: string | null;
  store_name: string | null;
};

export default function RewardsPage() {
  const { t } = useI18n();
  const [stores, setStores] = useState<Store[]>([]);
  const [rows, setRows] = useState<RewardItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<RewardItem | null>(null);
  const [form, setForm] = useState({
    name_ar: "",
    name_en: "",
    type: "voucher",
    points_cost: 100,
    value_amount: 10,
    currency: "ILS",
    expiry_days: 7,
    store_id: ""
  });

  const loadStores = async () => {
    try {
      const response = await apiRequest<Store[]>("/api/v1/stores");
      setStores(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const loadRewards = async () => {
    try {
      const response = await apiRequest<RewardItem[]>("/api/v1/rewards");
      setRows(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    loadStores();
    loadRewards();
  }, []);

  const resetForm = () => {
    setForm({
      name_ar: "",
      name_en: "",
      type: "voucher",
      points_cost: 100,
      value_amount: 10,
      currency: "ILS",
      expiry_days: 7,
      store_id: ""
    });
    setEditing(null);
  };

  const saveReward = async () => {
    try {
      setError(null);
      const payload = {
        name_ar: form.name_ar,
        name_en: form.name_en || null,
        type: form.type,
        points_cost: Number(form.points_cost),
        value_amount: Number(form.value_amount),
        currency: form.currency || "ILS",
        expiry_days: Number(form.expiry_days || 7),
        store_id: form.store_id || null
      };
      if (editing) {
        await apiRequest(`/api/v1/rewards/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest("/api/v1/rewards", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      await loadRewards();
      resetForm();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const disableReward = async (id: string) => {
    if (!confirm(t("rewards.confirmDisable"))) return;
    try {
      setError(null);
      await apiRequest(`/api/v1/rewards/${id}`, { method: "DELETE" });
      await loadRewards();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title={t("rewards.title")} />
      <div className="flex justify-end">
        <Button type="button" variant="ghost" onClick={loadRewards}>
          {t("actions.refresh")}
        </Button>
      </div>
      <ErrorBanner message={error} />
      <div className="glass rounded-2xl border border-white/60 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t("rewards.nameAr")}
            value={form.name_ar}
            onChange={(event) => setForm({ ...form, name_ar: event.target.value })}
          />
          <Input
            label={t("rewards.nameEn")}
            value={form.name_en}
            onChange={(event) => setForm({ ...form, name_en: event.target.value })}
          />
          <Input
            label={t("rewards.pointsCost")}
            type="number"
            value={form.points_cost}
            onChange={(event) => setForm({ ...form, points_cost: Number(event.target.value) })}
          />
          <Input
            label={t("rewards.valueAmount")}
            type="number"
            value={form.value_amount}
            onChange={(event) => setForm({ ...form, value_amount: Number(event.target.value) })}
          />
          <Input
            label={t("rewards.expiryDays")}
            type="number"
            value={form.expiry_days}
            onChange={(event) => setForm({ ...form, expiry_days: Number(event.target.value) })}
          />
          <Input
            label={t("rewards.currency")}
            value={form.currency}
            onChange={(event) => setForm({ ...form, currency: event.target.value })}
          />
          <label className="space-y-2 text-sm">
            <span className="text-night/70">{t("rewards.store")}</span>
            <select
              className="w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-night outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60"
              value={form.store_id}
              onChange={(event) => setForm({ ...form, store_id: event.target.value })}
            >
              <option value="">{t("rewards.global")}</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name_ar || store.name_en}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <Button type="button" onClick={saveReward}>
            {editing ? t("actions.update") : t("actions.create")}
          </Button>
          {editing && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              {t("actions.cancel")}
            </Button>
          )}
        </div>
      </div>

      <DataTable
        columns={[
          { key: "name_ar", label: t("rewards.nameAr") },
          { key: "store_name", label: t("rewards.store") },
          { key: "points_cost", label: t("rewards.pointsCost") },
          { key: "value_amount", label: t("rewards.valueAmount") },
          { key: "expiry_days", label: t("rewards.expiryDays") },
          { key: "currency", label: t("rewards.currency") },
          { key: "is_active", label: t("rewards.status") }
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
                  type: row.type,
                  points_cost: row.points_cost,
                  value_amount: row.value_amount,
                  currency: row.currency,
                  expiry_days: row.expiry_days,
                  store_id: row.store_id || ""
                });
              }}
            >
              {t("actions.edit")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => disableReward(row.id)}>
              {t("actions.delete")}
            </Button>
          </div>
        )}
      />
    </div>
  );
}
