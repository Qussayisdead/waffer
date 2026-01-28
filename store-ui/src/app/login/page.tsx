"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../../i18n";
import { apiRequest } from "../../lib/api";
import { Button } from "../../components/Button";
import { Field } from "../../components/Field";

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
      router.replace("/terminal");
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-md rounded-3xl border border-white/60 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <h1 className="text-2xl font-semibold text-ink">{t("auth.title")}</h1>
        <p className="mt-2 text-sm text-night/60">{t("app.subtitle")}</p>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 grid gap-4">
          <Field
            label={t("auth.email")}
            data-testid="store-login-email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <Field
            label={t("auth.password")}
            type="password"
            data-testid="store-login-password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        <div className="mt-6">
          <Button type="button" data-testid="store-login-submit" onClick={handleSubmit}>
            {t("auth.login")}
          </Button>
        </div>
      </div>
    </div>
  );
}
