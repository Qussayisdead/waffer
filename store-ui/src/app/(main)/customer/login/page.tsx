"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../../../../i18n";
import { apiRequest } from "../../../../lib/api";
import { Button } from "../../../../components/Button";
import { Field } from "../../../../components/Field";

export default function CustomerLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async () => {
    try {
      setError(null);
      const response = await apiRequest<{ token: string }>("/api/v1/auth/customer/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email || null,
          password: form.password
        })
      });
      router.replace("/customer");
    } catch (err) {
      setError(t((err as Error).message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-md rounded-3xl border border-white/60 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <img className="h-10 w-10 object-contain" src="/logo.png" alt="وفّر كاش" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-ink">{t("auth.title")}</h1>
            <p className="mt-1 text-sm text-night/60">{t("app.subtitle")}</p>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 grid gap-4">
          <Field
            label={t("auth.email")}
            data-testid="customer-login-email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <Field
            label={t("auth.password")}
            type="password"
            data-testid="customer-login-password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        <div className="mt-6 space-y-4">
          <Button type="button" data-testid="customer-login-submit" onClick={handleSubmit}>
            {t("auth.login")}
          </Button>
          <a className="block text-sm text-emerald-700" href="/customer/signup">
            ليس لديك حساب؟ سجّل الآن
          </a>
        </div>
      </div>
    </div>
  );
}
