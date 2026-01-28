"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import ar from "./ar.json";
import en from "./en.json";

type Dict = typeof ar;
type Locale = "ar" | "en";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getValue(dict: Dict, key: string) {
  return key.split(".").reduce((acc, part) => (acc as any)?.[part], dict as any);
}

const dictionaries: Record<Locale, Dict> = {
  ar,
  en
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");
  const dict = useMemo(() => dictionaries[locale], [locale]);

  const t = (key: string) => {
    const value = getValue(dict, key);
    return typeof value === "string" ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
