"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { useI18n } from "../../../admin/i18n";
import { PageHeader } from "../../../admin/components/PageHeader";
import { Input } from "../../../admin/components/Input";
import { Button } from "../../../admin/components/Button";
import { DataTable } from "../../../admin/components/DataTable";
import { ErrorBanner } from "../../../admin/components/ErrorBanner";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  store_id?: string | null;
};

export default function UsersPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "store",
    store_id: ""
  });

  const loadUsers = async () => {
    try {
      setError(null);
      const response = await apiRequest<User[]>("/api/v1/users");
      setRows(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async () => {
    try {
      setError(null);
      await apiRequest<User>("/api/v1/users", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          store_id: form.role === "store" ? form.store_id : undefined
        })
      });
      setForm({ name: "", email: "", password: "", role: "store", store_id: "" });
      await loadUsers();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title={t("users.title")} />
      <ErrorBanner message={error} />
      <div className="glass rounded-2xl border border-white/60 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label={t("users.name")}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            label={t("users.email")}
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <label className="block space-y-2 text-sm">
            <span className="text-night/70">{t("users.password")}</span>
            <span className="inline-block text-xs text-emerald-700 ms-2">{t("users.passwordHint")}</span>
            <input
              className="w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-night outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60"
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-night/70">{t("users.role")}</span>
            <select
              className="w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-night outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
            >
              <option value="admin">{t("users.admin")}</option>
              <option value="store">{t("users.store")}</option>
            </select>
          </label>
          <Input
            label={t("users.storeId")}
            value={form.store_id}
            onChange={(event) => setForm({ ...form, store_id: event.target.value })}
          />
        </div>
        <div className="mt-4">
          <Button type="button" onClick={handleCreate}>
            {t("actions.create")}
          </Button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "id", label: "ID" },
          { key: "name", label: t("users.name") },
          { key: "email", label: t("users.email") },
          { key: "role", label: t("users.role") },
          { key: "store_id", label: t("users.storeId") }
        ]}
        rows={rows}
      />
    </div>
  );
}
