// ═══ INTERNATIONALIZATION (i18n) ═══════════════════════════════════════════
// Usage: const { t, lang, setLang } = useT();
//        t("common.save")          → "Guardar" / "Save"
//        t("calc.calcular")        → "Calcular materiales" / "Calculate materials"
//
// To add a new language:
//   1. Create src/i18n/pt.js with the same key structure
//   2. Import it here and add to LANGUAGES and TRANSLATIONS

import { createContext, useContext, useState } from "react";
import es from "./es.js";
import en from "./en.js";

export const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇩🇴" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

const TRANSLATIONS = { es, en };
const STORAGE_KEY = "vent_lang";

function getInitialLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && TRANSLATIONS[saved]) return saved;
  // Fallback: detect browser language
  const browser = navigator.language?.slice(0, 2);
  if (browser && TRANSLATIONS[browser]) return browser;
  return "es"; // default
}

// ── Nested key resolver: t("calc.calcular") → obj.calc.calcular ────────────
function resolve(obj, key) {
  return key.split(".").reduce((acc, k) => acc?.[k], obj) ?? key;
}

// ── Context ────────────────────────────────────────────────────────────────
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  function setLang(code) {
    if (!TRANSLATIONS[code]) return;
    localStorage.setItem(STORAGE_KEY, code);
    setLangState(code);
  }

  function t(key, vars) {
    const translations = TRANSLATIONS[lang] || TRANSLATIONS.es;
    let str = resolve(translations, key);
    // Variable interpolation: t("errors.min", { min: 5 }) → "Mínimo 5 caracteres"
    if (vars && typeof str === "string") {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{${k}}`, "g"), v);
      });
    }
    return str;
  }

  return (
    <I18nContext.Provider value={{ t, lang, setLang, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside I18nProvider");
  return ctx;
}
