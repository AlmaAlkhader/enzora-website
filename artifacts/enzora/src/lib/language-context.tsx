import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Language, type Translations } from "./translations";

const STORAGE_KEY = "enzora-lang";
const COOKIE_KEY = "lang";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const parts = (document.cookie || "").split("; ");
    for (const part of parts) {
      const idx = part.indexOf("=");
      if (idx === -1) continue;
      if (decodeURIComponent(part.slice(0, idx)) === name) {
        return decodeURIComponent(part.slice(idx + 1));
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  try {
    document.cookie =
      encodeURIComponent(name) +
      "=" +
      encodeURIComponent(value) +
      "; Max-Age=" +
      COOKIE_MAX_AGE_SECONDS +
      "; Path=/; SameSite=Lax";
  } catch {
    // ignore
  }
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function applyLang(lang: Language) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "ar" || stored === "en") return stored;
    } catch {
      // ignore
    }
    const cookieLang = readCookie(COOKIE_KEY);
    if (cookieLang === "ar" || cookieLang === "en") return cookieLang;
    return "en";
  });

  useEffect(() => {
    applyLang(language);
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
    }
    writeCookie(COOKIE_KEY, language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        dir: language === "ar" ? "rtl" : "ltr",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
