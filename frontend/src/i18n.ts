import i18n from 'i18next';
import { initReactI18next } from 'react-i18next'; // À retirer si Vanilla TS

import fr from './locales/fr.json';
import en from './locales/en.json';

export const defaultNS = 'common';
export const resources = {
  fr: { translation: fr },
  en: { translation: en },
} as const;

i18n
  .use(initReactI18next) // À retirer si Vanilla TS
  .init({
    resources,
    lng: 'fr', // Langue par défaut
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // Inutile avec React car il protège déjà contre le XSS
    },
  });

export default i18n;