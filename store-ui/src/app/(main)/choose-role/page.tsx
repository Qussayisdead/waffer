"use client";

export default function ChooseRolePage() {
  const roleIcons = [
    <svg key="admin" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="7.5" r="3" />
      <path d="M4 20a8 8 0 0 1 16 0" />
      <path d="M12 11.5v4" />
      <path d="M10.5 14h3" />
    </svg>,
    <svg key="store" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 10h16M6 10l1-6h10l1 6" />
      <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
      <path d="M9 19v-6h6v6" />
    </svg>,
    <svg key="customer" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-white px-6 py-16 text-black">
      <div className="pointer-events-none absolute inset-0">
        <span
          className="absolute right-[6%] top-[8%] text-7xl font-semibold text-black/5 animate-float-slow"
          style={{ animationDelay: "0s" }}
        >
          خصومات
        </span>
        <span
          className="absolute left-[6%] top-[22%] text-8xl font-semibold text-emerald-700/10 animate-float-slow"
          style={{ animationDelay: "1.2s" }}
        >
          توفير
        </span>
        <span
          className="absolute right-[10%] top-[42%] text-8xl font-semibold text-black/5 animate-float-slow"
          style={{ animationDelay: "2s" }}
        >
          20%
        </span>
        <span
          className="absolute left-[18%] bottom-[18%] text-8xl font-semibold text-emerald-700/10 animate-float-slow"
          style={{ animationDelay: "2.8s" }}
        >
          50%
        </span>
        <span
          className="absolute right-[28%] bottom-[10%] text-7xl font-semibold text-black/5 animate-float-slow"
          style={{ animationDelay: "3.6s" }}
        >
          40%
        </span>
        <span
          className="absolute right-[36%] top-[28%] text-7xl font-semibold text-emerald-700/10 animate-float-slow"
          style={{ animationDelay: "1.8s" }}
        >
          هدايا
        </span>
        <span
          className="absolute left-[36%] bottom-[8%] text-7xl font-semibold text-black/5 animate-float-slow"
          style={{ animationDelay: "2.4s" }}
        >
          عروض
        </span>
      </div>
      <div className="relative mx-auto max-w-5xl space-y-10">
        <header className="text-center">
          <p className="text-sm text-emerald-700">سجل الآن</p>
          <h1 className="mt-2 text-3xl font-semibold">اختر طريقة الدخول</h1>
          <p className="mt-3 text-sm text-black/60">
            اختر الدور المناسب للانتقال إلى لوحة التحكم الخاصة بك.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "المدير",
              desc: "إدارة المتاجر، المستخدمين، والإعلانات من لوحة تحكم كاملة.",
              href: "/admin/login"
            },
            {
              title: "صاحب المتجر / الكاشير",
              desc: "تشغيل نقطة البيع وإدارة خصومات العملاء بكل سهولة.",
              href: "/login"
            },
            {
              title: "العميل",
              desc: "إنشاء بطاقة التوفير الرقمية وربطها بالمتاجر.",
              href: "/customer/login"
            }
          ].map((role, index) => (
            <div
              className="flex h-full flex-col justify-between rounded-3xl border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(0,0,0,0.08)]"
              key={role.title}
            >
              <div className="space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  {roleIcons[index]}
                </div>
                <h2 className="text-lg font-semibold text-black">{role.title}</h2>
                <p className="text-sm leading-relaxed text-black/60">{role.desc}</p>
              </div>
              <a
                className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                href={role.href}
              >
                متابعة
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
