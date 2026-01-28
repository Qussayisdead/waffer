"use client";

import { useI18n } from "../i18n";

export function Topbar() {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="flex items-center justify-between border-b border-white/60 px-8 py-6">
      <div className="text-lg font-semibold text-ink">{t("app.name")}</div>
      <div className="flex items-center gap-3">
        <button
          className="rounded-full border border-dusk/20 px-4 py-2 text-sm text-dusk hover:border-dusk/40"
          onClick={() => {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }}
          type="button"
        >
          {t("auth.logout")}
        </button>
        <button
          className="rounded-full border border-dusk/20 px-4 py-2 text-sm text-dusk hover:border-dusk/40"
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          type="button"
        >
          {locale === "ar" ? "EN" : "عربي"}
        </button>
      </div>
    </header>
  );
}
