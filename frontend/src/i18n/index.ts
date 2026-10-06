import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import frTranslation from './fr/translation.json';
import enTranslation from './en/translation.json';
import esTranslation from './es/translation.json';
import ptTranslation from './pt/translation.json';
import swTranslation from './sw/translation.json';
import arTranslation from './ar/translation.json';

const savedLang = localStorage.getItem('novapay_lang') || 'en';
if (typeof document !== 'undefined') {
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      fr: { translation: frTranslation },
      es: { translation: esTranslation },
      pt: { translation: ptTranslation },
      sw: { translation: swTranslation },
      ar: { translation: arTranslation },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('novapay_lang', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

export default i18n;
export * from './languages';
