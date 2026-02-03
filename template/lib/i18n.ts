import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { getLocales } from 'expo-localization';
import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import de from '../locales/de/common.json';
import tr from '../locales/tr/common.json';

const resources = {
  en: { common: en },
  es: { common: es },
  de: { common: de },
  tr: { common: tr },
};

const getDeviceLanguage = () => {
  const locales = getLocales();
  return locales[0]?.languageCode || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    ns: ['common'],
    defaultNS: 'common',
  });

export default i18n;
