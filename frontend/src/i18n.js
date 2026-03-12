import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Passe die Pfade an dein Projekt an:
import de from "./locales/de/translation.json";
import en from "./locales/en/translation.json";

const savedLang = localStorage.getItem("lang"); // "de" | "en"
const initialLang = savedLang || "de";

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Persistenz bei Sprachwechsel (nur einmal registrieren)
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
});

export default i18n;
