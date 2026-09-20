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

// Récupère la langue sauvegardée dans localStorage, sinon utilise 'fr'
// Vérifie si on est dans un navigateur (localStorage n'existe pas en SSR)
const isBrowser = typeof window !== 'undefined';
const savedLanguage = isBrowser ? localStorage.getItem('language') || 'fr' : 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });

// Sauvegarde la langue dans localStorage quand elle change (uniquement dans le navigateur)
if (isBrowser) {
  i18n.on('languageChanged', (lng) => {
    localStorage.setItem('language', lng);
  });
}

export default i18n;