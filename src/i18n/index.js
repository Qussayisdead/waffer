import { messagesAr } from "./messages.ar.js";
import { messagesEn } from "./messages.en.js";

export const dictionaries = {
  ar: messagesAr,
  en: messagesEn
};

export function getMessage(locale, key) {
  const dict = dictionaries[locale] || dictionaries.ar;
  const value = key.split(".").reduce((acc, part) => acc?.[part], dict);
  if (typeof value === "string") return value;
  const fallback = key.split(".").reduce((acc, part) => acc?.[part], dictionaries.ar);
  return typeof fallback === "string" ? fallback : key;
}
