import fs from "node:fs";
import path from "node:path";

const localesDir = path.resolve("src", "locales");
const cache = new Map();

function loadLocale(lang) {
  if (cache.has(lang)) return cache.get(lang);
  const filePath = path.join(localesDir, `${lang}.json`);
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  cache.set(lang, data);
  return data;
}

function resolveLang(req) {
  const queryLang = req.query.lang;
  if (typeof queryLang === "string" && queryLang.length > 0) return queryLang;
  const header = req.headers["accept-language"];
  if (!header) return "ar";
  const first = header.split(",")[0]?.trim();
  return first?.split("-")[0] || "ar";
}

function getValue(obj, key) {
  return key.split(".").reduce((acc, part) => acc?.[part], obj);
}

export function localization(req, res, next) {
  const lang = resolveLang(req);
  const primary = ["ar", "en"].includes(lang) ? lang : "ar";
  const primaryLocale = loadLocale(primary);
  const fallbackLocale = primary === "ar" ? null : loadLocale("ar");

  req.lang = primary;
  req.t = (key, params = {}) => {
    let value = getValue(primaryLocale, key);
    if (value == null && fallbackLocale) value = getValue(fallbackLocale, key);
    if (typeof value !== "string") return key;
    return Object.keys(params).reduce((acc, paramKey) => {
      return acc.replaceAll(`{${paramKey}}`, String(params[paramKey]));
    }, value);
  };

  res.locals.lang = primary;
  next();
}
