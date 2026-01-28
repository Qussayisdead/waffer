"use client";

import { useState } from "react";
import { apiRequest } from "../../../lib/api";
import { Button } from "../../../components/Button";
import { Field } from "../../../components/Field";

export default function VipCardApplicationPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: ""
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("يرجى إدخال الاسم الكامل.");
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      setError("يرجى إدخال رقم الهاتف أو البريد الإلكتروني.");
      return;
    }
    try {
      setError(null);
      setIsSubmitting(true);
      await apiRequest("/api/v1/public/card-applications", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || null,
          email: form.email || null,
          city: form.city || null,
          card_type: "golden"
        })
      });
      setSubmitted(true);
      setForm({ name: "", phone: "", email: "", city: "" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6" dir="rtl">
      <div className="glass w-full max-w-lg rounded-3xl border border-white/60 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="space-y-3 text-right">
          <h1 className="text-2xl font-semibold text-ink">طلب البطاقة الذهبية</h1>
          <p className="text-sm text-night/70">
            املأ البيانات التالية وسيتواصل معك فريقنا لإكمال طلب بطاقة كبار العملاء.
          </p>
        </div>
        {submitted ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            تم استلام طلبك بنجاح. سنقوم بالتواصل معك قريبًا.
          </div>
        ) : (
          <>
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
                label="المدينة"
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
              />
            </div>
            <div className="mt-6">
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
