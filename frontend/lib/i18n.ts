import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import sq from '../locales/sq.json';

const resources = {
  en: {
    translation: en,
  },
  sq: {
    translation: sq,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined'
      ? localStorage.getItem('language') || 'en'
      : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
