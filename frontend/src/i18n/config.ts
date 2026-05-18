import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import huTranslations from './locales/hu.json';

// Type definitions for the resources
export const defaultNS = 'common';
export const resources = {
  en: {
    translation: enTranslations,
  },
  hu: {
    translation: huTranslations,
  },
} as const;

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: 'hu',

    // Have a common namespace used around the full app
    ns: ['translation'],
    defaultNS: 'translation',

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
