"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../../../admin/i18n";
import { apiRequest } from "../../../lib/api";
import { Button } from "../../../admin/components/Button";
import { Input } from "../../../admin/components/Input";
import { ErrorBanner } from "../../../admin/components/ErrorBanner";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async () => {
    try {
      setError(null);
      const response = await apiRequest<{ token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      router.replace("/admin");
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-6">
      <div className="glass w-full max-w-md rounded-3xl border border-white/60 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <img className="h-10 w-10 object-contain" src="/logo.png" alt="وفّر كاش" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-night">{t("auth.title")}</h1>
            <p className="mt-1 text-sm text-night/60">{t("app.tagline")}</p>
          </div>
        </div>
        <ErrorBanner message={error} />
        <div className="mt-6 grid gap-4">
          <Input
            label={t("auth.email")}
            data-testid="admin-login-email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <Input
            label={t("auth.password")}
            type="password"
            data-testid="admin-login-password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        <div className="mt-6">
          <Button type="button" data-testid="admin-login-submit" onClick={handleSubmit}>
            {t("auth.login")}
          </Button>
        </div>
      </div>
    </div>
  );
}
