"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../../i18n";
import { apiRequest } from "../../lib/api";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { ErrorBanner } from "../../components/ErrorBanner";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const stored = localStorage.getItem("auth_error");
    if (stored) {
      setError(stored);
      localStorage.removeItem("auth_error");
    }
  }, []);

  const handleSubmit = async () => {
    try {
      setError(null);
      const response = await apiRequest<{ token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      localStorage.setItem("auth_token", response.data.token);
      router.replace("/");
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-6">
      <div className="glass w-full max-w-md rounded-3xl border border-white/60 p-8">
        <h1 className="text-2xl font-semibold text-ink">{t("auth.title")}</h1>
        <p className="mt-2 text-sm text-dusk/70">{t("app.tagline")}</p>
        <ErrorBanner message={error} />
        <div className="mt-6 grid gap-4">
          <Input
            label={t("auth.email")}
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <Input
            label={t("auth.password")}
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        <div className="mt-6">
          <Button type="button" onClick={handleSubmit}>
            {t("auth.login")}
          </Button>
        </div>
      </div>
    </div>
  );
}
