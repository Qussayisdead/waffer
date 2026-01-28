"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../../../lib/api";
import { Button } from "../../../../components/Button";
import { Field } from "../../../../components/Field";

export default function CustomerSignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });

  const handleSubmit = async () => {
    try {
      setError(null);
      await apiRequest("/api/v1/auth/customer/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          email: form.email || null,
          password: form.password
        })
      });
      const response = await apiRequest<{ token: string }>("/api/v1/auth/customer/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email || null,
          phone: form.phone || null,
          password: form.password
        })
      });
      router.replace("/customer");
    } catch (err) {
      setError((err as Error).message);
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
            <h1 className="text-2xl font-semibold text-ink">إنشاء حساب عميل</h1>
            <p className="mt-1 text-sm text-night/60">
              أنشئ حسابك للوصول إلى بطاقة التوفير الخاصة بك.
            </p>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <div className="mt-6 grid gap-4">
          <Field
            label="الاسم الكامل"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Field
            label="رقم الهاتف"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
          <Field
            label="البريد الإلكتروني"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <Field
            label="كلمة المرور"
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </div>
        <div className="mt-6 space-y-4">
          <Button type="button" onClick={handleSubmit}>
            إنشاء حساب
          </Button>
          <a className="block text-sm text-emerald-700" href="/customer/login">
            لديك حساب بالفعل؟ تسجيل الدخول
          </a>
        </div>
      </div>
    </div>
  );
}
