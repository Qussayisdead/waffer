"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { apiRequest } from "../../lib/api";

export function Topbar() {
  const { locale, setLocale, t } = useI18n();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiRequest<{ name: string }>("/api/v1/auth/me");
        setName(response.data.name);
      } catch {
        setName("");
      }
    };
    loadProfile();
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-white/60 px-8 py-6">
      <div>
        <div className="text-lg font-semibold text-night">{t("app.name")}</div>
        <div className="text-xs text-night/60">
          {t("common.hello")} {name || t("common.user")}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="rounded-full border border-night/20 px-4 py-2 text-sm text-night hover:border-emerald-300"
          onClick={async () => {
            try {
              await apiRequest("/api/v1/auth/logout", { method: "POST" });
            } finally {
              window.location.href = "/admin/login";
            }
          }}
          type="button"
        >
          {t("auth.logout")}
        </button>
        <button
          className="rounded-full border border-night/20 px-4 py-2 text-sm text-night hover:border-emerald-300"
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          type="button"
        >
          {locale === "ar" ? "EN" : "عربي"}
        </button>
      </div>
    </header>
  );
}
