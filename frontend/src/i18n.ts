import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';

export const defaultNS = 'translation';
export const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
} as const;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'en',
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;