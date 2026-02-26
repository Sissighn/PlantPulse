import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationDE from "./locales/de/translation.json";
import translationEN from "./locales/en/translation.json";

// Hier binden wir unsere JSON-Dateien ein
const resources = {
  de: { translation: translationDE },
  en: { translation: translationEN },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "de", // Standardsprache
  fallbackLng: "en", // Falls ein Text auf Deutsch fehlt, nimm Englisch
  interpolation: {
    escapeValue: false, // React schützt bereits vor XSS
  },
});

export default i18n;
