import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslation from './fr/translation.json';
import enTranslation from './en/translation.json';

const savedLang = localStorage.getItem('novapay_lang') || 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: frTranslation },
      en: { translation: enTranslation },
    },
    lng: savedLang,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('novapay_lang', lng);
  document.documentElement.lang = lng;
});

export default i18n;
