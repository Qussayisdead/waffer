"use client";

import { useEffect, useState } from "react";
import { apiRequest, getCsrfToken } from "../../../lib/api";
import { useI18n } from "../../../admin/i18n";
import { PageHeader } from "../../../admin/components/PageHeader";
import { Input } from "../../../admin/components/Input";
import { Button } from "../../../admin/components/Button";
import { DataTable } from "../../../admin/components/DataTable";
import { ErrorBanner } from "../../../admin/components/ErrorBanner";

type Ad = {
  id: string;
  title: string;
  body: string;
  link_url?: string | null;
  image_url?: string | null;
  is_active: boolean;
};

type AdRow = {
  id: string;
  title: string;
  body: string;
  image: string;
  is_active: string;
  link_url?: string | null;
  image_url?: string | null;
};

export default function AdsPage() {
  const { t } = useI18n();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
  const [rows, setRows] = useState<Ad[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    body: "",
    link_url: "",
    is_active: true
  });

  const loadAds = async () => {
    try {
      setError(null);
      const response = await apiRequest<Ad[]>("/api/v1/ads");
      setRows(response.data);
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const resetForm = () => {
    setForm({ title: "", body: "", link_url: "", is_active: true });
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (id: string) => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await fetch(`${baseUrl}/api/v1/ads/${id}/image`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRF-Token": getCsrfToken() || ""
      },
      body: formData
    });
    if (!response.ok) {
      throw new Error("errors.generic");
    }
  };

  const handleCreate = async () => {
    try {
      setError(null);
      const response = await apiRequest<Ad>("/api/v1/ads", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          link_url: form.link_url || null,
          is_active: form.is_active
        })
      });
      if (imageFile) {
        await uploadImage(response.data.id);
      }
      resetForm();
      await loadAds();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setError(null);
      await apiRequest<Ad>(`/api/v1/ads/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          link_url: form.link_url || null,
          is_active: form.is_active
        })
      });
      if (imageFile) {
        await uploadImage(editing.id);
      }
      resetForm();
      await loadAds();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("ads.confirmDisable"))) return;
    try {
      setError(null);
      await apiRequest(`/api/v1/ads/${id}`, { method: "DELETE" });
      await loadAds();
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  const tableRows: AdRow[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body.length > 80 ? `${row.body.slice(0, 80)}...` : row.body,
    image: row.image_url ? t("ads.imageYes") : t("ads.imageNo"),
    is_active: row.is_active ? t("ads.active") : t("ads.inactive"),
    link_url: row.link_url,
    image_url: row.image_url
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("ads.title")}
        action={
          <Button type="button" variant="ghost" onClick={loadAds}>
            {t("actions.refresh")}
          </Button>
        }
      />
      <ErrorBanner message={error} />
      <div className="glass rounded-3xl border border-white/70 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.08)]">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t("ads.name")}
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <Input
            label={t("ads.link")}
            value={form.link_url}
            onChange={(event) => setForm({ ...form, link_url: event.target.value })}
          />
          <label className="block space-y-2 text-sm md:col-span-2">
            <span className="text-night/70">{t("ads.body")}</span>
            <textarea
              className="min-h-[140px] w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-night outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/60"
              value={form.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
            />
          </label>
          <label className="block space-y-2 text-sm md:col-span-2">
            <span className="text-night/70">{t("ads.image")}</span>
            <input
              className="w-full rounded-2xl border border-night/10 bg-white/90 px-4 py-3 text-night"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setImageFile(file);
                setImagePreview(file ? URL.createObjectURL(file) : (editing?.image_url ? `${baseUrl}${editing.image_url}` : null));
              }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt={form.title || "ad"}
                className="mt-2 h-32 w-full rounded-2xl border border-white/70 object-cover"
              />
            )}
            {!imagePreview && editing?.image_url && (
              <a
                className="mt-2 inline-flex text-sm text-emerald-700"
                href={`${baseUrl}${editing.image_url}`}
                target="_blank"
                rel="noreferrer"
              >
                {t("ads.viewImage")}
              </a>
            )}
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-night/70">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
            />
            {form.is_active ? t("ads.active") : t("ads.inactive")}
          </label>
          {!editing ? (
            <Button type="button" onClick={handleCreate}>
              {t("actions.create")}
            </Button>
          ) : (
            <>
              <Button type="button" onClick={handleUpdate}>
                {t("actions.update")}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                {t("actions.cancel")}
              </Button>
            </>
          )}
        </div>
      </div>

      <DataTable
        columns={[
          { key: "title", label: t("ads.name") },
          { key: "body", label: t("ads.body") },
          { key: "image", label: t("ads.image") },
          { key: "is_active", label: t("ads.status") }
        ]}
        rows={tableRows}
        renderActions={(row) => (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const source = rows.find((item) => item.id === row.id);
                if (!source) return;
                setEditing(source);
                setForm({
                  title: source.title,
                  body: source.body,
                  link_url: source.link_url || "",
                  is_active: source.is_active
                });
                setImagePreview(source.image_url ? `${baseUrl}${source.image_url}` : null);
                setImageFile(null);
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
